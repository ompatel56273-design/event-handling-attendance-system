import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MemberProfile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="page-header"><h1>My Profile</h1><p>Your event member account</p></div>
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="e-card-avatar-placeholder" style={{ margin: '0 auto 16px' }}>
          {user?.name?.[0] || 'M'}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ marginTop: 8 }}>Event Member</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberProfile;
