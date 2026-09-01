import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCheck } from 'react-icons/hi';

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
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your dashboard theme & account security">
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Global Display Mode (Dark vs Light) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 6 }}>🌓 Global Display Mode (Light / Dark)</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
          Choose between immersive Dark Mode or clean high-contrast Light Mode.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => setMode('dark')}
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              background: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: mode === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              boxShadow: mode === 'dark' ? '0 0 20px var(--primary-glow)' : 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '2rem' }}>🌙</span>
              <div>
                <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)', display: 'block' }}>Dark Mode (Default)</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>Deep obsidian void with frosted glass</p>
              </div>
            </div>
            {mode === 'dark' && (
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiCheck /> Active
              </span>
            )}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setMode('light')}
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              background: mode === 'light' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: mode === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              boxShadow: mode === 'light' ? '0 0 20px var(--primary-glow)' : 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '2rem' }}>☀️</span>
              <div>
                <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)', display: 'block' }}>Light Mode</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>Pristine high-contrast clean daylight</p>
              </div>
            </div>
            {mode === 'light' && (
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiCheck /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Dashboard Theme Combos */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 6 }}>🎨 Dashboard Theme Color Combos</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
          Choose your favorite color palette. The Executive Black & White theme is active by default.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${t.primary}` : '1px solid var(--border-color)',
                  boxShadow: isSelected ? `0 0 20px ${t.primary}40` : 'none',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.primary, boxShadow: `0 0 6px ${t.primary}` }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.secondary }} />
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block' }}>{t.name}</strong>
                    {t.id === 'monochrome' && (
                      <span className="badge badge-primary" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.description}</p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                  {isSelected ? (
                    <span style={{ color: t.primary, fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiCheck /> Active Theme
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click to apply</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-control" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" className="form-control" value={pwForm.confirmNew} onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Email Address</span><p style={{ fontWeight: 600 }}>{user?.email}</p></div>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Student User ID</span><p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>{user?.userId}</p></div>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Department</span><p style={{ fontWeight: 600 }}>{user?.department} - {user?.className}</p></div>
          </div>
          <button className="btn btn-danger" onClick={logout}>Logout Account</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
