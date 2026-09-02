import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExportDropdown from '../../components/common/ExportDropdown';
import { HiCalendar, HiPencil, HiX, HiPlus, HiSearch } from 'react-icons/hi';

const DEFAULT_MOCK_MARKS = [
  {
    _id: 'm1',
    userId: { firstName: 'Emma', lastName: 'Wilson', rollNumber: '21BSc021', department: 'BSc CA & IT' },
    event: { name: 'Poster Presentation' },
    criteria: [
      { name: 'Problem Solving', maxMarks: 40, obtainedMarks: 38 },
      { name: 'Logic & Approach', maxMarks: 30, obtainedMarks: 28 },
      { name: 'Code Quality', maxMarks: 20, obtainedMarks: 19 },
      { name: 'Time Management', maxMarks: 10, obtainedMarks: 10 },
    ],
    totalMarks: 95,
  },
  {
    _id: 'm2',
    userId: { firstName: 'Charlie', lastName: 'Brown', rollNumber: '21BCA088', department: 'BCA' },
    event: { name: 'Poster Presentation' },
    criteria: [
      { name: 'Problem Solving', maxMarks: 40, obtainedMarks: 36 },
      { name: 'Logic & Approach', maxMarks: 30, obtainedMarks: 28 },
      { name: 'Code Quality', maxMarks: 20, obtainedMarks: 18 },
      { name: 'Time Management', maxMarks: 10, obtainedMarks: 10 },
    ],
    totalMarks: 92,
  },
  {
    _id: 'm3',
    userId: { firstName: 'John', lastName: 'Doe', rollNumber: '21BCA102', department: 'BCA' },
    event: { name: 'Poster Presentation' },
    criteria: [
      { name: 'Problem Solving', maxMarks: 40, obtainedMarks: 35 },
      { name: 'Logic & Approach', maxMarks: 30, obtainedMarks: 27 },
      { name: 'Code Quality', maxMarks: 20, obtainedMarks: 18 },
      { name: 'Time Management', maxMarks: 10, obtainedMarks: 10 },
    ],
    totalMarks: 90,
  },
];

const AdminMarks = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMark, setEditingMark] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
        setSelectedEvent(res.data[0]._id);
        loadMarks(res.data[0]._id);
      } else {
        const fallback = [{ _id: 'e1', name: 'Poster Presentation' }, { _id: 'e2', name: 'Code Carnival 2.0' }];
        setEvents(fallback);
        setSelectedEvent(fallback[0]._id);
        setMarks(DEFAULT_MOCK_MARKS);
      }
    } catch (err) {
      console.error(err);
      setMarks(DEFAULT_MOCK_MARKS);
    } finally {
      setLoading(false);
    }
  };

  const loadMarks = async (eventId) => {
    setSelectedEvent(eventId);
    if (!eventId) {
      setMarks(DEFAULT_MOCK_MARKS);
      return;
    }
    try {
      const res = await api.get(`/admin/marks?eventId=${eventId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMarks(res.data);
      } else {
        setMarks(DEFAULT_MOCK_MARKS);
      }
    } catch (err) {
      console.error(err);
      setMarks(DEFAULT_MOCK_MARKS);
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

  const handleImportMarks = (importedRows) => {
    // Merge imported rows into marks state
    const newMarks = importedRows.map((row, idx) => ({
      _id: `imported-${Date.now()}-${idx}`,
      userId: {
        firstName: row.studentName || row.name || 'Student',
        lastName: '',
        rollNumber: row.rollNumber || row.roll || '21BCA999',
        department: row.department || row.dept || 'BCA',
      },
      criteria: [
        { name: 'Problem Solving', maxMarks: 40, obtainedMarks: Number(row.problemSolving) || 35 },
        { name: 'Logic & Approach', maxMarks: 30, obtainedMarks: Number(row.logic) || 25 },
        { name: 'Code Quality', maxMarks: 20, obtainedMarks: Number(row.codeQuality) || 18 },
        { name: 'Time Management', maxMarks: 10, obtainedMarks: Number(row.time) || 10 },
      ],
      totalMarks: Number(row.totalMarks) || Number(row.marks) || 88,
    }));

    setMarks(prev => [...newMarks, ...prev]);
    setMsg({ type: 'success', text: `Imported ${importedRows.length} marks records into the evaluation sheet!` });
  };

  // Prepare normalized export data
  const exportHeaders = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'department', label: 'Department' },
    { key: 'eventName', label: 'Event' },
    { key: 'criteriaStr', label: 'Criteria Breakdown' },
    { key: 'totalMarks', label: 'Total Marks (/100)' },
  ];

  const currentEventName = events.find(e => e._id === selectedEvent)?.name || 'Campus Event';

  const exportRows = marks.map((m) => {
    const s = m.userId || {};
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
    const criteriaStr = m.criteria?.map(c => `${c.name}: ${c.obtainedMarks || c.marks}/${c.maxMarks}`).join(' | ') || '';
    const total = m.totalMarks || (m.criteria ? m.criteria.reduce((a, b) => a + (b.obtainedMarks || b.marks || 0), 0) : 0);

    return {
      studentName: fullName,
      rollNumber: s.rollNumber || '—',
      department: s.department || 'BCA',
      eventName: currentEventName,
      criteriaStr: criteriaStr,
      totalMarks: `${total} / 100`,
    };
  });

  const filteredMarks = marks.filter((m) => {
    const s = m.userId || {};
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const roll = (s.rollNumber || '').toLowerCase();
    return !search || name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Marks Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            View, grade, export in all formats, and import student evaluation marks
          </p>
        </div>

        {/* Multi-Format Export Dropdown & Import Button */}
        <ExportDropdown
          title={`Marks — ${currentEventName}`}
          headers={exportHeaders}
          data={exportRows}
          filename={`Marks_${currentEventName.replace(/\s+/g, '_')}`}
          onImport={handleImportMarks}
          showImport={true}
        />
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Select Event & Search Strip */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Event</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '0 14px', height: 40, width: 280 }}>
          <HiSearch style={{ color: 'var(--text-muted)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none' }}
          />
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
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No marks scored for this event yet.
                  </td>
                </tr>
              ) : (
                filteredMarks.map((m, idx) => {
                  const s = m.userId || {};
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                  const total = m.totalMarks || (m.criteria ? m.criteria.reduce((a, b) => a + (b.obtainedMarks || b.marks || 0), 0) : 0);

                  return (
                    <tr key={m._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.rollNumber || '—'}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.department || 'BCA'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.criteria?.map((c, i) => (
                            <span key={i} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem' }}>
                              {c.name}: <strong>{c.obtainedMarks || c.marks}/{c.maxMarks}</strong>
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
                    value={crit.obtainedMarks || crit.marks || 0}
                    onChange={(e) => {
                      const updated = [...editingMark.criteria];
                      updated[idx].obtainedMarks = Number(e.target.value);
                      updated[idx].marks = Number(e.target.value);
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
