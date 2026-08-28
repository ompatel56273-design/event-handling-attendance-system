import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminMarks = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMark, setEditingMark] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/events');
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEvent(res.data[0]._id);
          loadMarks(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const loadMarks = async (eventId) => {
    setSelectedEvent(eventId);
    if (!eventId) {
      setMarks([]);
      return;
    }
    try {
      const res = await api.get(`/admin/marks?eventId=${eventId}`);
      setMarks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMarks = async () => {
    if (!editingMark) return;
    try {
      await api.put(`/admin/marks/${editingMark._id}`, { criteria: editingMark.criteria });
      setMsg({ type: 'success', text: 'Marks updated successfully!' });
      setEditingMark(null);
      loadMarks(selectedEvent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update marks.' });
    }
  };

  return (
    <DashboardLayout
      title="Marks Management"
      subtitle="View, grade, and adjust student evaluation marks across events"
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {editingMark && (
        <div className="modal-overlay" onClick={() => setEditingMark(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Edit Student Marks</h2>
              <button className="modal-close" onClick={() => setEditingMark(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: 16 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {editingMark.userId?.firstName} {editingMark.userId?.lastName}
                </h4>
                <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {editingMark.userId?.userId} • {editingMark.userId?.department}
                </p>
              </div>

              {editingMark.criteria.map((c, i) => (
                <div key={i} className="form-group">
                  <label>{c.name} (Max Marks: {c.maxMarks})</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    max={c.maxMarks}
                    value={c.marks === '' ? '' : c.marks}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(parseInt(e.target.value) || 0, c.maxMarks);
                      const updated = { ...editingMark, criteria: [...editingMark.criteria] };
                      updated.criteria[i] = { ...updated.criteria[i], marks: val };
                      setEditingMark(updated);
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F3F0FF', borderRadius: '10px', marginTop: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>Total Score:</strong>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {editingMark.criteria.reduce((s, c) => s + (Number(c.marks) || 0), 0)} / {editingMark.criteria.reduce((s, c) => s + (Number(c.maxMarks) || 0), 0)}
                </strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingMark(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateMarks}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ maxWidth: 360 }}>
          <label style={{ fontSize: '0.76rem', color: '#64748B', display: 'block', marginBottom: 6 }}>Select Event</label>
          <select
            className="form-control"
            value={selectedEvent}
            onChange={(e) => loadMarks(e.target.value)}
          >
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : marks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Marks Found</h3>
          <p>No participant marks have been submitted for this event yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Year / Class</th>
                <th>Roll No.</th>
                <th>Total Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {marks.map(m => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 600 }}>{m.userId?.firstName} {m.userId?.lastName}</td>
                  <td>{m.userId?.department || '—'}</td>
                  <td>{m.userId?.year || '—'}/{m.userId?.className || '—'}</td>
                  <td>{m.userId?.rollNumber || '—'}</td>
                  <td>
                    <span className="badge badge-success" style={{ fontWeight: 700 }}>
                      {m.totalMarks} / 100
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingMark(m)}>
                      Edit Marks
                    </button>
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

export default AdminMarks;
