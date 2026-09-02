import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCheck, HiLogout, HiKey, HiUser, HiLockClosed } from 'react-icons/hi';
import { FaMoon, FaSun } from 'react-icons/fa';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, mode, setMode, themes } = useTheme();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setMsg({ type: 'success', text: 'Password updated successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const studentName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'John Doe';
  const userId = user?.userId || 'USR-102938';
  const email = user?.email || 'john.doe@email.com';
  const department = user?.department || 'BCA';
  const rollNumber = user?.rollNumber || '21BCA102';

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Personalize your display mode, color theme, and account credentials
        </p>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* =========================================================================
          SECTION 1: DISPLAY MODE (LIGHT / DARK)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.2rem' }}>🌓</span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Display Mode (Light / Dark)
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 18px 0' }}>
          Choose between immersive Dark Mode or clean high-contrast Light Mode.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => setMode('dark')}
            style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-app)',
              border: mode === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 160ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E1B4B', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                <FaMoon />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>Dark Mode (Default)</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Deep obsidian void with frosted glass</span>
              </div>
            </div>
            {mode === 'dark' && (
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiCheck /> Active
              </span>
            )}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setMode('light')}
            style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: mode === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-app)',
              border: mode === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 160ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                <FaSun />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>Light Mode</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pristine high-contrast clean daylight</span>
              </div>
            </div>
            {mode === 'light' && (
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiCheck /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: COLOR THEME COMBOS (6 Cards)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.2rem' }}>🎨</span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Color Theme Combos
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
          Select a system-wide theme palette. The Executive Black & White theme is active by default.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '18px 16px',
                  borderRadius: 16,
                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-app)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '170px',
                  transition: 'all 160ms ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.primary }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.secondary }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent }} />
                    </div>
                  </div>

                  <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                    {t.name}
                  </strong>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                </div>

                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-muted)', marginTop: 14 }}>
                  {isSelected ? '✓ Active Theme' : 'Click to apply'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: CHANGE PASSWORD & ACCOUNT INFORMATION (2 Columns)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Change Password Form */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>🔒</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Change Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmNew}
                onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: 8, borderRadius: 12, padding: '10px 20px', fontWeight: 800 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Right: Account Information & Logout */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>👤</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Account Information
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>{studentName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>User ID</span>
                <strong style={{ color: 'var(--primary)' }}>{userId}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Department</span>
                <strong style={{ color: 'var(--text-primary)' }}>{department}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Roll Number</span>
                <strong style={{ color: 'var(--text-primary)' }}>{rollNumber}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger"
            style={{
              marginTop: 20,
              padding: '10px 20px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              alignSelf: 'flex-start',
            }}
          >
            <HiLogout /> Logout Student Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
