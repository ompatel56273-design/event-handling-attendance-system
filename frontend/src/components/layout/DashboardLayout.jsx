import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { HiBell } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const DashboardLayout = ({ children, title, subtitle, headerActions }) => {
  const { user, role } = useAuth();

  const firstName = user?.firstName || user?.name?.split(' ')[0] || (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Student');
  const avatarUrl = user?.profileImage?.url;
  const initials = (user?.firstName ? user.firstName[0] : (user?.name ? user.name[0] : 'U')).toUpperCase();

  const profileLink = role === 'SUPER_ADMIN' ? '/admin/settings' : role === 'EVENT_MEMBER' ? '/member/profile' : '/user/profile';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Top Header Bar from Master UI Design */}
        <div className="top-app-header">
          <div className="greeting-title">
            <h1>{title || `Hello, ${firstName} 👋`}</h1>
            <p>{subtitle || "Here's what's happening with your events."}</p>
          </div>

          <div className="header-actions">
            {headerActions}
            
            <button className="notif-bell-btn" title="Notifications" onClick={() => {}}>
              <HiBell />
              <span className="notif-dot"></span>
            </button>

            <Link to={profileLink} className="top-avatar-pill">
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="top-avatar-img" />
              ) : (
                <div className="top-avatar-initials">{initials}</div>
              )}
            </Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
