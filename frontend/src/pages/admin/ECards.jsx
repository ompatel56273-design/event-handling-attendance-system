import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminECards = () => {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>E-Cards Management</h1>
        <p>View and manage E-Cards through Attendance Management</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎴</div>
        <h3 style={{ marginBottom: 8 }}>E-Card Access</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Identity E-Cards are generated dynamically on user dashboards.<br />
          Attendance E-Cards are managed through <strong>Attendance Management</strong>.
        </p>
        <a href="/admin/attendance" className="btn btn-primary">Go to Attendance Management</a>
      </div>
    </DashboardLayout>
  );
};

export default AdminECards;
