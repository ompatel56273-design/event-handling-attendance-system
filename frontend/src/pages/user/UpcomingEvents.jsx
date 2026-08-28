import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiLocationMarker, HiClock } from 'react-icons/hi';

const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/events/upcoming');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout
      title="Upcoming Events"
      subtitle="Discover exciting campus events taking place soon"
    >
      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <h3>No Upcoming Events</h3>
          <p>There are no upcoming events scheduled at the moment.</p>
        </div>
      ) : (
        <div className="upcoming-events-strip">
          {events.map((evt, idx) => (
            <div key={evt._id} className="upcoming-mini-card">
              <img
                src={evt.image?.url || eventThumbnails[idx % eventThumbnails.length]}
                alt={evt.name}
                className="upcoming-mini-thumb"
              />
              <div className="upcoming-mini-body">
                <h4>{evt.name}</h4>
                <div className="upcoming-mini-meta">
                  <span>
                    <HiCalendar />{' '}
                    {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span>
                    <HiLocationMarker /> {evt.location || 'Campus'}
                  </span>
                </div>
                <span className="upcoming-mini-badge">
                  {evt.status ? evt.status.replace(/_/g, ' ') : 'Upcoming'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default UpcomingEvents;
