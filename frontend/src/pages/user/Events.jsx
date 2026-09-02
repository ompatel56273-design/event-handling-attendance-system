import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiCalendar, HiLocationMarker, HiSearch, HiClock,
  HiTicket, HiCheckCircle, HiFilter, HiX
} from 'react-icons/hi';

const DEFAULT_EVENTS = [
  { _id: 'e1', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18', startTime: '10:00 AM', endTime: '01:00 PM', status: 'UPCOMING', description: 'Showcase your creative posters and research presentations before expert judges.', maxParticipants: 80, participantCount: 1, isRegistered: false, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500' },
  { _id: 'e2', name: 'Debate Competition', location: 'Conference Hall', date: '2026-06-30', startTime: '11:00 AM', endTime: '02:00 PM', status: 'UPCOMING', description: 'Debate cutting-edge topics in science, technology, ethics, and modern society.', maxParticipants: 40, participantCount: 1, isRegistered: false, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500' },
  { _id: 'e3', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', endTime: '01:30 PM', status: 'REGISTRATION_OPEN', description: 'Design modern web & mobile app prototypes with Figma under time constraints.', maxParticipants: 60, participantCount: 2, isRegistered: true, image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=500' },
  { _id: 'e4', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', endTime: '05:00 PM', status: 'REGISTRATION_OPEN', description: 'Campus-wide hackathon and algorithmic puzzle showdown for developers.', maxParticipants: 100, participantCount: 3, isRegistered: true, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500' },
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsRes, myEventsRes] = await Promise.allSettled([
        api.get('/events'),
        api.get('/users/me/events'),
      ]);

      const allEvts = eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0
        ? eventsRes.value.data
        : DEFAULT_EVENTS;

      const myRegisteredIds = myEventsRes.status === 'fulfilled' && Array.isArray(myEventsRes.value.data)
        ? myEventsRes.value.data.map(r => r.event?._id || r.event)
        : ['e3', 'e4'];

      const mapped = allEvts.map(e => ({
        ...e,
        isRegistered: myRegisteredIds.includes(e._id) || e.isRegistered,
      }));

      setEvents(mapped);
    } catch (err) {
      console.error(err);
      setEvents(DEFAULT_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/events/${eventId}/register`);
      setMsg({ type: 'success', text: 'Successfully enrolled! Your QR pass has been issued.' });
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, isRegistered: true } : e));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setRegistering(null);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      !search ||
      evt.name?.toLowerCase().includes(search.toLowerCase()) ||
      evt.location?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UPCOMING') return evt.status === 'UPCOMING' || evt.status === 'REGISTRATION_OPEN';
    if (activeTab === 'ONGOING') return evt.status === 'ONGOING';
    if (activeTab === 'COMPLETED') return evt.status === 'COMPLETED';
    return true;
  });

  return (
    <DashboardLayout>
      {/* Page Header (Matching Student/3.png) */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Campus Events
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Discover, register, and participate in campus activities
        </p>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: `All Events (${events.length})` },
          { id: 'UPCOMING', label: `Upcoming (${events.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN').length})` },
          { id: 'ONGOING', label: 'Ongoing (0)' },
          { id: 'COMPLETED', label: 'Completed (0)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: 14,
              border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
              background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: '0 16px',
            height: 46,
          }}
        >
          <HiSearch style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginRight: 10 }} />
          <input
            type="text"
            placeholder="Search events by name, topic, or venue..."
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

        <button
          style={{
            height: 46,
            padding: '0 18px',
            borderRadius: 14,
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

      {/* Wide Event Cards List (Exact Student/3.png Layout) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredEvents.map((evt, idx) => {
          const isUpcoming = evt.status === 'UPCOMING';
          const isOpen = evt.status === 'REGISTRATION_OPEN';
          const statusColor = isUpcoming ? '#F59E0B' : '#10B981';
          const statusLabel = isUpcoming ? 'UPCOMING' : 'REGISTRATION OPEN';

          return (
            <div
              key={evt._id || idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 22,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              {/* Left thumbnail & details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 320 }}>
                <img
                  src={evt.image?.url || evt.image || DEFAULT_EVENTS[0].image}
                  alt={evt.name}
                  style={{ width: 140, height: 95, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                />

                <div>
                  <span
                    style={{
                      background: `${statusColor}1A`,
                      color: statusColor,
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '3px 10px',
                      borderRadius: 12,
                      letterSpacing: '0.4px',
                      display: 'inline-block',
                      marginBottom: 6,
                    }}
                  >
                    {statusLabel}
                  </span>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {evt.name}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {evt.description || 'Showcase your skills in this exciting campus competition.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiCalendar style={{ color: 'var(--primary)' }} />
                      {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiClock style={{ color: 'var(--primary)' }} />
                      {evt.startTime || '10:00 AM'} - {evt.endTime || '01:00 PM'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiLocationMarker style={{ color: '#EF4444' }} />
                      {evt.location || 'Auditorium'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiTicket style={{ color: 'var(--primary)' }} />
                      {evt.participantCount || 1} / {evt.maxParticipants || 80}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div>
                {evt.isRegistered ? (
                  <span
                    style={{
                      padding: '10px 22px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <HiCheckCircle /> Registered
                  </span>
                ) : (
                  <button
                    onClick={() => handleRegister(evt._id)}
                    disabled={registering === evt._id}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 26px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    {registering === evt._id ? 'Registering...' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Events;
