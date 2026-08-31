import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiTicket, HiClipboardList, HiStar, HiCog,
  HiQrcode, HiChartBar, HiUserGroup, HiClipboardCheck, HiUsers
} from 'react-icons/hi';

const mobileNavItems = {
  USER: [
    { path: '/user/dashboard', label: 'Home', icon: HiHome },
    { path: '/user/events', label: 'Events', icon: HiTicket },
    { path: '/user/my-events', label: 'Passes', icon: HiClipboardList },
    { path: '/user/winners', label: 'Winners', icon: HiStar },
    { path: '/user/settings', label: 'Profile', icon: HiCog },
  ],
  EVENT_MEMBER: [
    { path: '/member/dashboard', label: 'Home', icon: HiHome },
    { path: '/member/scanner', label: 'Scanner', icon: HiQrcode },
    { path: '/member/events', label: 'Events', icon: HiTicket },
    { path: '/member/marks', label: 'Marks', icon: HiChartBar },
    { path: '/member/profile', label: 'Profile', icon: HiUsers },
  ],
  SUPER_ADMIN: [
    { path: '/admin/dashboard', label: 'Home', icon: HiHome },
    { path: '/admin/users', label: 'Users', icon: HiUsers },
    { path: '/admin/events', label: 'Events', icon: HiTicket },
    { path: '/admin/attendance', label: 'Scanner', icon: HiClipboardCheck },
    { path: '/admin/settings', label: 'Settings', icon: HiCog },
  ],
};

const MobileBottomNav = () => {
  const { role } = useAuth();
  const items = mobileNavItems[role] || mobileNavItems.USER;

  return (
    <div className="mobile-bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon className="mobile-nav-icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MobileBottomNav;
