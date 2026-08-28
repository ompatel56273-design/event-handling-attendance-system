import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminSettings = () => {
  const { user, logout } = useAuth();

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Settings</h1><p>SuperAdmin account settings</p></div>
      <div className="profile-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Account Information</h3>
          <div className="e-card-detail-row"><span className="label">Name</span><span className="value">{user?.firstName} {user?.lastName}</span></div>
          <div className="e-card-detail-row"><span className="label">Email</span><span className="value">{user?.email}</span></div>
          <div className="e-card-detail-row"><span className="label">Role</span><span className="value"><span className="badge badge-danger">SUPER ADMIN</span></span></div>
          <div className="e-card-detail-row"><span className="label">User ID</span><span className="value" style={{ fontFamily: 'monospace', color: 'var(--primary-400)' }}>{user?.userId}</span></div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Actions</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Manage your SuperAdmin session.</p>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
