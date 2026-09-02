import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiCalendar, HiClipboardList, HiCog, HiLogout,
  HiUsers, HiTicket, HiClipboardCheck, HiChartBar, HiStar, HiUserGroup, HiCreditCard,
  HiQrcode, HiDocument, HiX
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

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'SUPER_ADMIN';
  const isMember = role === 'EVENT_MEMBER';
  const sectionLabel = isAdmin ? 'SUPER ADMIN' : 'MAIN MENU';

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.name || (isAdmin ? 'Super Admin' : (isMember ? 'Mike Johnson' : 'John Doe'));

  const userInitial = (displayName.charAt(0) || 'U').toUpperCase();

  const userIdText = user?.userId || (isAdmin ? 'ADM-000001' : (isMember ? 'USR-102938' : 'USR-102938'));

  const displaySubtitle = user?.department
    ? `${user.department} | ${user.year ? `${user.year}st Year` : '1st Year'} - ${user.className || 'A'}`
    : (isAdmin ? 'BCA | 1st Year - A' : (isMember ? 'Event Coordinator' : 'BCA | 2nd Year - A'));

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16"
                stroke="url(#brand_grad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M20 12L28 16L20 20"
                stroke="url(#brand_grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="brand_grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="0.5" stopColor="#A855F7" />
                  <stop offset="1" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <h2>EVENTHUB</h2>
            <p>ENTERPRISE SUITE</p>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close Navigation"
          >
            <HiX />
          </button>
        </div>

        {/* Section Tag */}
        <div className="sidebar-section-tag">{sectionLabel}</div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card Footer */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-card">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={displayName} className="sidebar-user-avatar" />
            ) : (
              <div className="sidebar-user-initial">
                {userInitial}
                {isAdmin && <FaCrown className="admin-crown-badge" />}
              </div>
            )}
            <div className="sidebar-user-meta">
              <h4>{displayName}</h4>
              <p>{userIdText}</p>
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
