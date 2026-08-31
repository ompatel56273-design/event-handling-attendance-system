import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HiBell, HiX, HiCheck, HiSpeakerphone, HiExclamation, HiInformationCircle, HiPlus } from 'react-icons/hi';

const NotificationDrawer = ({
  isOpen,
  onClose,
  announcements,
  onRefresh,
}) => {
  const { role } = useAuth();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', urgency: 'INFO', targetAudience: 'ALL' });
  const [broadcasting, setBroadcasting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const canBroadcast = role === 'SUPER_ADMIN' || role === 'EVENT_MEMBER';

  const handleMarkAllRead = async () => {
    try {
      await api.put('/announcements/read-all');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.put(`/announcements/${id}/read`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setBroadcasting(true);
    try {
      await api.post('/announcements', form);
      setMsg({ type: 'success', text: 'Announcement broadcasted successfully!' });
      setForm({ title: '', message: '', urgency: 'INFO', targetAudience: 'ALL' });
      setShowBroadcastModal(false);
      onRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to broadcast announcement.' });
    } finally {
      setBroadcasting(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'URGENT') return { label: 'URGENT', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)' };
    if (urgency === 'WARNING') return { label: 'NOTICE', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)' };
    return { label: 'INFO', bg: 'rgba(14, 165, 233, 0.15)', color: '#0EA5E9', border: '1px solid rgba(14, 165, 233, 0.4)' };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '92%',
          background: '#0B0D15',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.3rem' }}>🔔</span>
            <div>
              <h2>Notifications & Broadcasts</h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Campus announcements and real-time updates
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <HiX />
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ padding: '10px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
            onClick={handleMarkAllRead}
          >
            <HiCheck /> Mark All Read
          </button>

          {canBroadcast && (
            <button
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => setShowBroadcastModal(true)}
            >
              <HiPlus /> New Broadcast
            </button>
          )}
        </div>

        {/* List of Announcements */}
        <div style={{ padding: '16px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div className="empty-icon">🔕</div>
              <h3>No Notifications</h3>
              <p>You're all caught up with campus events and announcements.</p>
            </div>
          ) : (
            announcements.map((a) => {
              const badge = getUrgencyBadge(a.urgency);
              return (
                <div
                  key={a._id}
                  onClick={() => !a.isRead && handleMarkSingleRead(a._id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: a.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.06)',
                    border: a.isRead ? '1px solid var(--border-color)' : `1px solid ${badge.color}60`,
                    boxShadow: !a.isRead ? `0 0 14px ${badge.color}20` : 'none',
                    cursor: a.isRead ? 'default' : 'pointer',
                    transition: 'all 200ms ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                      }}
                    >
                      {badge.label}
                    </span>

                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                    {a.title}
                  </h4>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {a.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: '0.68rem', color: 'var(--primary)' }}>
                    <span>📢 By {a.createdByName}</span>
                    {!a.isRead && <span style={{ color: '#00D27A', fontWeight: 700 }}>● New</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Broadcast Modal Dialog */}
        {showBroadcastModal && (
          <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)} style={{ zIndex: 1100 }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <h2>📢 Broadcast Announcement</h2>
                <button className="modal-close" onClick={() => setShowBroadcastModal(false)}>✕</button>
              </div>

              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Announcement Title</label>
                  <input
                    className="form-control"
                    placeholder="e.g., Venue Change for Hackathon"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Message Content</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide details about schedule, venue, or urgent campus updates..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row" style={{ marginBottom: 0 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Urgency Level</label>
                    <select
                      className="form-control"
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    >
                      <option value="INFO">ℹ️ General Info</option>
                      <option value="WARNING">⚠️ Important Notice</option>
                      <option value="URGENT">🚨 Urgent Alert</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Target Audience</label>
                    <select
                      className="form-control"
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    >
                      <option value="ALL">Everyone</option>
                      <option value="STUDENTS">Students Only</option>
                      <option value="EVENT_MEMBERS">Event Members</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: 10 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowBroadcastModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={broadcasting}>
                    {broadcasting ? 'Broadcasting...' : 'Push Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
