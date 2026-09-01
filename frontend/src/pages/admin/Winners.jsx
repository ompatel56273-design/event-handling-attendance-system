import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({ eventId: '', userId: '', position: '1st Place', marks: 95 });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wRes, eRes] = await Promise.all([
        api.get('/winners'),
        api.get('/admin/events'),
      ]);
      setWinners(wRes.data);
      setEvents(eRes.data);
      if (eRes.data.length > 0) {
        setForm(prev => ({ ...prev, eventId: eRes.data[0]._id }));
        loadEventParticipants(eRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventParticipants = async (eventId) => {
    if (!eventId) {
      setParticipants([]);
      return;
    }
    try {
      const res = await api.get(`/admin/events/${eventId}/participants`);
      setParticipants(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, userId: res.data[0].userId?._id || '' }));
      } else {
        setForm(prev => ({ ...prev, userId: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setForm(prev => ({ ...prev, eventId }));
    loadEventParticipants(eventId);
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!form.eventId || !form.userId) {
      setMsg({ type: 'error', text: 'Please select an event and a participant student.' });
      return;
    }

    try {
      await api.post('/admin/winners', {
        ...form,
        marks: Number(form.marks) || 0,
      });
      setMsg({ type: 'success', text: 'Winner announced successfully!' });
      setShowCreate(false);
      const res = await api.get('/winners');
      setWinners(res.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create winner.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this winner record?')) return;
    try {
      await api.delete(`/admin/winners/${id}`);
      setMsg({ type: 'success', text: 'Winner record removed.' });
      setWinners(winners.filter(w => w._id !== id));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  const getPositionBadge = (pos) => {
    if (pos === '1st Place') return { bg: '#FEF3C7', color: '#D97706', label: '🥇 1st Place' };
    if (pos === '2nd Place') return { bg: '#F1F5F9', color: '#475569', label: '🥈 2nd Place' };
    return { bg: '#FFEDD5', color: '#C2410C', label: '🥉 3rd Place' };
  };

  return (
    <DashboardLayout
      title="Winners Management"
      subtitle="Publish and manage event winners and top rankings"
      headerActions={
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setMsg({ type: '', text: '' }); }}>
          + Add Winner
        </button>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Add Winner Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>Announce Event Winner</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Event</label>
                  <select
                    className="form-control"
                    value={form.eventId}
                    onChange={handleEventChange}
                    required
                  >
                    <option value="">Choose an event...</option>
                    {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Student Participant</label>
                  <select
                    className="form-control"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                  >
                    <option value="">Choose student...</option>
                    {participants.map(p => (
                      <option key={p.userId?._id || p._id} value={p.userId?._id || p._id}>
                        {p.userId?.firstName} {p.userId?.lastName} ({p.userId?.userId || 'USR'} - {p.userId?.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Position / Rank</label>
                    <select
                      className="form-control"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                    >
                      <option value="1st Place">🥇 1st Place</option>
                      <option value="2nd Place">🥈 2nd Place</option>
                      <option value="3rd Place">🥉 3rd Place</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Final Score (/ 100)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={100}
                      value={form.marks}
                      onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Winner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : winners.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No Winners Declared Yet</h3>
          <p>Click "+ Add Winner" to record podium finishers for completed events.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {winners.map(w => {
            const badge = getPositionBadge(w.position);
            return (
              <div key={w._id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 9999, fontSize: '0.74rem', fontWeight: 700 }}>
                  {badge.label}
                </div>

                {w.userId?.profileImage?.url ? (
                  <img src={w.userId.profileImage.url} alt="" style={{ width: 75, height: 75, borderRadius: '50%', objectFit: 'cover', margin: '10px auto 14px' }} />
                ) : (
                  <div className="identity-hero-avatar-placeholder" style={{ width: 75, height: 75, margin: '10px auto 14px', fontSize: '1.6rem' }}>
                    {w.userId?.firstName ? w.userId.firstName[0] : 'W'}
                  </div>
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {w.userId?.firstName} {w.userId?.lastName}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {w.userId?.department} | Roll: {w.userId?.rollNumber}
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', marginTop: 14, marginBottom: 14 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.84rem', color: '#FFFFFF' }}>{w.eventId?.name}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
                    Final Score: {w.marks} / 100
                  </p>
                </div>

                <button
                  className="btn btn-danger btn-sm btn-full"
                  onClick={() => handleDelete(w._id)}
                >
                  Remove Winner
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminWinners;
