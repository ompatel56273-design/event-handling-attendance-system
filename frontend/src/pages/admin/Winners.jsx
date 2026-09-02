import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiPlus, HiSearch, HiRefresh,
  HiCalendar, HiTrash, HiX, HiFilter,
  HiChevronLeft, HiChevronRight
} from 'react-icons/hi';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const DEFAULT_MOCK_WINNERS = [
  {
    _id: 'w1',
    position: '1st Place',
    user: { firstName: 'Emma', lastName: 'Wilson', department: 'BSc CA & IT', year: 2, className: 'A', rollNumber: '21BSc021' },
    event: { name: 'Poster Presentation' },
    score: 95,
    createdAt: '2026-09-02',
  },
  {
    _id: 'w2',
    position: '2nd Place',
    user: { firstName: 'Charlie', lastName: 'Brown', department: 'BCA', year: 2, className: 'C', rollNumber: '21BCA088' },
    event: { name: 'Poster Presentation' },
    score: 92,
    createdAt: '2026-09-02',
  },
  {
    _id: 'w3',
    position: '3rd Place',
    user: { firstName: 'John', lastName: 'Doe', department: 'BCA', year: 2, className: 'A', rollNumber: '21BCA102' },
    event: { name: 'Poster Presentation' },
    score: 90,
    createdAt: '2026-09-02',
  },
];

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [search, setSearch] = useState('');
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
      const [wRes, eRes] = await Promise.allSettled([
        api.get('/winners'),
        api.get('/admin/events'),
      ]);

      if (wRes.status === 'fulfilled' && Array.isArray(wRes.value.data) && wRes.value.data.length > 0) {
        setWinners(wRes.value.data);
      } else {
        setWinners(DEFAULT_MOCK_WINNERS);
      }

      if (eRes.status === 'fulfilled' && Array.isArray(eRes.value.data)) {
        setEvents(eRes.value.data);
        if (eRes.value.data.length > 0) {
          setForm(prev => ({ ...prev, eventId: eRes.value.data[0]._id }));
          loadEventParticipants(eRes.value.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      setWinners(DEFAULT_MOCK_WINNERS);
    } finally {
      setLoading(false);
    }
  };

  const loadEventParticipants = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await api.get(`/admin/events/${eventId}/participants`);
      setParticipants(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, userId: res.data[0].userId?._id || res.data[0].student?._id || '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!form.eventId || !form.userId) {
      setMsg({ type: 'error', text: 'Please select an event and participant.' });
      return;
    }

    try {
      await api.post('/admin/winners', { ...form, marks: Number(form.marks) || 90 });
      setMsg({ type: 'success', text: 'Winner announced successfully!' });
      setShowCreate(false);
      fetchData();
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

  const firstPlace = winners.find(w => w.position === '1st Place') || DEFAULT_MOCK_WINNERS[0];
  const secondPlace = winners.find(w => w.position === '2nd Place') || DEFAULT_MOCK_WINNERS[1];
  const thirdPlace = winners.find(w => w.position === '3rd Place') || DEFAULT_MOCK_WINNERS[2];

  const filteredWinners = winners.filter(w => {
    const student = w.user || w.student || {};
    const name = `${student.firstName || ''} ${student.lastName || ''} ${student.name || ''}`.toLowerCase();
    const roll = (student.rollNumber || '').toLowerCase();
    return !search || name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      {/* =========================================================================
          PAGE HEADER (Exact Super admin/6.png Layout)
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Winners Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Publish and manage event winners and top rankings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ borderRadius: 12, fontWeight: 700, padding: '10px 22px' }}
          >
            <HiPlus /> Add Winner
          </button>

          <button
            style={{
              height: 42,
              padding: '0 16px',
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            <HiFilter /> Filters
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Select Event Strip */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Event</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 400 }}>
          <HiCalendar style={{ color: 'var(--primary)' }} />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">Poster Presentation</option>
            {events.map(e => <option key={e._id} value={e.name}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* =========================================================================
          3 PODIUM CARDS ROW (Exact Super admin/6.png Layout)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr 1fr',
          gap: 20,
          marginBottom: 32,
          alignItems: 'center',
        }}
      >
        {/* 2nd Place (Silver) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 22,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              🥈 2nd Place
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: '#6366F1', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem' }}>
                {(secondPlace.user?.firstName?.[0] || 'C')}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                  {secondPlace.user?.firstName || 'Charlie'} {secondPlace.user?.lastName || 'Brown'}
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                  {secondPlace.user?.department || 'BCA'} | {secondPlace.user?.year || 2}nd Year - {secondPlace.user?.className || 'C'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Roll No. {secondPlace.user?.rollNumber || '21BCA088'}
                </span>
              </div>
            </div>

            {/* Silver Trophy Graphic */}
            <div style={{ fontSize: '3rem', opacity: 0.9 }}>🏆</div>
          </div>

          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>Final Score:</span>
            <strong style={{ fontSize: '0.96rem', color: 'var(--primary)' }}>
              {secondPlace.score || secondPlace.marks || 92} / 100
            </strong>
          </div>
        </div>

        {/* 1st Place (Gold Elevated Center) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '2px solid #F59E0B',
            borderRadius: 24,
            padding: '28px',
            boxShadow: '0 12px 35px rgba(245, 158, 11, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            transform: 'scale(1.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#D97706', fontSize: '0.82rem', fontWeight: 900, padding: '5px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              🏆 1st Place
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.6rem', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)' }}>
                {(firstPlace.user?.firstName?.[0] || 'E')}
              </div>
              <div>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'block' }}>
                  {firstPlace.user?.firstName || 'Emma'} {firstPlace.user?.lastName || 'Wilson'}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {firstPlace.user?.department || 'BSc CA & IT'} | {firstPlace.user?.year || 2}nd Year - {firstPlace.user?.className || 'A'}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Roll No. {firstPlace.user?.rollNumber || '21BSc021'}
                </span>
              </div>
            </div>

            {/* Gold Trophy Graphic */}
            <div style={{ fontSize: '3.6rem' }}>🥇</div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 14, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', color: '#B45309', fontWeight: 700 }}>Final Score:</span>
            <strong style={{ fontSize: '1.05rem', color: '#D97706' }}>
              {firstPlace.score || firstPlace.marks || 95} / 100
            </strong>
          </div>
        </div>

        {/* 3rd Place (Bronze) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 22,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#E11D48', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              🥉 3rd Place
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: '#E11D48', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem' }}>
                {(thirdPlace.user?.firstName?.[0] || 'J')}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                  {thirdPlace.user?.firstName || 'John'} {thirdPlace.user?.lastName || 'Doe'}
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                  {thirdPlace.user?.department || 'BCA'} | {thirdPlace.user?.year || 2}nd Year - {thirdPlace.user?.className || 'A'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Roll No. {thirdPlace.user?.rollNumber || '21BCA102'}
                </span>
              </div>
            </div>

            {/* Bronze Trophy */}
            <div style={{ fontSize: '3rem', opacity: 0.9 }}>🥉</div>
          </div>

          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>Final Score:</span>
            <strong style={{ fontSize: '0.96rem', color: '#E11D48' }}>
              {thirdPlace.score || thirdPlace.marks || 90} / 100
            </strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ALL WINNERS TABLE
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        {/* Table Top Filter Bar */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaTrophy style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              All Winners
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '0 14px', height: 40, width: 280 }}>
              <HiSearch style={{ color: 'var(--text-muted)', marginRight: 8 }} />
              <input
                type="text"
                placeholder="Search winner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none' }}
              />
            </div>

            <button
              onClick={() => setSearch('')}
              style={{ height: 40, padding: '0 16px', borderRadius: 12, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <HiRefresh /> Reset
            </button>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>POSITION</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>WINNER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>DEPARTMENT</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>YEAR / CLASS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>ROLL NO.</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>SCORE</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>AWARDED ON</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map((w, idx) => {
                const s = w.user || w.student || {};
                const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Emma Wilson';
                const initial = (s.firstName?.[0] || name[0] || 'W').toUpperCase();
                const posBadge = w.position === '1st Place' ? '🥇 1st' : w.position === '2nd Place' ? '🥈 2nd' : '🥉 3rd';
                const posColor = w.position === '1st Place' ? '#F59E0B' : w.position === '2nd Place' ? '#6366F1' : '#E11D48';

                return (
                  <tr key={w._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: `${posColor}1A`, color: posColor, fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 14 }}>
                        {posBadge}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: posColor, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                          {initial}
                        </div>
                        <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.department || 'BSc CA & IT'}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{s.year || 2}/{s.className || 'A'}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>{s.rollNumber || '21BSc021'}</td>

                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#10B981', fontSize: '0.94rem' }}>
                        {w.score || w.marks || 95} / 100
                      </strong>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiCalendar />
                        {new Date(w.createdAt || '2026-09-02').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '6px 14px',
                          borderRadius: 10,
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--primary)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>Showing 1 to {filteredWinners.length} of {filteredWinners.length} winners</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiChevronLeft /></button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#FFFFFF', border: 'none', fontWeight: 800, cursor: 'pointer' }}>1</button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* Add Winner Modal */}
      {showCreate && (
        <div className="modal-backdrop-overlay" onClick={() => setShowCreate(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Announce Podium Winner</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowCreate(false)}><HiX /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Event</label>
                <select
                  value={form.eventId}
                  onChange={(e) => {
                    setForm({ ...form, eventId: e.target.value });
                    loadEventParticipants(e.target.value);
                  }}
                  className="form-control"
                >
                  {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Participant</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="form-control"
                >
                  {participants.map(p => (
                    <option key={p._id} value={p.userId?._id || p.student?._id || p._id}>
                      {p.userId?.firstName || p.student?.firstName || 'Participant'} ({p.userId?.userId || p.student?.userId || p._id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Podium Rank</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="form-control"
                  >
                    <option value="1st Place">🥇 1st Place</option>
                    <option value="2nd Place">🥈 2nd Place</option>
                    <option value="3rd Place">🥉 3rd Place</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Final Score (/100)</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: e.target.value })}
                    className="form-control"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Announce Winner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminWinners;
