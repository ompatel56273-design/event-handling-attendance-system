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
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('role');

      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setToken(savedToken);
          setUser(res.data.user);
          setRole(res.data.role);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('role', res.data.role);
        } catch (err) {
          // Token invalid or user not in DB anymore
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          setToken(null);
          setUser(null);
          setRole(null);
        }
      } else if (savedUser && savedRole) {
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, role: newRole, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', newRole);
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
    setToken(null);
    setUser(null);
    setRole(null);
  };

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
