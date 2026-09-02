import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiBell, HiCheck, HiX, HiMenu, HiSearch, HiCalendar,
  HiChevronDown, HiSparkles, HiSpeakerphone, HiPlus
} from 'react-icons/hi';
import { FaSun, FaMoon, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, title, subtitle, headerActions, searchPlaceholder }) => {
  const { user, role, logout } = useAuth();
  const { theme, setTheme, mode, toggleMode, themes, activeThemeConfig } = useTheme();
  const navigate = useNavigate();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [announcements, setAnnouncements] = useState([
    {
      _id: 'notif-1',
      title: 'Change romm',
      content: '108',
      type: 'URGENT',
      createdAt: '2026-08-31T11:32:00.000Z',
      author: 'Super Admin',
      isRead: false,
    },
    {
      _id: 'notif-2',
      title: 'Code Carnival 2.0 Schedule Released',
      content: 'Reporting time has been updated to 09:30 AM at Seminar Hall.',
      type: 'ANNOUNCEMENT',
      createdAt: '2026-09-01T09:00:00.000Z',
      author: 'Super Admin',
      isRead: false,
    },
  ]);

  const [newBroadcastTitle, setNewBroadcastTitle] = useState('');
  const [newBroadcastContent, setNewBroadcastContent] = useState('');
  const [newBroadcastType, setNewBroadcastType] = useState('ANNOUNCEMENT');
  const [showCreateBroadcast, setShowCreateBroadcast] = useState(false);

  const isAdmin = role === 'SUPER_ADMIN';
  const isMember = role === 'EVENT_MEMBER';

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.name || (isAdmin ? 'Super Admin' : (isMember ? 'Mike Johnson' : 'John Doe'));

  const userIdText = user?.userId || (isAdmin ? 'ADM-000001' : (isMember ? 'USR-102938' : 'USR-102938'));
  const userInitial = (displayName.charAt(0) || 'U').toUpperCase();

  const profileLink = isAdmin ? '/admin/settings' : (isMember ? '/member/profile' : '/user/settings');

  // Format today's date (e.g. 02 Sept 2026)
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const handleMarkAllRead = () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!newBroadcastTitle.trim()) return;

    const newNotif = {
      _id: `notif-${Date.now()}`,
      title: newBroadcastTitle,
      content: newBroadcastContent,
      type: newBroadcastType,
      createdAt: new Date().toISOString(),
      author: displayName,
      isRead: false,
    };

    setAnnouncements([newNotif, ...announcements]);
    setNewBroadcastTitle('');
    setNewBroadcastContent('');
    setShowCreateBroadcast(false);

    try {
      await api.post('/announcements', {
        title: newBroadcastTitle,
        content: newBroadcastContent,
        type: newBroadcastType,
      });
    } catch (err) {
      console.warn('Local broadcast created (API fallback):', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (isAdmin) {
      navigate(`/admin/users?search=${encodeURIComponent(globalSearch.trim())}`);
    } else if (isMember) {
      navigate(`/member/events?search=${encodeURIComponent(globalSearch.trim())}`);
    } else {
      navigate(`/user/events?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar with Drawer Support */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="main-content">
        {/* =========================================================================
            TOPBAR / HEADER (Exact EventHub Suite Layout)
            ========================================================================= */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger for Mobile/Tablet */}
            <button
              className="topbar-hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation"
            >
              <HiMenu />
            </button>

            {/* Global Search Bar with Ctrl+K shortcut */}
            <form onSubmit={handleSearchSubmit} className="topbar-search-box">
              <HiSearch className="search-icon" />
              <input
                type="text"
                placeholder={
                  searchPlaceholder ||
                  (isAdmin
                    ? 'Search events, users, registrations...'
                    : isMember
                    ? 'Search events, student attendance...'
                    : 'Search events, competitions, passes...')
                }
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="topbar-search-input"
              />
              <span className="search-shortcut-badge">Ctrl + K</span>
            </form>
          </div>

          <div className="topbar-right">
            {/* Live Current Date Badge */}
            <div className="topbar-date-pill">
              <HiCalendar className="date-icon" />
              <span>{todayFormatted}</span>
            </div>

            {/* Light / Dark Mode Slider Toggle */}
            <div
              className={`mode-switch-pill ${mode === 'dark' ? 'dark-active' : 'light-active'}`}
              onClick={toggleMode}
              title={`Currently in ${mode === 'dark' ? 'Dark' : 'Light'} Mode. Click to switch.`}
            >
              <FaSun className="mode-icon sun-icon" />
              <div className="mode-toggle-thumb" />
              <FaMoon className="mode-icon moon-icon" />
            </div>

            {/* Theme Selector Dropdown Button */}
            <button
              className="topbar-theme-selector-btn"
              onClick={() => setShowThemeModal(true)}
              title="Switch Dashboard Color Theme"
            >
              <span className="theme-emoji-icon">{activeThemeConfig?.icon || '🍃'}</span>
              <span className="theme-name-text">
                {activeThemeConfig?.name?.split(' ')[0] || 'Industrial'}
              </span>
              <HiChevronDown className="chevron-icon" />
            </button>

            {/* Notification Bell with Badge */}
            <button
              className="topbar-notif-bell-btn"
              onClick={() => setShowNotifModal(true)}
              title="Notifications & Announcements"
              aria-label="Notifications"
            >
              <HiBell />
              {unreadCount > 0 && (
                <span className="notif-badge-counter">{unreadCount}</span>
              )}
            </button>

            {/* User Profile Avatar Pill */}
            <div className="topbar-user-menu-wrapper">
              <div
                className="topbar-user-pill"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user?.profileImage?.url ? (
                  <img src={user.profileImage.url} alt={displayName} className="topbar-user-avatar-img" />
                ) : (
                  <div className="topbar-user-avatar-initial">{userInitial}</div>
                )}
                <div className="topbar-user-info-text">
                  <span className="topbar-user-name">{displayName}</span>
                  <span className="topbar-user-id">{userIdText}</span>
                </div>
                <HiChevronDown className="topbar-user-chevron" />
              </div>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="topbar-dropdown-menu" onClick={() => setUserMenuOpen(false)}>
                  <Link to={profileLink} className="dropdown-menu-item">
                    👤 My Profile & Settings
                  </Link>
                  <button
                    onClick={() => setShowThemeModal(true)}
                    className="dropdown-menu-item"
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none' }}
                  >
                    🎨 Color Themes
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="dropdown-menu-item danger-text"
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none' }}
                  >
                    ➔ Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="page-wrapper">
          {children}
        </div>

        {/* Footer */}
        <footer className="dashboard-page-footer">
          <span>© 2026 EventHub. All rights reserved.</span>
          <span>Made with ❤️ for smarter campuses.</span>
        </footer>
      </main>

      {/* =========================================================================
          MODAL 1: DASHBOARD COLOR THEMES (Exact Globel Chages/1.png Layout)
          ========================================================================= */}
      {showThemeModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowThemeModal(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>🎨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Dashboard Color Themes</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Switch system-wide theme palette across your workspace
                  </p>
                </div>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setShowThemeModal(false)}>
                <HiX />
              </button>
            </div>

            {/* 6 Theme List Items */}
            <div className="theme-modal-list">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <div
                    key={t.id}
                    className={`theme-modal-card-item ${isActive ? 'theme-card-active' : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span className="theme-list-icon">{t.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>{t.name}</strong>
                          {t.id === 'monochrome' && (
                            <span className="default-pill-tag">DEFAULT</span>
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Color Dots */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.primary }} />
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.secondary }} />
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.accent }} />
                      </div>

                      {/* Active Indicator or Apply button */}
                      {isActive ? (
                        <span className="theme-active-indicator">
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <button
                          className="theme-apply-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTheme(t.id);
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                className="btn btn-primary"
                style={{ padding: '10px 32px', borderRadius: 12, fontWeight: 800 }}
                onClick={() => setShowThemeModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: NOTIFICATIONS & BROADCASTS (Exact Globel Chages/2.png Layout)
          ========================================================================= */}
      {showNotifModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowNotifModal(false)}>
          <div className="notif-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>🔔</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Notifications & Broadcasts</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Campus announcements and real-time event updates
                  </p>
                </div>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setShowNotifModal(false)}>
                <HiX />
              </button>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
                <HiCheck /> Mark All Read
              </button>

              {isAdmin && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreateBroadcast(!showCreateBroadcast)}
                >
                  <HiPlus /> New Broadcast
                </button>
              )}
            </div>

            {/* Create Broadcast Form for SuperAdmin */}
            {showCreateBroadcast && (
              <form onSubmit={handleCreateBroadcast} className="create-broadcast-box">
                <input
                  type="text"
                  placeholder="Broadcast Title (e.g. Change room)"
                  value={newBroadcastTitle}
                  onChange={(e) => setNewBroadcastTitle(e.target.value)}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Broadcast details (e.g. Seminar relocated to Room 108)"
                  value={newBroadcastContent}
                  onChange={(e) => setNewBroadcastContent(e.target.value)}
                  className="form-input"
                  rows={2}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <select
                    value={newBroadcastType}
                    onChange={(e) => setNewBroadcastType(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto' }}
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="URGENT">Urgent Alert</option>
                    <option value="UPDATE">Schedule Update</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateBroadcast(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Publish
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notification List */}
            <div className="notif-items-list">
              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                  <p>No new broadcasts at this time.</p>
                </div>
              ) : (
                announcements.map((notif) => (
                  <div key={notif._id} className={`notif-item-card ${notif.isRead ? 'read' : 'unread'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className={`notif-type-tag ${notif.type?.toLowerCase()}`}>
                        {notif.type || 'NOTICE'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </h4>

                    {notif.content && (
                      <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {notif.content}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--primary)' }}>
                      <HiSpeakerphone /> By {notif.author || 'Super Admin'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
