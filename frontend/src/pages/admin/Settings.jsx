import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCheck } from 'react-icons/hi';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  return (
    <DashboardLayout title="Settings" subtitle="SuperAdmin account & global dashboard theme control">
      {/* Global Dashboard Theme Combos */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 6 }}>🎨 Global Dashboard Theme Combos</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
          Select a system-wide theme palette. The Spider-Man Cyber Red theme is active by default.
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
                  <strong style={{ fontSize: '0.92rem', color: '#FFFFFF', display: 'block' }}>{t.name}</strong>
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

      <div className="dashboard-split-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>SuperAdmin Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Full Name</span><p style={{ fontWeight: 600 }}>{user?.firstName} {user?.lastName || 'Admin'}</p></div>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Email Address</span><p style={{ fontWeight: 600 }}>{user?.email}</p></div>
            <div><span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Security Level</span><p style={{ fontWeight: 700, color: 'var(--primary)' }}>SUPER_ADMIN (Full Access)</p></div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Session Actions</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.86rem' }}>
            Logout of your active SuperAdmin session. (Inactivity security timer is set to 5 minutes).
          </p>
          <button className="btn btn-danger" onClick={logout}>Logout SuperAdmin</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
