import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Settings = () => {
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    if (pwForm.newPassword !== pwForm.confirmNew) { setMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Settings</h1><p>Manage your account settings</p></div>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="profile-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-control" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" className="form-control" value={pwForm.confirmNew} onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Account</h3>
          <div className="e-card-detail-row"><span className="label">Email</span><span className="value">{user?.email}</span></div>
          <div className="e-card-detail-row"><span className="label">User ID</span><span className="value" style={{ fontFamily: 'monospace', color: 'var(--primary-400)' }}>{user?.userId}</span></div>
          <div className="e-card-detail-row"><span className="label">Role</span><span className="value"><span className="badge badge-primary">{user?.role}</span></span></div>
          <button className="btn btn-danger" style={{ marginTop: 16 }} onClick={logout}>Logout</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
