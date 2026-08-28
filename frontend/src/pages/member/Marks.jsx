import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCheckCircle } from 'react-icons/hi';

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
      setEvents(res.data);
      if (res.data.length > 0) {
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
      const [evtRes, marksRes, partsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/marks/event/${eventId}`),
        api.get(`/events/${eventId}/participants`),
      ]);

      const criteria = evtRes.data.markingCriteria?.length > 0
        ? evtRes.data.markingCriteria
        : [
            { name: 'Problem Solving', maxMarks: 40 },
            { name: 'Logic & Approach', maxMarks: 30 },
            { name: 'Code Quality', maxMarks: 20 },
            { name: 'Time Management', maxMarks: 10 },
          ];

      setMarkingCriteria(criteria);
      setEvaluatedMarks(marksRes.data);
      setEventParticipants(partsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startMarking = (studentObj) => {
    setSelectedUser(studentObj);
    setShowSelectModal(false);

    // Check if this student already has evaluated marks
    const existing = evaluatedMarks.find(m => (m.userId?._id || m.userId) === (studentObj._id || studentObj.userId));
    if (existing && existing.criteria?.length > 0) {
      setMarksForm(existing.criteria.map(c => ({
        name: c.name,
        maxMarks: c.maxMarks,
        marks: c.marks,
      })));
    } else {
      const initialMarks = markingCriteria.map(c => ({
        name: c.name,
        maxMarks: c.maxMarks,
        marks: Math.round(c.maxMarks * 0.75),
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

  const totalObtained = marksForm.reduce((s, c) => s + (Number(c.marks) || 0), 0);
  const totalMax = marksForm.reduce((s, c) => s + (Number(c.maxMarks) || 0), 0);

  return (
    <DashboardLayout
      title="Marks Entry & Scoring"
      subtitle="Grade participants based on event-specific evaluation criteria"
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Modal to pick student participant */}
      {showSelectModal && (
        <div className="modal-overlay" onClick={() => setShowSelectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Select Student to Grade</h2>
              <button className="modal-close" onClick={() => setShowSelectModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 380, overflowY: 'auto' }}>
              {eventParticipants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                  No participants registered for this event.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {eventParticipants.map(p => (
                    <div
                      key={p._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => startMarking(p.userId)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                    >
                      <div>
                        <strong style={{ display: 'block' }}>{p.userId?.firstName} {p.userId?.lastName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.userId?.userId} • {p.userId?.department} ({p.userId?.rollNumber})
                        </span>
                      </div>
                      <button className="btn btn-primary btn-sm">Select</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1.2fr 1fr' : '1fr', gap: 24 }}>
        {/* Left: Event Selector & Participants Table */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.76rem', color: '#64748B' }}>Select Event</label>
              <select
                className="form-control"
                value={selectedEvent}
                onChange={(e) => loadEventDetails(e.target.value)}
              >
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Evaluated Participants</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowSelectModal(true)}
              >
                + Grade Participant
              </button>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Roll No.</th>
                    <th>Total Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluatedMarks.length > 0 ? (
                    evaluatedMarks.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.userId?.firstName} {p.userId?.lastName}</td>
                        <td>{p.userId?.department}</td>
                        <td>{p.userId?.rollNumber}</td>
                        <td><span className="badge badge-success">{p.totalMarks} / 100</span></td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => startMarking(p.userId)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: '30px' }}>
                        No marks entered for this event yet. Click "+ Grade Participant" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Exact Mark Entry Panel */}
        {selectedUser && (
          <div className="card" style={{ border: '2px solid #5C33CF' }}>
            <div className="card-header" style={{ borderBottom: '1px solid #EAEFF5', paddingBottom: 14 }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: 4 }}>Evaluation Form</span>
                <h3 style={{ fontSize: '1.15rem' }}>Mark Entry</h3>
              </div>
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <HiCheckCircle /> Valid Registration
              </span>
            </div>

            {/* Student Info Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px' }}>
              <div className="identity-hero-avatar-placeholder" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                {selectedUser.firstName ? selectedUser.firstName[0] : 'S'}
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </h4>
                <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {selectedUser.userId || 'USR'} • {selectedUser.department || 'BCA'} (Roll: {selectedUser.rollNumber})
                </p>
              </div>
            </div>

            {/* Criteria Marks Table */}
            <div className="table-container" style={{ border: 'none', boxShadow: 'none', marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th style={{ width: '90px' }}>Marks</th>
                    <th style={{ width: '90px' }}>Max Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {marksForm.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{c.name}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          max={c.maxMarks}
                          value={c.marks === '' ? '' : c.marks}
                          style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, width: '75px' }}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.min(parseInt(e.target.value) || 0, c.maxMarks);
                            const updated = [...marksForm];
                            updated[i].marks = val;
                            setMarksForm(updated);
                          }}
                        />
                      </td>
                      <td style={{ color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
                        {c.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#F3F0FF', borderRadius: '12px', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>Total Score:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {totalObtained} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ {totalMax}</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitMarks} disabled={loading}>
                {loading ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberMarks;
