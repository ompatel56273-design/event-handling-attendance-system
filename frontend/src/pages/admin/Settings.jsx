import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCheck, HiLogout, HiShieldCheck } from 'react-icons/hi';
import { FaMoon, FaSun, FaUserShield, FaClock } from 'react-icons/fa';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, mode, setMode, themes } = useTheme();

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          SuperAdmin account & global dashboard theme control
        </p>
      </div>

      {/* =========================================================================
          SECTION 1: GLOBAL DISPLAY MODE (LIGHT / DARK)
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
            Global Display Mode (Light / Dark)
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
          SECTION 2: GLOBAL DASHBOARD THEME COMBOS (6 Cards)
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
            Global Dashboard Theme Combos
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
          SECTION 3: SUPERADMIN ACCOUNT & SESSION ACTIONS (2 Columns)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Left: Account Info */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>👤</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              SuperAdmin Account
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
              <strong style={{ color: 'var(--text-primary)' }}>Super Admin</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
              <strong style={{ color: 'var(--text-primary)' }}>admin@eventhandling.com</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Security Level</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaUserShield /> SUPER_ADMIN (Full Access)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Session Actions */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem', color: '#EF4444' }}>🕒</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Session Actions
            </h3>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            Logout of your active SuperAdmin session.<br />
            (Inactivity security timer is set to 5 minutes).
          </p>

          <button
            onClick={logout}
            className="btn btn-danger"
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HiLogout /> Logout SuperAdmin
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
