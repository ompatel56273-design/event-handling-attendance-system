import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiLocationMarker, HiClock, HiSearch, HiFilter } from 'react-icons/hi';

const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId) => {
    setJoining(eventId);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/events/${eventId}/join`);
      setMsg({ type: 'success', text: 'Successfully joined the event!' });
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to join.' });
    } finally {
      setJoining('');
    }
  };

  // Filter events by tab and search
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name?.toLowerCase().includes(search.toLowerCase()) ||
                          evt.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'UPCOMING') return evt.status === 'UPCOMING' || evt.status === 'REGISTRATION_OPEN';
    if (activeTab === 'ONGOING') return evt.status === 'ONGOING';
    if (activeTab === 'COMPLETED') return evt.status === 'COMPLETED';
    return true;
  });

  return (
    <DashboardLayout
      title="Events"
      subtitle="Explore and participate in campus events"
      headerActions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-input" style={{ width: '220px' }}>
            <HiSearch className="search-icon" />
            <input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiFilter /> Filter
          </button>
        </div>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Filter Tabs matching Master UI */}
      <div className="filter-tabs-bar">
        <button
          className={`tab-pill ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Events
        </button>
        <button
          className={`tab-pill ${activeTab === 'UPCOMING' ? 'active' : ''}`}
          onClick={() => setActiveTab('UPCOMING')}
        >
          Upcoming
        </button>
        <button
          className={`tab-pill ${activeTab === 'ONGOING' ? 'active' : ''}`}
          onClick={() => setActiveTab('ONGOING')}
        >
          Ongoing
        </button>
        <button
          className={`tab-pill ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <h3>No Events Found</h3>
          <p>Try adjusting your search or tab filters.</p>
        </div>
      ) : (
        <div>
          {filteredEvents.map((evt, idx) => {
            const currentCount = evt.participantCount || 0;
            const maxCount = evt.maxParticipants || 100;
            const isFull = currentCount >= maxCount;

            return (
              <div key={evt._id} className="event-row-card">
                {/* Event Thumbnail */}
                <img
                  src={evt.image?.url || eventThumbnails[idx % eventThumbnails.length]}
                  alt={evt.name}
                  className="event-row-thumb"
                />

                {/* Event Center Info */}
                <div className="event-row-info">
                  <h3>{evt.name}</h3>
                  <p>{evt.description || 'Join this exciting competition to showcase your talent and skills.'}</p>
                  <div className="event-row-tags">
                    <span>
                      <HiCalendar style={{ color: '#5C33CF' }} />{' '}
                      {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span>
                      <HiClock style={{ color: '#0EA5E9' }} />{' '}
                      {evt.startTime} - {evt.endTime}
                    </span>
                    <span>
                      <HiLocationMarker style={{ color: '#10B981' }} />{' '}
                      {evt.location}
                    </span>
                  </div>
                </div>

                {/* Event Right Action & Count */}
                <div className="event-row-action">
                  <div className="participant-count-badge">
                    Participants
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                      {currentCount} <span>/ {maxCount}</span>
                    </div>
                  </div>

                  {evt.hasJoined ? (
                    <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                      ✓ Joined
                    </span>
                  ) : evt.status === 'REGISTRATION_OPEN' && !isFull ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleJoin(evt._id)}
                      disabled={joining === evt._id}
                    >
                      {joining === evt._id ? 'Joining...' : 'Join Event'}
                    </button>
                  ) : (
                    <span className="badge badge-neutral">
                      {isFull ? 'Event Full' : 'Registration Closed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Events;
