import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiPlus, HiPencil, HiPhotograph, HiTrash, HiCheck, HiX, HiExternalLink } from 'react-icons/hi';

const PRESET_EVENT_IMAGES = [
  { name: 'Hackathon & Coding', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60' },
  { name: 'AI & Robotics Tech', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60' },
  { name: 'Cybersecurity Arena', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60' },
  { name: 'Gaming Tournament', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60' },
  { name: 'Design & UI/UX Sprint', url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=60' },
  { name: 'Campus Symposium', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' },
];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const initialForm = {
    name: '',
    description: '',
    imageUrl: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
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
  };

  const [form, setForm] = useState(initialForm);

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
      setMsg({ type: 'success', text: 'Event created successfully and published!' });
      setShowCreate(false);
      setForm(initialForm);
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create event.' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setForm({
      name: event.name || '',
      description: event.description || '',
      imageUrl: event.image?.url || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      startTime: event.startTime || '10:00 AM',
      endTime: event.endTime || '04:00 PM',
      location: event.location || '',
      registrationStart: event.registrationStart ? new Date(event.registrationStart).toISOString().split('T')[0] : '',
      registrationEnd: event.registrationEnd ? new Date(event.registrationEnd).toISOString().split('T')[0] : '',
      maxParticipants: event.maxParticipants || 50,
      status: event.status || 'REGISTRATION_OPEN',
      rules: event.rules || '',
      markingCriteria: event.markingCriteria?.length ? event.markingCriteria : [
        { name: 'Problem Solving', maxMarks: 40 },
        { name: 'Code Quality', maxMarks: 30 },
      ],
    });
    setMsg({ type: '', text: '' });
  };

  const handleUpdate = async (e) => {
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

      await api.put(`/admin/events/${editingEvent._id}`, payload);
      setMsg({ type: 'success', text: 'Event details and banner image updated successfully!' });
      setEditingEvent(null);
      setForm(initialForm);
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update event.' });
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
      subtitle="Create, edit, and curate campus competitions, details & banner images"
      headerActions={
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingEvent(null);
            setForm(initialForm);
            setShowCreate(true);
            setMsg({ type: '', text: '' });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <HiPlus /> Create Event
        </button>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Create / Edit Event Modal */}
      {(showCreate || editingEvent) && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setEditingEvent(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>{editingEvent ? '✏️ Edit Event Details & Banner' : '✨ Create New Campus Event'}</h2>
              <button className="modal-close" onClick={() => { setShowCreate(false); setEditingEvent(null); }}>✕</button>
            </div>
            <form onSubmit={editingEvent ? handleUpdate : handleCreate}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Code Carnival 2.0 / AI Hackathon"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Banner Image URL & Quick Presets */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiPhotograph /> Event Banner Image URL
                  </label>
                  <input
                    className="form-control"
                    placeholder="Paste image URL (https://...)"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />

                  {/* Preset quick selection */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                    {PRESET_EVENT_IMAGES.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                        onClick={() => setForm({ ...form, imageUrl: p.url })}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Live Image Preview */}
                  {form.imageUrl && (
                    <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', height: 140, border: '1px solid var(--border-color)' }}>
                      <img src={form.imageUrl} alt="Event Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Description & Agenda</label>
                  <textarea
                    className="form-control"
                    placeholder="Provide event overview, problem statements, and schedule highlights..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / Venue *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Main Auditorium / Lab 3"
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
                    <label>Max Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={form.maxParticipants === '' ? '' : form.maxParticipants}
                      onChange={(e) => setForm({ ...form, maxParticipants: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="REGISTRATION_OPEN">Registration Open</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="REGISTRATION_CLOSED">Registration Closed</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Rules & Guidelines</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter team requirements, tool limitations, guidelines..."
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
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setEditingEvent(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingEvent ? 'Saving Changes...' : 'Creating...') : (editingEvent ? 'Save Event Updates' : 'Publish Event')}
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
          <p>Click "+ Create Event" above to create and publish your first event.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Event ID</th>
                <th>Event Name & Venue</th>
                <th>Date</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const imgUrl = e.image?.url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&auto=format&fit=crop&q=60';
                return (
                  <tr key={e._id}>
                    <td>
                      <img
                        src={imgUrl}
                        alt={e.name}
                        style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{e.eventId}</td>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{e.name}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>📍 {e.location}</span>
                    </td>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(e)}
                          style={{ padding: '4px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title="Edit Event Details & Banner"
                        >
                          <HiPencil /> Edit
                        </button>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.76rem', width: 'auto' }}
                          value={e.status}
                          onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                        >
                          <option value="REGISTRATION_OPEN">Open</option>
                          <option value="UPCOMING">Upcoming</option>
                          <option value="REGISTRATION_CLOSED">Closed</option>
                          <option value="ONGOING">Ongoing</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="DRAFT">Draft</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEvents;
