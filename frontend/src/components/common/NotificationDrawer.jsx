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
          maxWidth: '680px',
          width: '94%',
          background: 'var(--bg-modal)',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px var(--primary-subtle)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '22px 28px', borderBottom: '1px solid var(--border-color)', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.8rem', display: 'inline-flex' }}>🔔</span>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>Notifications & Broadcasts</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Campus announcements and real-time event updates
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close" style={{ fontSize: '1.6rem' }}>
            <HiX />
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.86rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={handleMarkAllRead}
          >
            <HiCheck style={{ fontSize: '1.1rem' }} /> Mark All Read
          </button>

          {canBroadcast && (
            <button
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.86rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowBroadcastModal(true)}
            >
              <HiPlus style={{ fontSize: '1.1rem' }} /> New Broadcast
            </button>
          )}
        </div>

        {/* List of Announcements */}
        <div style={{ padding: '22px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 10px' }}>
              <div className="empty-icon" style={{ fontSize: '2.5rem' }}>🔕</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: 10 }}>No Notifications</h3>
              <p style={{ fontSize: '0.9rem' }}>You're all caught up with campus events and announcements.</p>
            </div>
          ) : (
            announcements.map((a) => {
              const badge = getUrgencyBadge(a.urgency);
              return (
                <div
                  key={a._id}
                  onClick={() => !a.isRead && handleMarkSingleRead(a._id)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '16px',
                    background: a.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                    border: a.isRead ? '1px solid var(--border-color)' : `1px solid ${badge.color}80`,
                    boxShadow: !a.isRead ? `0 0 16px ${badge.color}25` : 'none',
                    cursor: a.isRead ? 'default' : 'pointer',
                    transition: 'all 200ms ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {badge.label}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                    {a.title}
                  </h4>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {a.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: '0.8rem', color: 'var(--primary)' }}>
                    <span style={{ fontWeight: 600 }}>📢 By {a.createdByName}</span>
                    {!a.isRead && (
                      <span style={{ color: '#10B981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> New
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Broadcast Modal Overlay */}
        {showBroadcastModal && (
          <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)} style={{ zIndex: 1100 }}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '580px', width: '92%', borderRadius: '20px', padding: '24px' }}
            >
              <div className="modal-header">
                <h2>📢 Broadcast Campus Announcement</h2>
                <button className="modal-close" onClick={() => setShowBroadcastModal(false)}>✕</button>
              </div>

              {msg.text && (
                <div className={`alert alert-${msg.type}`}>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleBroadcast}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label>Announcement Headline</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Schedule Update for Workshop"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Urgency Level</label>
                      <select
                        className="form-control"
                        value={form.urgency}
                        onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                      >
                        <option value="INFO">Information (Normal)</option>
                        <option value="WARNING">Important Notice</option>
                        <option value="URGENT">Urgent Alert</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Target Audience</label>
                      <select
                        className="form-control"
                        value={form.targetAudience}
                        onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      >
                        <option value="ALL">Everyone</option>
                        <option value="STUDENTS">Students Only</option>
                        <option value="EVENT_MEMBERS">Event Coordinators</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Broadcast Message Body</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Write your broadcast update message here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ gap: 12, marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBroadcastModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={broadcasting}
                  >
                    {broadcasting ? 'Broadcasting...' : '📢 Publish Broadcast'}
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
