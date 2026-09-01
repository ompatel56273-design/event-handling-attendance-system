import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiSearch, HiKey } from 'react-icons/hi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ userId: '', newPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    department: 'BCA',
    year: 1,
    className: 'A',
    rollNumber: '',
    mobile: '',
    email: '',
    password: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (q = '') => {
    try {
      const res = await api.get(`/admin/users?search=${q}&limit=100`);
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 1 : value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName || !addForm.rollNumber || !addForm.mobile || !addForm.email || !addForm.password) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (!/^\d{10}$/.test(addForm.mobile)) {
      setMsg({ type: 'error', text: 'Mobile number must be exactly 10 digits.' });
      return;
    }
    if (addForm.password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setAddLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/admin/users', addForm);
      setMsg({ type: 'success', text: `User ${res.data.user?.firstName} (${res.data.user?.userId}) created successfully!` });
      setShowAddModal(false);
      setAddForm({
        firstName: '',
        lastName: '',
        department: 'BCA',
        year: 1,
        className: 'A',
        rollNumber: '',
        mobile: '',
        email: '',
        password: '',
      });
      fetchUsers(search);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create user.' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.put(`/admin/users/${passwordForm.userId}/password`, { newPassword: passwordForm.newPassword });
      setMsg({ type: 'success', text: 'Password reset successfully.' });
      setShowPasswordModal(false);
      setPasswordForm({ userId: '', newPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' });
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}`, { accountStatus: status });
      fetchUsers(search);
      setMsg({ type: 'success', text: `User ${status.toLowerCase()} successfully.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    }
  };

  if (loading) return <DashboardLayout><div className="loading-center"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout
      title="User Management"
      subtitle="View, add, and manage student accounts"
      headerActions={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <form onSubmit={handleSearch} className="search-input" style={{ width: 260 }}>
            <HiSearch className="search-icon" />
            <input placeholder="Search users by name, ID, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowAddModal(true); setMsg({ type: '', text: '' }); }}>
            + Add User
          </button>
        </div>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2>Add New Student / User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      name="firstName"
                      className="form-control"
                      placeholder="e.g. John"
                      value={addForm.firstName}
                      onChange={handleAddUserChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      name="lastName"
                      className="form-control"
                      placeholder="e.g. Doe"
                      value={addForm.lastName}
                      onChange={handleAddUserChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      className="form-control"
                      value={addForm.department}
                      onChange={handleAddUserChange}
                      required
                    >
                      <option value="BCA">BCA</option>
                      <option value="BSc CA & IT">BSc CA & IT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select
                      name="year"
                      className="form-control"
                      value={addForm.year}
                      onChange={handleAddUserChange}
                      required
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Class</label>
                    <select
                      name="className"
                      className="form-control"
                      value={addForm.className}
                      onChange={handleAddUserChange}
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input
                      name="rollNumber"
                      className="form-control"
                      placeholder="e.g. 101"
                      value={addForm.rollNumber}
                      onChange={handleAddUserChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number (10 digits)</label>
                    <input
                      name="mobile"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={addForm.mobile}
                      onChange={handleAddUserChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="student@example.com"
                      value={addForm.email}
                      onChange={handleAddUserChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Initial Password</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={addForm.password}
                    onChange={handleAddUserChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Reset User Password</h2><button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" placeholder="Min 6 characters" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleResetPassword}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>User Details</h2><button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {selectedUser.profileImage?.url ? (
                  <img src={selectedUser.profileImage.url} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="e-card-avatar-placeholder">{selectedUser.firstName[0]}{selectedUser.lastName[0]}</div>
                )}
                <h3 style={{ marginTop: 8 }}>{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p style={{ color: 'var(--primary-400)', fontFamily: 'monospace' }}>{selectedUser.userId}</p>
              </div>
              <div className="e-card-details" style={{ padding: 0 }}>
                <div className="e-card-detail-row"><span className="label">Email</span><span className="value">{selectedUser.email}</span></div>
                <div className="e-card-detail-row"><span className="label">Mobile</span><span className="value">{selectedUser.mobile}</span></div>
                <div className="e-card-detail-row"><span className="label">Department</span><span className="value">{selectedUser.department}</span></div>
                <div className="e-card-detail-row"><span className="label">Year / Class</span><span className="value">{selectedUser.year} / {selectedUser.className}</span></div>
                <div className="e-card-detail-row"><span className="label">Roll No.</span><span className="value">{selectedUser.rollNumber}</span></div>
                <div className="e-card-detail-row"><span className="label">Status</span><span className="value"><span className={`badge ${selectedUser.accountStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{selectedUser.accountStatus}</span></span></div>
                <div className="e-card-detail-row"><span className="label">Verified</span><span className="value">{selectedUser.isEmailVerified ? '✅ Yes' : '❌ No'}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { setPasswordForm({ userId: selectedUser._id, newPassword: '' }); setShowPasswordModal(true); setSelectedUser(null); }}>Reset Password</button>
              {selectedUser.accountStatus === 'ACTIVE' ? (
                <button className="btn btn-danger btn-sm" onClick={() => { handleStatusChange(selectedUser._id, 'SUSPENDED'); setSelectedUser(null); }}>Suspend</button>
              ) : (
                <button className="btn btn-success btn-sm" onClick={() => { handleStatusChange(selectedUser._id, 'ACTIVE'); setSelectedUser(null); }}>Activate</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Department</th><th>Year</th><th>Class</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--primary-400)' }}>{u.userId}</td>
                <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>{u.year}</td>
                <td>{u.className}</td>
                <td><span className={`badge ${u.accountStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{u.accountStatus}</span></td>
                <td>
                  <div className="table-action-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(u)}>View</button>
                    <button className="btn btn-secondary btn-sm btn-icon-only" title="Reset Password" onClick={() => { setPasswordForm({ userId: u._id, newPassword: '' }); setShowPasswordModal(true); }}>
                      <HiKey />
                    </button>
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

export default AdminUsers;
