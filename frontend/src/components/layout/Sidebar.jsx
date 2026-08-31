import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiX } from 'react-icons/hi';
import {
  HiHome, HiCalendar, HiClipboardList, HiCog, HiLogout,
  HiUsers, HiTicket, HiClipboardCheck, HiChartBar, HiStar, HiUserGroup, HiCreditCard,
  HiQrcode, HiDocument
} from 'react-icons/hi';

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

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'SUPER_ADMIN';
  const sectionLabel = isAdmin ? 'SUPER ADMIN' : 'MAIN MENU';

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.name || (isAdmin ? 'Super Admin' : 'Student');

  const displaySubtitle = user?.department
    ? `${user.department} | ${user.year ? `${user.year}nd Year` : '2nd Year'} - ${user.className || 'A'}`
    : (isAdmin ? 'System Administrator' : user?.email || '');

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            ⚡
          </div>
          <div className="sidebar-brand-text">
            <h2>EVENTHUB</h2>
            <p>ENTERPRISE SUITE</p>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <HiX />
          </button>
        </div>

        {/* Section Header */}
        <div className="sidebar-section-tag">{sectionLabel}</div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-card">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={displayName} className="sidebar-user-avatar" />
            ) : (
              <div className="sidebar-user-initial">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="sidebar-user-meta">
              <h4>{displayName}</h4>
              <p>{user?.userId || (isAdmin ? 'ADM-000001' : 'USR-102938')}</p>
              {displaySubtitle && <span>{displaySubtitle}</span>}
            </div>
          </div>

          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <HiLogout /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
