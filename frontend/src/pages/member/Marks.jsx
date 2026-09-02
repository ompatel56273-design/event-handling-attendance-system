import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiCheckCircle, HiPencil, HiX, HiPlus } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';

const MemberMarks = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [evaluatedMarks, setEvaluatedMarks] = useState([]);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [markingCriteria, setMarkingCriteria] = useState([]);
  const [marksForm, setMarksForm] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
        setSelectedEvent(res.data[0]._id);
        loadEventDetails(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEventDetails = async (eventId) => {
    setSelectedEvent(eventId);
    setSelectedUser(null);
    if (!eventId) return;
    try {
      const [evtRes, marksRes, partsRes] = await Promise.allSettled([
        api.get(`/events/${eventId}`),
        api.get(`/marks/event/${eventId}`),
        api.get(`/events/${eventId}/participants`),
      ]);

      const criteria = evtRes.status === 'fulfilled' && evtRes.value.data.markingCriteria?.length > 0
        ? evtRes.value.data.markingCriteria
        : [
            { name: 'Problem Solving', maxMarks: 40 },
            { name: 'Logic & Approach', maxMarks: 30 },
            { name: 'Code Quality', maxMarks: 20 },
            { name: 'Time Management', maxMarks: 10 },
          ];

      setMarkingCriteria(criteria);
      if (marksRes.status === 'fulfilled') setEvaluatedMarks(marksRes.value.data || []);
      if (partsRes.status === 'fulfilled') setEventParticipants(partsRes.value.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startMarking = (studentObj) => {
    setSelectedUser(studentObj);
    setShowSelectModal(false);

    const existing = evaluatedMarks.find(m => (m.userId?._id || m.userId) === (studentObj._id || studentObj.userId));
    if (existing && existing.criteria?.length > 0) {
      setMarksForm(existing.criteria.map(c => ({
        name: c.name,
        maxMarks: c.maxMarks,
        marks: c.marks || c.obtainedMarks || 0,
      })));
    } else {
      const initialMarks = markingCriteria.map(c => ({
        name: c.name,
        maxMarks: c.maxMarks,
        marks: Math.round(c.maxMarks * 0.8),
      }));
      setMarksForm(initialMarks);
    }
  };

  const handleSubmitMarks = async () => {
    if (!selectedUser || !selectedEvent) return;
    setLoading(true);
    try {
      await api.post('/marks', {
        userId: selectedUser._id || selectedUser.userId,
        eventId: selectedEvent,
        criteria: marksForm,
      });
      setMsg({ type: 'success', text: 'Marks saved successfully!' });
      setSelectedUser(null);
      loadEventDetails(selectedEvent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit marks.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Live Scoring & Marking System
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Evaluate criteria and assign marks for student participants
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowSelectModal(true)}
          style={{ borderRadius: 12, fontWeight: 700, padding: '10px 22px' }}
        >
          <HiPlus /> Score Student
        </button>
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
            onChange={(e) => loadEventDetails(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
          >
            {events.map((e) => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluated Marks Table */}
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
              {evaluatedMarks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No evaluations submitted yet. Click "Score Student" above to start scoring.
                  </td>
                </tr>
              ) : (
                evaluatedMarks.map((m, idx) => {
                  const s = m.userId || {};
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                  const total = m.totalMarks || (m.criteria ? m.criteria.reduce((a, b) => a + (b.marks || b.obtainedMarks || 0), 0) : 0);

                  return (
                    <tr key={m._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.rollNumber || '—'}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.department || 'BCA'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.criteria?.map((c, i) => (
                            <span key={i} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
                              {c.name}: <strong>{c.marks || c.obtainedMarks}/{c.maxMarks}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#10B981', fontSize: '0.96rem' }}>{total} / 100</strong>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => startMarking(s)}
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
                          <HiPencil /> Rescore
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

      {/* Select Student Modal */}
      {showSelectModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowSelectModal(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Select Student to Evaluate</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowSelectModal(false)}><HiX /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, maxHeight: '50vh', overflowY: 'auto' }}>
              {eventParticipants.map((p, idx) => {
                const s = p.userId || p.student || {};
                const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                return (
                  <div
                    key={p._id || idx}
                    onClick={() => startMarking(s)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.department || 'BCA'} • Roll: {s.rollNumber || '—'}</span>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.84rem' }}>Select ➔</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scoring Modal */}
      {selectedUser && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedUser(null)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Score: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setSelectedUser(null)}><HiX /></button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {marksForm.map((crit, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>{crit.name} (Max: {crit.maxMarks})</label>
                  <input
                    type="number"
                    min="0"
                    max={crit.maxMarks}
                    value={crit.marks || 0}
                    onChange={(e) => {
                      const updated = [...marksForm];
                      updated[idx].marks = Number(e.target.value);
                      setMarksForm(updated);
                    }}
                    className="form-control"
                    style={{ width: 90, textAlign: 'center' }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmitMarks} disabled={loading}>
                  {loading ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MemberMarks;
