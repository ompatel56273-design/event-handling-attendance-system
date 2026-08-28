import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    registrationStart: '',
    registrationEnd: '',
    maxParticipants: 50,
    status: 'REGISTRATION_OPEN',
    rules: '',
    markingCriteria: [
      { name: 'Problem Solving', maxMarks: 40 },
      { name: 'Logic & Approach', maxMarks: 30 },
      { name: 'Code Quality', maxMarks: 20 },
      { name: 'Time Management', maxMarks: 10 },
    ],
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMsg({ type: 'error', text: err.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.date || !form.location) {
      setMsg({ type: 'error', text: 'Event Name, Date, and Location are required.' });
      return;
    }

    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const payload = {
        ...form,
        maxParticipants: Number(form.maxParticipants) || 50,
        markingCriteria: form.markingCriteria.filter(c => c.name && Number(c.maxMarks) > 0).map(c => ({
          name: c.name.trim(),
          maxMarks: Number(c.maxMarks),
        })),
      };

      if (!payload.registrationStart) delete payload.registrationStart;
      if (!payload.registrationEnd) delete payload.registrationEnd;

      await api.post('/admin/events', payload);
      setMsg({ type: 'success', text: 'Event created successfully!' });
      setShowCreate(false);
      setForm({
        name: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        registrationStart: '',
        registrationEnd: '',
        maxParticipants: 50,
        status: 'REGISTRATION_OPEN',
        rules: '',
        markingCriteria: [
          { name: 'Problem Solving', maxMarks: 40 },
          { name: 'Logic & Approach', maxMarks: 30 },
          { name: 'Code Quality', maxMarks: 20 },
          { name: 'Time Management', maxMarks: 10 },
        ],
      });
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create event.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/events/${id}/status`, { status });
      setMsg({ type: 'success', text: `Event status updated to ${status}.` });
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  const addCriteria = () => setForm({ ...form, markingCriteria: [...form.markingCriteria, { name: '', maxMarks: 20 }] });
  const removeCriteria = (i) => setForm({ ...form, markingCriteria: form.markingCriteria.filter((_, idx) => idx !== i) });
  const updateCriteria = (i, field, value) => {
    const updated = [...form.markingCriteria];
    updated[i][field] = field === 'maxMarks' ? (value === '' ? '' : parseInt(value) || 0) : value;
    setForm({ ...form, markingCriteria: updated });
  };

  return (
    <DashboardLayout
      title="Event Management"
      subtitle="Create and manage college competitions and symposiums"
      headerActions={
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setMsg({ type: '', text: '' }); }}>
          + Create Event
        </button>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Create Event Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Code Carnival 2.0"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Provide event details and agenda..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / Venue</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Seminar Hall / Lab 3"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 10:00 AM"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 04:00 PM"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={form.maxParticipants === '' ? '' : form.maxParticipants}
                      onChange={(e) => setForm({ ...form, maxParticipants: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="REGISTRATION_OPEN">Registration Open</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Rules & Guidelines</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter participation guidelines..."
                    value={form.rules}
                    onChange={(e) => setForm({ ...form, rules: e.target.value })}
                    rows={2}
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Marking & Evaluation Criteria</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addCriteria}>
                      + Add Criteria
                    </button>
                  </div>

                  {form.markingCriteria.map((c, i) => (
                    <div key={i} className="form-row" style={{ alignItems: 'center', marginBottom: 8 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          className="form-control"
                          placeholder="e.g. Problem Solving"
                          value={c.name}
                          onChange={(e) => updateCriteria(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: 6 }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max Marks"
                          value={c.maxMarks === '' ? '' : c.maxMarks}
                          onChange={(e) => updateCriteria(i, 'maxMarks', e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeCriteria(i)}
                          style={{ padding: '0 12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <h3>No Events Created Yet</h3>
          <p>Click "+ Create Event" above to create your first event.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{e.eventId}</td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>{new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`badge ${e.status === 'REGISTRATION_OPEN' ? 'badge-success' : e.status === 'UPCOMING' ? 'badge-info' : 'badge-neutral'}`}>
                      {e.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <strong>{e.participantCount || 0}</strong> / {e.maxParticipants}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                      value={e.status}
                      onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                    >
                      <option value="REGISTRATION_OPEN">Registration Open</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="REGISTRATION_CLOSED">Registration Closed</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEvents;
