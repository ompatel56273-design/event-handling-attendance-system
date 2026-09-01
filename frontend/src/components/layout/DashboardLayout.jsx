import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import NotificationDrawer from '../common/NotificationDrawer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiBell, HiMail, HiCheck, HiX, HiMenu } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const DashboardLayout = ({ children, title, subtitle, headerActions }) => {
  const { user, role } = useAuth();
  const { theme, setTheme, themes, activeThemeConfig } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const firstName = user?.firstName || user?.name?.split(' ')[0] || (role === 'SUPER_ADMIN' ? 'Admin' : 'John');
  const avatarUrl = user?.profileImage?.url;
  const initials = (user?.firstName ? user.firstName[0] : (user?.name ? user.name[0] : 'J')).toUpperCase();

  const profileLink = role === 'SUPER_ADMIN' ? '/admin/settings' : role === 'EVENT_MEMBER' ? '/member/profile' : '/user/settings';

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="app-layout">
      {/* Mobile Top App Bar (Only visible on screens <= 768px) */}
      <div className="mobile-app-header">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Open Navigation Menu"
        >
          <HiMenu />
        </button>

        <div className="mobile-header-brand">
          <span style={{ fontSize: '1.2rem' }}>{activeThemeConfig.icon}</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.6px', color: '#FFFFFF' }}>
            EVENTHUB
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="mobile-theme-btn"
            title="Switch Theme"
            onClick={() => setShowThemeModal(true)}
          >
            {activeThemeConfig.icon}
          </button>

          <button
            className="mobile-theme-btn"
            title="Notifications"
            onClick={() => setShowNotifDrawer(true)}
            style={{ position: 'relative' }}
          >
            <HiBell style={{ fontSize: '1.1rem' }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 6px #EF4444',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <Link to={profileLink} className="top-avatar-pill" style={{ width: 34, height: 34, borderRadius: 10 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} className="top-avatar-img" />
            ) : (
              <div className="top-avatar-initials" style={{ fontSize: '0.85rem' }}>{initials}</div>
            )}
          </Link>
        </div>
      </div>

      {/* Sidebar with Drawer Support */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="main-content">
        {/* Desktop Top Header Bar */}
        <div className="top-app-header desktop-only-header">
          <div className="greeting-title">
            <h1>
              <span style={{ fontSize: '1.4rem', display: 'inline-flex', alignItems: 'center' }}>{activeThemeConfig.icon}</span>
              <span>{title || `Hello, ${firstName}!`}</span>
            </h1>
            <p>{subtitle || "Here's what happening with your events."}</p>
          </div>

          <div className="header-actions">
            {headerActions}
            
            {/* Theme Selector Palette Button */}
            <button
              className="notif-bell-btn"
              title={`Active Theme: ${activeThemeConfig.name} (Click to change)`}
              onClick={() => setShowThemeModal(true)}
              style={{
                borderColor: 'var(--primary)',
                boxShadow: 'var(--primary-glow)',
                gap: 6,
                padding: '0 12px',
                width: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center' }}>{activeThemeConfig.icon}</span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF' }}>
                {activeThemeConfig.name.split(' ')[0]}
              </span>
            </button>

            <button
              className="notif-bell-btn"
              title="Campus Announcements"
              onClick={() => setShowNotifDrawer(true)}
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HiBell style={{ fontSize: '1.25rem' }} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px #EF4444',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <Link to={profileLink} className="top-avatar-pill" title="My Profile">
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="top-avatar-img" />
              ) : (
                <div className="top-avatar-initials">{initials}</div>
              )}
            </Link>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="dashboard-content-body">
          {children}
        </div>

        {/* Notification Drawer Modal */}
        <NotificationDrawer
          isOpen={showNotifDrawer}
          onClose={() => setShowNotifDrawer(false)}
          announcements={announcements}
          onRefresh={fetchAnnouncements}
        />

        {/* Global Theme Selector Modal */}
        {showThemeModal && (
          <div className="modal-overlay" onClick={() => setShowThemeModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
              <div className="modal-header">
                <div>
                  <h2>🎨 Dashboard Color Themes</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Select a color combo across the entire application
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowThemeModal(false)}>
                  <HiX />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {themes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? `2px solid ${t.primary}` : '1px solid var(--border-color)',
                        boxShadow: isSelected ? `0 0 20px ${t.primary}40` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: '1.6rem' }}>{t.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: '0.92rem', color: '#FFFFFF' }}>{t.name}</strong>
                            {t.id === 'titanium' && (
                              <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {t.description}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Live Color Swatches */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.primary, boxShadow: `0 0 6px ${t.primary}` }} />
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.secondary }} />
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent }} />
                        </div>

                        {isSelected ? (
                          <span style={{ color: t.primary, fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <HiCheck /> Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Apply
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer">
                <button className="btn btn-primary btn-sm" onClick={() => setShowThemeModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom App Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
