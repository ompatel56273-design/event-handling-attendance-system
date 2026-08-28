import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import {
  HiHome, HiCalendar, HiClipboardList, HiCog, HiLogout,
  HiUsers, HiTicket, HiClipboardCheck, HiChartBar, HiStar, HiUserGroup, HiCreditCard,
  HiQrcode, HiDocument
} from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';

const navItems = {
  USER: [
    { path: '/user/dashboard', label: 'Home', icon: HiHome },
    { path: '/user/upcoming-events', label: 'Upcoming Events', icon: HiCalendar },
    { path: '/user/events', label: 'Events', icon: HiTicket },
    { path: '/user/my-events', label: 'My Events', icon: HiClipboardList },
    { path: '/user/winners', label: 'Winners', icon: HiStar },
    { path: '/user/settings', label: 'Settings', icon: HiCog },
  ],
  EVENT_MEMBER: [
    { path: '/member/dashboard', label: 'Dashboard', icon: HiHome },
    { path: '/member/scanner', label: 'Attendance Scanner', icon: HiQrcode },
    { path: '/member/events', label: 'Events', icon: HiTicket },
    { path: '/member/marks', label: 'Marks', icon: HiChartBar },
    { path: '/member/profile', label: 'Profile', icon: HiUsers },
  ],
  SUPER_ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HiHome },
    { path: '/admin/users', label: 'Users', icon: HiUsers },
    { path: '/admin/events', label: 'Events', icon: HiTicket },
    { path: '/admin/registrations', label: 'Registrations', icon: HiDocument },
    { path: '/admin/attendance', label: 'Attendance', icon: HiClipboardCheck },
    { path: '/admin/marks', label: 'Marks', icon: HiChartBar },
    { path: '/admin/winners', label: 'Winners', icon: HiStar },
    { path: '/admin/event-members', label: 'Event Members', icon: HiUserGroup },
    { path: '/admin/e-cards', label: 'E-Cards', icon: HiCreditCard },
    { path: '/admin/settings', label: 'Settings', icon: HiCog },
  ],
};

const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'SUPER_ADMIN';
  const isMember = role === 'EVENT_MEMBER';

  const brandName = isAdmin ? 'SmartHub' : 'EventHub';
  const panelTag = isAdmin ? 'SUPER ADMIN' : isMember ? 'MEMBER PANEL' : 'USER PANEL';

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.name || (isAdmin ? 'Super Admin' : 'Student');

  const displaySubtitle = user?.department
    ? `${user.department} | ${user.year ? `${user.year}th Year` : ''} ${user.className ? `- ${user.className}` : ''}`
    : (isAdmin ? 'System Administrator' : user?.email || '');

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-header" style={{ display: 'none' }}>
        <button className="mobile-toggle" onClick={() => setIsOpen(true)}>
          <HiMenu />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>{brandName}</span>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Mobile overlay */}
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className={`sidebar-brand-icon ${isAdmin ? 'admin-crown' : ''}`}>
            {isAdmin ? <FaCrown /> : '🎫'}
          </div>
          <div className="sidebar-brand-text">
            <h2>{brandName}</h2>
          </div>
          <button
            className="mobile-toggle"
            onClick={() => setIsOpen(false)}
            style={{ display: 'none', marginLeft: 'auto', color: '#fff' }}
          >
            <HiX />
          </button>
        </div>

        <div className="sidebar-panel-tag">{panelTag}</div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon"><item.icon /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-card">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={displayName} />
            ) : (
              <div className="avatar-box">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="sidebar-user-info">
              <h4>{displayName}</h4>
              <p>{user?.userId || (isAdmin ? 'ADMIN-001' : '')}</p>
              {displaySubtitle && <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>{displaySubtitle}</p>}
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { 
            display: flex !important; 
            align-items: center; 
            justify-content: space-between;
            padding: 12px 16px; 
            background: #FFFFFF; 
            border-bottom: 1px solid #E2E8F0;
            position: sticky;
            top: 0;
            z-index: 90;
          }
          .sidebar-header .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
