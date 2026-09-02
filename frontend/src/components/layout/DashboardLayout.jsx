import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiBell, HiCheck, HiX, HiMenu, HiSearch, HiCalendar,
  HiChevronDown, HiSparkles, HiSpeakerphone, HiPlus,
  HiTrash, HiTicket, HiChartBar, HiUser, HiStar,
  HiClipboardCheck, HiExternalLink
} from 'react-icons/hi';
import { FaSun, FaMoon, FaCheckCircle, FaSearch } from 'react-icons/fa';
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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

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

  const handleDeleteBroadcast = async (broadcastId) => {
    setAnnouncements((prev) => prev.filter((a) => a._id !== broadcastId));
    try {
      await api.delete(`/announcements/${broadcastId}`);
    } catch (err) {
      console.warn('Local broadcast removed:', err);
    }
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

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global searchable directory across Users, Events, Marks, and Registrations
  const SEARCH_INDEX = [
    // Users
    { type: 'user', title: 'John Doe', subtitle: 'USR-102938 • BCA Year 2-A • Roll 21BCA102', path: '/admin/users/USR-102938', icon: '👤', tag: 'STUDENT', role: 'admin' },
    { type: 'user', title: 'Alice Smith', subtitle: 'USR-102939 • BSc CA & IT Year 3-B', path: '/admin/users/USR-102939', icon: '👤', tag: 'STUDENT', role: 'admin' },
    { type: 'user', title: 'Bob Johnson', subtitle: 'USR-102940 • BCA Year 1-A • Roll 22BCA042', path: '/admin/users/USR-102940', icon: '👤', tag: 'STUDENT', role: 'admin' },
    { type: 'user', title: 'Charlie Brown', subtitle: 'USR-102941 • BCA Year 2-C • Roll 21BCA088', path: '/admin/users/USR-102941', icon: '👤', tag: 'FACULTY', role: 'admin' },
    { type: 'user', title: 'Emma Wilson', subtitle: 'USR-102942 • BSc CA & IT Year 2-A', path: '/admin/users/USR-102942', icon: '👤', tag: 'STUDENT', role: 'admin' },
    // Events
    { type: 'event', title: 'Code Carnival 2.0', subtitle: 'EVT-1004 • Seminar Hall • 25 July 2026', path: isAdmin ? '/admin/events' : (isMember ? '/member/events' : '/user/events'), icon: '💻', tag: 'EVENT' },
    { type: 'event', title: 'UI/UX Design Challenge', subtitle: 'EVT-1003 • Lab 3 • 10 July 2026', path: isAdmin ? '/admin/events' : (isMember ? '/member/events' : '/user/events'), icon: '🎨', tag: 'EVENT' },
    { type: 'event', title: 'Poster Presentation', subtitle: 'EVT-1001 • Auditorium • 18 June 2026', path: isAdmin ? '/admin/events' : (isMember ? '/member/events' : '/user/events'), icon: '📊', tag: 'EVENT' },
    { type: 'event', title: 'Debate Competition', subtitle: 'EVT-1002 • Conference Hall • 30 June 2026', path: isAdmin ? '/admin/events' : (isMember ? '/member/events' : '/user/events'), icon: '🎤', tag: 'EVENT' },
    { type: 'event', title: 'Robotics Workshop', subtitle: 'EVT-1005 • Workshop Lab • 05 Aug 2026', path: isAdmin ? '/admin/events' : (isMember ? '/member/events' : '/user/events'), icon: '🤖', tag: 'EVENT' },
    // Marks & Scorecards
    { type: 'mark', title: 'Code Carnival Evaluation Marks', subtitle: 'Problem Solving (40), Logic (30), Quality (20), Time (10)', path: isAdmin ? '/admin/marks' : '/member/marks', icon: '📈', tag: 'MARKS' },
    { type: 'mark', title: 'UI/UX Sprint Scorecard', subtitle: 'Visual Aesthetics (40), User Flow (30), Prototyping (20)', path: isAdmin ? '/admin/marks' : '/member/marks', icon: '📈', tag: 'MARKS' },
    { type: 'mark', title: 'Poster Presentation Marks Table', subtitle: 'Live Student Evaluation Criteria Matrix', path: isAdmin ? '/admin/marks' : '/member/marks', icon: '📈', tag: 'MARKS' },
    // Registrations & Attendance
    { type: 'reg', title: 'Student Registrations Directory', subtitle: 'Verified ticket holders & event join records', path: '/admin/registrations', icon: '🎫', tag: 'REGS', role: 'admin' },
    { type: 'att', title: 'QR Attendance Verification System', subtitle: 'Real-time scanner & verification log', path: isAdmin ? '/admin/attendance' : '/member/scanner', icon: '📱', tag: 'ATTENDANCE' },
    { type: 'win', title: 'Podium Winners & Hall of Fame', subtitle: 'Gold, Silver & Bronze Medalist Records', path: isAdmin ? '/admin/winners' : '/user/winners', icon: '🏆', tag: 'WINNERS' },
  ];

  const filteredSearch = globalSearch.trim().length > 0
    ? SEARCH_INDEX.filter((item) => {
        if (item.role === 'admin' && !isAdmin) return false;
        const q = globalSearch.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
      })
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (filteredSearch.length > 0) {
      navigate(filteredSearch[0].path);
      setGlobalSearch('');
      setSearchFocused(false);
      return;
    }
    if (isAdmin) {
      navigate(`/admin/users?search=${encodeURIComponent(globalSearch.trim())}`);
    } else if (isMember) {
      navigate(`/member/events?search=${encodeURIComponent(globalSearch.trim())}`);
    } else {
      navigate(`/user/events?search=${encodeURIComponent(globalSearch.trim())}`);
    }
    setGlobalSearch('');
    setSearchFocused(false);
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

            {/* Global Search Bar with Live Categorized Autocomplete */}
            <div ref={searchContainerRef} style={{ position: 'relative' }}>
              <form onSubmit={handleSearchSubmit} className="topbar-search-box">
                <HiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={
                    searchPlaceholder ||
                    (isAdmin
                      ? 'Search events, users, registrations, marks...'
                      : isMember
                      ? 'Search events, student attendance, marks...'
                      : 'Search events, competitions, passes...')
                  }
                  value={globalSearch}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setSearchFocused(true);
                  }}
                  className="topbar-search-input"
                />
                <span className="search-shortcut-badge">Ctrl + K</span>
              </form>

              {/* Live Search Autocomplete Drawer */}
              {searchFocused && globalSearch.trim().length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: 420,
                    maxWidth: '90vw',
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 18,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div style={{ padding: '12px 16px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Search Results ({filteredSearch.length})
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Press Enter ↵ to open</span>
                  </div>

                  <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px' }}>
                    {filteredSearch.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                        No matching users, events, or records found for <strong>"{globalSearch}"</strong>
                      </div>
                    ) : (
                      filteredSearch.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigate(item.path);
                            setGlobalSearch('');
                            setSearchFocused(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </strong>
                              {item.tag && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.subtitle}
                            </span>
                          </div>
                          <HiExternalLink style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
              <form onSubmit={handleCreateBroadcast} className="create-broadcast-box" style={{ background: 'var(--bg-app)', border: '1.5px solid var(--border-color)', borderRadius: 18, padding: '20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                    Broadcast Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule Change: Seminar Relocated to Room 108"
                    value={newBroadcastTitle}
                    onChange={(e) => setNewBroadcastTitle(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 600, outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                    Broadcast Message Details
                  </label>
                  <textarea
                    placeholder="Enter full broadcast details, guidelines, or instructions for all campus students and members..."
                    value={newBroadcastContent}
                    onChange={(e) => setNewBroadcastContent(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 500, outline: 'none', resize: 'vertical' }}
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type:</label>
                    <select
                      value={newBroadcastType}
                      onChange={(e) => setNewBroadcastType(e.target.value)}
                      style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.86rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="URGENT">Urgent Alert</option>
                      <option value="UPDATE">Schedule Update</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateBroadcast(false)} style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700 }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 10, padding: '8px 20px', fontWeight: 800 }}>
                      Publish Broadcast
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notification List */}
            <div className="notif-items-list">
              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ margin: 0, fontSize: '0.94rem' }}>No broadcasts published yet.</p>
                </div>
              ) : (
                announcements.map((notif) => (
                  <div key={notif._id} className={`notif-item-card ${notif.isRead ? 'read' : 'unread'}`} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className={`notif-type-tag ${notif.type?.toLowerCase()}`}>
                        {notif.type || 'NOTICE'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Admin-only Delete Broadcast button */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteBroadcast(notif._id)}
                            title="Remove Broadcast Message (Admin Only)"
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.28)',
                              color: '#EF4444',
                              borderRadius: 8,
                              padding: '4px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <HiTrash /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </h4>

                    {notif.content && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {notif.content}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <HiSpeakerphone /> Broadcast by {notif.author || 'Super Admin'}
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
