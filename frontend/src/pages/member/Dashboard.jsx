import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiQrcode, HiChartBar, HiTicket, HiShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    { icon: HiQrcode, label: 'Live Attendance Scanner', desc: 'Scan Student QR & Verify Entry', path: '/member/scanner', color: 'purple' },
    { icon: HiTicket, label: 'Manage Events', desc: 'View schedules, rooms & quotas', path: '/member/events', color: 'cyan' },
    { icon: HiChartBar, label: 'Marking System', desc: 'Score criteria & publish marks', path: '/member/marks', color: 'green' },
  ];

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name || 'Event Member'}`}
      subtitle="Event Operations & Live Attendance Terminal"
      headerActions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem' }}>
            <HiShieldCheck /> MEMBER ACCESS GRANTED
          </span>
        </div>
      }
    >
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {quickActions.map((action, idx) => (
          <Link key={idx} to={action.path} style={{ textDecoration: 'none' }}>
            <div className="stat-card-clean hover-lift glow-border" style={{ height: '100%' }}>
              <div className={`stat-card-icon ${action.color}`}>
                <action.icon />
              </div>
              <div className="stat-card-content">
                <p>{action.desc}</p>
                <h3 style={{ fontSize: '1.2rem' }}>{action.label}</h3>
                <span className="stat-badge-green">● Launch Terminal →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
