import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiLocationMarker, HiSearch, HiFilter, HiUserGroup } from 'react-icons/hi';

const DEFAULT_MEMBER_EVENTS = [
  { _id: 'e1', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18', startTime: '10:00 AM', endTime: '01:00 PM', status: 'UPCOMING', participantCount: 1, maxParticipants: 80, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400' },
  { _id: 'e2', name: 'Debate Competition', location: 'Conference Hall', date: '2026-06-30', startTime: '11:00 AM', endTime: '02:00 PM', status: 'UPCOMING', participantCount: 1, maxParticipants: 40, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400' },
  { _id: 'e3', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', endTime: '01:30 PM', status: 'REGISTRATION_OPEN', participantCount: 2, maxParticipants: 60, image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=400' },
  { _id: 'e4', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', endTime: '05:00 PM', status: 'REGISTRATION_OPEN', participantCount: 3, maxParticipants: 100, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400' },
];

const MemberEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(DEFAULT_MEMBER_EVENTS);
      }
    } catch (err) {
      console.error(err);
      setEvents(DEFAULT_MEMBER_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Top Header (Matching Memebers/3.png) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Event Overview
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            View active campus competitions, rooms, and registered participants
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: 42,
              padding: '0 16px',
              borderRadius: 12,
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

      {/* Data Table */}
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
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>EVENT NAME & VENUE</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>DATE</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>STATUS</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>PARTICIPANTS</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt, idx) => {
                const isUpcoming = evt.status === 'UPCOMING';
                const isOpen = evt.status === 'REGISTRATION_OPEN';
                const isOngoing = evt.status === 'ONGOING';
                const statusColor = isUpcoming ? '#F59E0B' : isOpen ? '#10B981' : isOngoing ? '#3B82F6' : '#A855F7';
                const statusLabel = isUpcoming ? 'Upcoming' : isOpen ? 'Registration Open' : isOngoing ? 'Ongoing' : 'Completed';

                return (
                  <tr key={evt._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={evt.image?.url || evt.image || DEFAULT_MEMBER_EVENTS[0].image}
                          alt={evt.name}
                          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{evt.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }} /> {evt.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
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

                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          background: `${statusColor}1A`,
                          color: statusColor,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: 14,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                        {statusLabel}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {evt.participantCount || 1} / {evt.maxParticipants || 80}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Registered</span>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '8px 18px',
                          borderRadius: 10,
                          background: 'var(--bg-app)',
                          border: '1.5px solid var(--border-color)',
                          color: 'var(--primary)',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        View Participants
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberEvents;
