import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiShieldCheck, HiLockClosed, HiMail, HiArrowRight, HiClock } from 'react-icons/hi';

const Login = () => {
  const { login, getDashboardPath, isAuthenticated, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isIdleLogout = searchParams.get('reason') === 'idle_timeout';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated and not an idle timeout redirect, automatically forward to user dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && role && !isIdleLogout) {
      navigate(getDashboardPath(role), { replace: true });
    }
  }, [isAuthenticated, role, authLoading, isIdleLogout, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userRole = await login(form.email, form.password);
      navigate(getDashboardPath(userRole));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Floating Neon Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card hover-card glow-border"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '36px 32px',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          backdropFilter: 'blur(24px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-primary)',
              margin: '0 auto 14px',
            }}
          >
            ⚡
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.6px' }}>
            EVENTHUB PRO
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to access your campus event terminal
          </p>
        </div>

        {isIdleLogout && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>⏳</span>
            <div>
              <strong style={{ color: '#F59E0B', fontSize: '0.86rem', display: 'block' }}>
                Session Inactivity Timeout
              </strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.35, display: 'block' }}>
                You were automatically signed out due to inactivity on the dashboard. Please sign in again.
              </span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger" style={{ fontSize: '0.8rem', marginBottom: '18px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HiMail style={{ color: 'var(--primary)' }} /> Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. john.doe@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
                <HiLockClosed style={{ color: 'var(--primary)' }} /> Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In <HiArrowRight /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
