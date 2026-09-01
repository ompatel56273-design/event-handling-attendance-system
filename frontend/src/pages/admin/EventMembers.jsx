import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminEventMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ id: '', newPassword: '' });
  const [showPwModal, setShowPwModal] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try { const res = await api.get('/admin/event-members'); setMembers(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/event-members', form);
      setMsg({ type: 'success', text: 'Event member created!' });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      fetchMembers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.put(`/admin/event-members/${id}/status`, { accountStatus: newStatus });
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async () => {
    try {
      await api.put(`/admin/event-members/${passwordForm.id}/password`, { newPassword: passwordForm.newPassword });
      setMsg({ type: 'success', text: 'Password reset!' });
      setShowPwModal(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    }
  };

  if (loading) return <DashboardLayout><div className="loading-center"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout
      title="Event Member Management"
      subtitle="Manage event coordinator and volunteer credentials"
      headerActions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          + Create Member
        </button>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Create Event Member</h2><button className="modal-close" onClick={() => setShowCreate(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Password</label><input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showPwModal && (
        <div className="modal-overlay" onClick={() => setShowPwModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Reset Password</h2><button className="modal-close" onClick={() => setShowPwModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>New Password</label>
                <input type="password" className="form-control" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPwModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleResetPassword}>Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>{m.email}</td>
                <td><span className={`badge ${m.accountStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{m.accountStatus}</span></td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatusToggle(m._id, m.accountStatus)}>
                      {m.accountStatus === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setPasswordForm({ id: m._id, newPassword: '' }); setShowPwModal(true); }}>🔐</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminEventMembers;
