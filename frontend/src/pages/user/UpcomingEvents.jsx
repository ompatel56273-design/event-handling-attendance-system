import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiLocationMarker, HiClock, HiFilter, HiCheckCircle } from 'react-icons/hi';

const DEFAULT_UPCOMING_EVENTS = [
  { _id: 'e1', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18', startTime: '10:00 AM', endTime: '01:00 PM', status: 'UPCOMING', isRegistered: false, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600' },
  { _id: 'e2', name: 'Debate Competition', location: 'Conference Hall', date: '2026-06-30', startTime: '11:00 AM', endTime: '02:00 PM', status: 'UPCOMING', isRegistered: false, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600' },
  { _id: 'e3', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', endTime: '01:30 PM', status: 'REGISTRATION_OPEN', isRegistered: true, image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=600' },
  { _id: 'e4', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', endTime: '05:00 PM', status: 'REGISTRATION_OPEN', isRegistered: true, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600' },
];

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
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
        : DEFAULT_UPCOMING_EVENTS;

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
      setEvents(DEFAULT_UPCOMING_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/events/${eventId}/register`);
      setMsg({ type: 'success', text: 'Successfully registered for event! Your pass is active.' });
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, isRegistered: true } : e));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setRegistering(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header (Exact Student/2.png Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Upcoming Events
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Discover exciting campus events taking place soon
          </p>
        </div>

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

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* 4 Event Cards Grid (Exact Student/2.png Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
        }}
      >
        {events.map((evt, idx) => {
          const isUpcoming = evt.status === 'UPCOMING';
          const isOpen = evt.status === 'REGISTRATION_OPEN';
          const statusColor = isUpcoming ? '#F59E0B' : '#10B981';
          const statusLabel = isUpcoming ? 'Upcoming' : 'Registration Open';

          return (
            <div
              key={evt._id || idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 22,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Cover Image with Status Overlay Tag */}
              <div style={{ position: 'relative', height: 160, width: '100%' }}>
                <img
                  src={evt.image?.url || evt.image || DEFAULT_UPCOMING_EVENTS[0].image}
                  alt={evt.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: statusColor,
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    padding: '4px 12px',
                    borderRadius: 14,
                    letterSpacing: '0.4px',
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                    {evt.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiCalendar style={{ color: 'var(--primary)' }} />
                      {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiClock style={{ color: 'var(--primary)' }} />
                      {evt.startTime || '10:00 AM'} - {evt.endTime || '01:00 PM'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiLocationMarker style={{ color: '#EF4444' }} />
                      {evt.location || 'Auditorium'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                {evt.isRegistered ? (
                  <div
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <HiCheckCircle /> Registered
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(evt._id)}
                    disabled={registering === evt._id}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: '0.88rem',
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

export default UpcomingEvents;
