import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiPencil, HiDownload, HiX, HiFilter } from 'react-icons/hi';
import { FaFileExcel, FaFileCsv } from 'react-icons/fa';

const AdminMarks = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMark, setEditingMark] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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

  const handleExport = async (format = 'xlsx') => {
    try {
      const res = await api.get(`/admin/marks/export?eventId=${selectedEvent || ''}&format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Marks_${selectedEvent ? 'Event' : 'All'}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Marks Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            View, grade, and adjust student evaluation marks across events
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => handleExport('xlsx')}
            style={{ borderRadius: 12, fontWeight: 700, padding: '10px 20px', gap: 8 }}
          >
            <FaFileExcel /> Export Excel
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExport('csv')}
            style={{ borderRadius: 12, fontWeight: 700, padding: '10px 20px', gap: 8 }}
          >
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Select Event Strip */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Event</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 380 }}>
          <HiCalendar style={{ color: 'var(--primary)' }} />
          <select
            value={selectedEvent}
            onChange={(e) => loadMarks(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
          >
            {events.map((e) => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
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
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>STUDENT</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>ROLL NO.</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>DEPARTMENT</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>CRITERIA BREAKDOWN</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>TOTAL SCORE</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No marks scored for this event yet.
                  </td>
                </tr>
              ) : (
                marks.map((m, idx) => {
                  const s = m.userId || {};
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                  const total = m.totalMarks || (m.criteria ? m.criteria.reduce((a, b) => a + (b.obtainedMarks || 0), 0) : 0);

                  return (
                    <tr key={m._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.rollNumber || '—'}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.department || 'BCA'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.criteria?.map((c, i) => (
                            <span key={i} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
                              {c.name}: <strong>{c.obtainedMarks}/{c.maxMarks}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#10B981', fontSize: '0.96rem' }}>{total} / 100</strong>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => setEditingMark(m)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 10,
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--primary)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <HiPencil /> Edit Marks
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingMark && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingMark(null)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Edit Criteria Marks</h3>
              <button className="modal-close-icon-btn" onClick={() => setEditingMark(null)}><HiX /></button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editingMark.criteria?.map((crit, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>{crit.name} (Max: {crit.maxMarks})</label>
                  <input
                    type="number"
                    min="0"
                    max={crit.maxMarks}
                    value={crit.obtainedMarks || 0}
                    onChange={(e) => {
                      const updated = [...editingMark.criteria];
                      updated[idx].obtainedMarks = Number(e.target.value);
                      setEditingMark({ ...editingMark, criteria: updated });
                    }}
                    className="form-control"
                    style={{ width: 90, textAlign: 'center' }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setEditingMark(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdateMarks}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminMarks;
