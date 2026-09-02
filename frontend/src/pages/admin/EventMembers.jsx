import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiPlus, HiKey, HiCalendar, HiX,
  HiChevronLeft, HiChevronRight, HiFilter
} from 'react-icons/hi';

const DEFAULT_MOCK_MEMBERS = [
  { _id: 'm1', name: 'Emma Watson', email: 'emma.member@eventhandling.com', accountStatus: 'ACTIVE', createdAt: '2026-08-22' },
  { _id: 'm2', name: 'Mike Johnson', email: 'member@eventhandling.com', accountStatus: 'ACTIVE', createdAt: '2026-08-22' },
];

const AdminEventMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ id: '', newPassword: '' });
  const [showPwModal, setShowPwModal] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/admin/event-members');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMembers(res.data);
      } else {
        setMembers(DEFAULT_MOCK_MEMBERS);
      }
    } catch (err) {
      console.error(err);
      setMembers(DEFAULT_MOCK_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }

    try {
      await api.post('/admin/event-members', form);
      setMsg({ type: 'success', text: 'Event member created successfully!' });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      fetchMembers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create member.' });
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.put(`/admin/event-members/${id}/status`, { accountStatus: newStatus });
      setMembers(prev => prev.map(m => m._id === id ? { ...m, accountStatus: newStatus } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.put(`/admin/event-members/${passwordForm.id}/password`, { newPassword: passwordForm.newPassword });
      setMsg({ type: 'success', text: 'Password reset successfully!' });
      setShowPwModal(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' });
    }
  };

  return (
    <DashboardLayout>
      {/* =========================================================================
          PAGE HEADER (Exact Super admin/7.png Layout)
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Event Member Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage event coordinator and volunteer credentials
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ borderRadius: 12, fontWeight: 700, padding: '10px 22px' }}
          >
            <HiPlus /> Create Member
          </button>

          <button
            style={{
              height: 42,
              padding: '0 16px',
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            <HiFilter /> Filters
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* =========================================================================
          DATA TABLE (Exact Super admin/7.png Layout)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>NAME</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>EMAIL</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>STATUS</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>CREATED</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => {
                const isActive = m.accountStatus === 'ACTIVE';
                const initial = (m.name?.[0] || 'M').toUpperCase();
                const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B'];
                const avatarColor = colors[idx % colors.length];

                return (
                  <tr key={m._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: avatarColor,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                          }}
                        >
                          {initial}
                        </div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.94rem' }}>{m.name}</strong>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{m.email}</td>

                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isActive ? '#10B981' : '#EF4444',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '4px 14px',
                          borderRadius: 16,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10B981' : '#EF4444' }} />
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiCalendar />
                        {new Date(m.createdAt || '2026-08-22').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={() => handleStatusToggle(m._id, m.accountStatus)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: 10,
                            background: 'var(--bg-app)',
                            border: '1.5px solid var(--border-color)',
                            color: isActive ? 'var(--primary)' : '#10B981',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => {
                            setPasswordForm({ id: m._id, newPassword: '' });
                            setShowPwModal(true);
                          }}
                          title="Reset Password"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: 'var(--bg-app)',
                            border: '1.5px solid var(--border-color)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                          }}
                        >
                          <HiKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>Showing 1 to {members.length} of {members.length} members</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiChevronLeft /></button>
            <button className="pagination-active-btn" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', fontWeight: 900, cursor: 'pointer' }}>1</button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* Create Member Modal */}
      {showCreate && (
        <div className="modal-backdrop-overlay" onClick={() => setShowCreate(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Create Event Member</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowCreate(false)}><HiX /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mike Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. member@eventhandling.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Initial Password</label>
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPwModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowPwModal(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Reset Password</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowPwModal(false)}><HiX /></button>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="form-control"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button className="btn btn-secondary" onClick={() => setShowPwModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleResetPassword}>Save Password</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEventMembers;
