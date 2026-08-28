import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiQrcode, HiChartBar, HiTicket } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    { icon: HiQrcode, label: 'Attendance Scanner', path: '/member/scanner', color: 'purple' },
    { icon: HiTicket, label: 'View Events', path: '/member/events', color: 'blue' },
    { icon: HiChartBar, label: 'Enter Marks', path: '/member/marks', color: 'green' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Welcome, {user?.name || 'Event Member'}!</h1>
        <p>Event Handling Dashboard</p>
      </div>
      <div className="stats-grid">
        {quickActions.map((action, idx) => (
          <Link key={idx} to={action.path} style={{ textDecoration: 'none' }}>
            <div className="card stat-card">
              <div className={`stat-icon ${action.color}`}><action.icon /></div>
              <div className="stat-info"><h4 style={{ fontSize: '1rem' }}>{action.label}</h4><p>Click to open</p></div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
