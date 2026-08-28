import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiCalendar, HiTicket, HiClipboardList, HiStar,
  HiAcademicCap, HiIdentification, HiPhone, HiMail,
  HiLocationMarker, HiArrowRight
} from 'react-icons/hi';

// High-quality event artwork presets for beautiful visual showcase
const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [counts, setCounts] = useState({ upcoming: 0, total: 0, myEvents: 0, winners: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, eventsRes, myEventsRes, winnersRes] = await Promise.allSettled([
          api.get('/users/me/e-card'),
          api.get('/events'),
          api.get('/users/me/events'),
          api.get('/winners'),
        ]);

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        
        let allEvents = [];
        if (eventsRes.status === 'fulfilled') {
          allEvents = eventsRes.value.data;
          const upcoming = allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN');
          setUpcomingEvents(upcoming.slice(0, 4));
        }

        const myEventsCount = myEventsRes.status === 'fulfilled' ? myEventsRes.value.data.length : 0;
        const winnersCount = winnersRes.status === 'fulfilled' ? winnersRes.value.data.length : 0;

        setCounts({
          upcoming: allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN').length,
          total: allEvents.length,
          myEvents: myEventsCount,
          winners: winnersCount,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const data = profile || user;
  const fullName = `${data?.firstName || 'John'} ${data?.lastName || 'Doe'}`;
  const userId = data?.userId || 'USR-102938';
  const dept = data?.department || 'BCA';
  const yearClass = `${data?.year ? `${data.year}nd Year` : '2nd Year'} - ${data?.className || 'A'}`;
  const rollNumber = data?.rollNumber || '21BCA102';
  const mobile = data?.mobile || '9876543210';
  const email = data?.email || 'john.doe@email.com';

  return (
    <DashboardLayout>
      {/* 1. Main Identity E-Card Widget (Exact Replica of Master UI) */}
      <div className="identity-hero-card">
        {/* User Photo */}
        {data?.profileImage?.url ? (
          <img src={data.profileImage.url} alt={fullName} className="identity-hero-avatar" />
        ) : (
          <div className="identity-hero-avatar-placeholder">
            {data?.firstName ? data.firstName[0] : 'J'}
          </div>
        )}

        {/* User Details */}
        <div className="identity-hero-details">
          <h2>{fullName}</h2>
          <div className="identity-hero-id-row">
            <span className="user-id-text">{userId}</span>
            <span className="dept-pill">{dept}</span>
          </div>

          <div className="identity-hero-meta-grid">
            <div className="identity-meta-item">
              <HiAcademicCap />
              <span>{yearClass}</span>
            </div>
            <div className="identity-meta-item">
              <HiIdentification />
              <span>Roll No. {rollNumber}</span>
            </div>
            <div className="identity-meta-item">
              <HiPhone />
              <span>{mobile}</span>
            </div>
            <div className="identity-meta-item">
              <HiMail />
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Real-time Identity QR */}
        <div className="identity-hero-qr-box">
          <div style={{ background: '#fff', padding: '4px', borderRadius: '8px' }}>
            <QRCode value={userId} size={110} />
          </div>
          <span className="qr-label">Identity QR</span>
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '-4px' }}>(USER-ID ONLY)</span>
        </div>
      </div>

      {/* 2. Four Stat Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card-clean">
          <div className="stat-card-icon purple">
            <HiCalendar />
          </div>
          <div className="stat-card-content">
            <p>Upcoming Events</p>
            <h3>{counts.upcoming}</h3>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon cyan">
            <HiTicket />
          </div>
          <div className="stat-card-content">
            <p>Events</p>
            <h3>{counts.total}</h3>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon green">
            <HiClipboardList />
          </div>
          <div className="stat-card-content">
            <p>My Events</p>
            <h3>{counts.myEvents}</h3>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon orange">
            <HiStar />
          </div>
          <div className="stat-card-content">
            <p>Winners</p>
            <h3>{counts.winners}</h3>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Events Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h2>Upcoming Events</h2>
          <Link to="/user/upcoming-events" className="view-all-link">
            View All <HiArrowRight />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="upcoming-events-strip">
            {upcomingEvents.map((evt, idx) => (
              <div key={evt._id} className="upcoming-mini-card">
                <img
                  src={evt.image?.url || eventThumbnails[idx % eventThumbnails.length]}
                  alt={evt.name}
                  className="upcoming-mini-thumb"
                />
                <div className="upcoming-mini-body">
                  <h4>{evt.name}</h4>
                  <div className="upcoming-mini-meta">
                    <span><HiCalendar /> {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span><HiLocationMarker /> {evt.location || 'Campus'}</span>
                  </div>
                  <span className="upcoming-mini-badge">
                    {evt.status ? evt.status.replace(/_/g, ' ') : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <div className="empty-icon">🗓️</div>
            <h3>No Upcoming Events</h3>
            <p>Check back soon for new campus activities and competitions.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
