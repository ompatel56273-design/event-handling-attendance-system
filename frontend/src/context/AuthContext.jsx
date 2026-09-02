import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('role');
      const savedSessionId = localStorage.getItem('sessionId');

      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setToken(savedToken);
          setUser(res.data.user);
          setRole(res.data.role);
          if (res.data.sessionId) {
            setSessionId(res.data.sessionId);
            localStorage.setItem('sessionId', res.data.sessionId);
          }
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('role', res.data.role);
        } catch (err) {
          // Token invalid or session superseded
          const isSuperseded = err.response?.data?.code === 'SESSION_SUPERSEDED';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          localStorage.removeItem('sessionId');
          setToken(null);
          setUser(null);
          setRole(null);
          setSessionId(null);
          if (isSuperseded && window.location.pathname !== '/login') {
            window.location.href = '/login?reason=session_superseded';
          }
        }
      } else if (savedUser && savedRole) {
        try { setUser(JSON.parse(savedUser)); } catch (e) {}
        setRole(savedRole);
        if (savedSessionId) setSessionId(savedSessionId);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, role: newRole, user: userData, sessionId: newSessionId } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', newRole);
    if (newSessionId) {
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
      // Broadcast to all other tabs to terminate old admin sessions
      try {
        const channel = new BroadcastChannel('admin_single_session_channel');
        channel.postMessage({ type: 'ADMIN_SESSION_STARTED', sessionId: newSessionId });
        channel.close();
      } catch (e) {}
    }
    setToken(newToken);
    setUser(userData);
    setRole(newRole);
    return newRole;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('sessionId');
    setToken(null);
    setUser(null);
    setRole(null);
    setSessionId(null);
  };

  // 15-minute Inactivity Auto-Logout for SuperAdmin on dashboard
  useEffect(() => {
    if (!token || role !== 'SUPER_ADMIN') return;

    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
    let timeoutId;

    const handleIdleLogout = () => {
      logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=idle_timeout';
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleIdleLogout, IDLE_TIMEOUT_MS);
    };

    // User activity listeners
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Initialize timer
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [token, role]);

  // Single Active Admin Session Conflict Listener (BroadcastChannel & Storage Event)
  useEffect(() => {
    if (role !== 'SUPER_ADMIN' || !token) return;

    let channel;
    try {
      channel = new BroadcastChannel('admin_single_session_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ADMIN_SESSION_STARTED') {
          const incomingSessionId = event.data.sessionId;
          const currentSessionId = localStorage.getItem('sessionId') || sessionId;
          if (incomingSessionId && currentSessionId && incomingSessionId !== currentSessionId) {
            // Another tab or device started a newer admin session!
            logout();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?reason=session_superseded';
            }
          }
        }
      };
    } catch (e) {}

    // Verify session whenever window/tab regains focus (e.g. user switches back from phone/other app)
    const handleWindowFocus = async () => {
      const activeToken = localStorage.getItem('token');
      const activeRole = localStorage.getItem('role');
      if (activeToken && activeRole === 'SUPER_ADMIN') {
        try {
          await api.get('/auth/me');
        } catch (err) {
          if (err.response?.data?.code === 'SESSION_SUPERSEDED') {
            logout();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?reason=session_superseded';
            }
          }
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [role, token, sessionId]);

  // Cross-Tab Session Synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Logged out in another tab
          setToken(null);
          setUser(null);
          setRole(null);
          setSessionId(null);
        } else {
          // Logged in in another tab
          setToken(e.newValue);
          const savedUser = localStorage.getItem('user');
          const savedRole = localStorage.getItem('role');
          const savedSess = localStorage.getItem('sessionId');
          if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (err) {}
          }
          if (savedRole) setRole(savedRole);
          if (savedSess) setSessionId(savedSess);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const getDashboardPath = (r) => {
    switch (r) {
      case 'SUPER_ADMIN': return '/admin/dashboard';
      case 'EVENT_MEMBER': return '/member/dashboard';
      default: return '/user/dashboard';
    }
  };

  return (
    <AuthContext.Provider value={{
      user, role, token, loading,
      login, signup, logout, updateUser,
      isAuthenticated: !!token,
      isAdmin: role === 'SUPER_ADMIN',
      isMember: role === 'EVENT_MEMBER',
      isUser: role === 'USER',
      getDashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
