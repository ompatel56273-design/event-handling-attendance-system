import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiPlus, HiPencil, HiTrash, HiCheck, HiX,
  HiSearch, HiCalendar, HiLocationMarker, HiTicket,
  HiChevronLeft, HiChevronRight, HiDownload, HiClock
} from 'react-icons/hi';
import { FaCalendarAlt, FaHourglassHalf, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';

const PRESET_EVENT_IMAGES = [
  { name: 'Hackathon & Coding', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60' },
  { name: 'AI & Robotics Tech', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60' },
  { name: 'Cybersecurity Arena', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60' },
  { name: 'Design & UI/UX Sprint', url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=60' },
  { name: 'Poster Presentation', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' },
  { name: 'Debate & Oratory', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60' },
];

const DEFAULT_MOCK_EVENTS = [
  { _id: 'e1', eventId: 'EVT-1001', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18', startTime: '10:00 AM', endTime: '01:00 PM', status: 'UPCOMING', participantCount: 1, maxParticipants: 80, image: { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' } },
  { _id: 'e2', eventId: 'EVT-1002', name: 'Debate Competition', location: 'Conference Hall', date: '2026-06-30', startTime: '11:00 AM', endTime: '02:00 PM', status: 'UPCOMING', participantCount: 1, maxParticipants: 40, image: { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800' } },
  { _id: 'e3', eventId: 'EVT-1003', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', endTime: '01:30 PM', status: 'REGISTRATION_OPEN', participantCount: 2, maxParticipants: 60, image: { url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800' } },
  { _id: 'e4', eventId: 'EVT-1004', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', endTime: '05:00 PM', status: 'REGISTRATION_OPEN', participantCount: 3, maxParticipants: 100, image: { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800' } },
  { _id: 'e5', eventId: 'EVT-1005', name: 'Robotics Workshop', location: 'Workshop Lab', date: '2026-08-05', startTime: '10:00 AM', endTime: '04:00 PM', status: 'ONGOING', participantCount: 25, maxParticipants: 60, image: { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800' } },
  { _id: 'e6', eventId: 'EVT-1006', name: 'Tech Fest 2026', location: 'Main Ground', date: '2026-08-20', startTime: '02:00 PM', endTime: '08:00 PM', status: 'COMPLETED', participantCount: 200, maxParticipants: 200, image: { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800' } },
];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const initialForm = {
    name: '',
    description: '',
    imageUrl: PRESET_EVENT_IMAGES[0].url,
    date: '',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    location: '',
    maxParticipants: 60,
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
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(DEFAULT_MOCK_EVENTS);
      }
    } catch (err) {
      console.error(err);
      setEvents(DEFAULT_MOCK_EVENTS);
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
        maxParticipants: Number(form.maxParticipants) || 60,
      };

      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent._id}`, payload);
        setMsg({ type: 'success', text: 'Event updated successfully!' });
      } else {
        await api.post('/admin/events', payload);
        setMsg({ type: 'success', text: 'Event created and published!' });
      }
      setShowCreate(false);
      setEditingEvent(null);
      setForm(initialForm);
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save event.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/admin/events/${eventId}`, { status: newStatus });
      setEvents(prev => prev.map(e => (e._id === eventId ? { ...e, status: newStatus } : e)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setForm({
      name: event.name || '',
      description: event.description || '',
      imageUrl: event.image?.url || PRESET_EVENT_IMAGES[0].url,
      date: event.date ? event.date.split('T')[0] : '',
      startTime: event.startTime || '10:00 AM',
      endTime: event.endTime || '04:00 PM',
      location: event.location || '',
      maxParticipants: event.maxParticipants || 60,
      status: event.status || 'REGISTRATION_OPEN',
      rules: event.rules || '',
      markingCriteria: event.markingCriteria || initialForm.markingCriteria,
    });
    setShowCreate(true);
  };

  // Metrics
  const totalEvents = events.length || 24;
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING').length || 12;
  const ongoingEvents = events.filter(e => e.status === 'ONGOING' || e.status === 'REGISTRATION_OPEN').length || 5;
  const completedEvents = events.filter(e => e.status === 'COMPLETED').length || 7;

  // Filtered List
  const filteredEvents = events.filter(e => {
    const matchesSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.eventId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* =========================================================================
          PAGE HEADER (Exact Super admin/3.png Layout)
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Event Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Create, edit, and manage campus competitions, details & banner images
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingEvent(null);
            setForm(initialForm);
            setShowCreate(true);
          }}
          style={{ borderRadius: 12, fontWeight: 700, padding: '10px 22px' }}
        >
          <HiPlus /> Create Event
        </button>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* =========================================================================
          4 METRIC CARDS ROW
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18,
          marginBottom: 26,
        }}
      >
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <FaCalendarAlt />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{totalEvents}</h2>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>↑ 28% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span></span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <FaHourglassHalf />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{upcomingEvents}</h2>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>↑ 30% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span></span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <FaPlayCircle />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ongoing Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{ongoingEvents}</h2>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>↑ 15% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span></span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.12)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <FaCheckCircle />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{completedEvents}</h2>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>↑ 10% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span></span>
        </div>
      </div>

      {/* =========================================================================
          FILTER BAR
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 260,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: '0 16px',
            height: 44,
          }}
        >
          <HiSearch style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginRight: 10 }} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: 44,
            padding: '0 16px',
            borderRadius: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.86rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="All">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="REGISTRATION_OPEN">Registration Open</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <button
          style={{
            height: 44,
            padding: '0 18px',
            borderRadius: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <HiDownload /> Export
        </button>
      </div>

      {/* =========================================================================
          DATA TABLE
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>BANNER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>EVENT ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>EVENT NAME & VENUE</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>DATE</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>PARTICIPANTS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt, idx) => {
                const statusStyles = {
                  UPCOMING: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', label: 'Upcoming' },
                  REGISTRATION_OPEN: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', label: 'Registration Open' },
                  ONGOING: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', label: 'Ongoing' },
                  COMPLETED: { bg: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', label: 'Completed' },
                };
                const st = statusStyles[evt.status] || statusStyles.REGISTRATION_OPEN;

                return (
                  <tr key={evt._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Banner Image */}
                    <td style={{ padding: '14px 18px' }}>
                      <img
                        src={evt.image?.url || PRESET_EVENT_IMAGES[0].url}
                        alt={evt.name}
                        style={{ width: 64, height: 42, borderRadius: 8, objectFit: 'cover' }}
                      />
                    </td>

                    {/* Event ID */}
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>
                      {evt.eventId || `EVT-100${idx + 1}`}
                    </td>

                    {/* Name & Venue */}
                    <td style={{ padding: '14px 18px' }}>
                      <div>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{evt.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }} /> {evt.location}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 18px' }}>
                      <div>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <HiCalendar style={{ color: 'var(--primary)' }} />
                          {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {evt.startTime || '10:00 AM'} - {evt.endTime || '04:00 PM'}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: st.bg, color: st.color, fontSize: '0.76rem', fontWeight: 800, padding: '4px 12px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} /> {st.label}
                      </span>
                    </td>

                    {/* Participants */}
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {evt.participantCount || 1} / {evt.maxParticipants || 60}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Registered</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => startEdit(evt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 10,
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <HiPencil /> Edit
                        </button>

                        <select
                          value={evt.status}
                          onChange={(e) => handleStatusChange(evt._id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 10,
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="UPCOMING">Upcoming</option>
                          <option value="REGISTRATION_OPEN">Open</option>
                          <option value="ONGOING">Ongoing</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>Showing 1 to {filteredEvents.length} of {totalEvents} events</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiChevronLeft />
            </button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#FFFFFF', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
              1
            </button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              2
            </button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Event Modal */}
      {showCreate && (
        <div className="modal-backdrop-overlay" onClick={() => setShowCreate(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingEvent ? 'Edit Campus Event' : 'Create New Campus Event'}
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setShowCreate(false)}><HiX /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Code Carnival 2.0"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Event Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Location / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Seminar Hall"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Start Time</label>
                  <input
                    type="text"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>End Time</label>
                  <input
                    type="text"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Max Capacity</label>
                  <input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Banner Artwork</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
                  {PRESET_EVENT_IMAGES.map((img) => (
                    <div
                      key={img.name}
                      onClick={() => setForm({ ...form, imageUrl: img.url })}
                      style={{
                        position: 'relative',
                        borderRadius: 10,
                        overflow: 'hidden',
                        height: 54,
                        border: form.imageUrl === img.url ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-control"
                  placeholder="Describe event overview and key instructions..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEvents;
