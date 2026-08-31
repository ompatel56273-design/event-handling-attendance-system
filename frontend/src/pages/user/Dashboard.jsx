import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { saveOfflineIdentity, getOfflineIdentity, saveOfflinePasses, getOfflinePasses } from '../../services/offlineStorage';
import QRCode from 'react-qr-code';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiCalendar, HiTicket, HiClipboardList, HiStar,
  HiAcademicCap, HiIdentification, HiPhone, HiMail,
  HiLocationMarker, HiArrowRight, HiQrcode,
  HiSearch, HiShieldCheck
} from 'react-icons/hi';

// High-quality event artwork presets
const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
];

const UserDashboard = () => {
  const { user } = useAuth();
  const { activeThemeConfig } = useTheme();
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [counts, setCounts] = useState({ upcoming: 0, total: 0, myEvents: 0, winners: 0 });
  const [selectedPass, setSelectedPass] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const fetchDashboardData = async () => {
      try {
        const [profileRes, eventsRes, myEventsRes, winnersRes] = await Promise.allSettled([
          api.get('/users/me/e-card'),
          api.get('/events'),
          api.get('/users/me/events'),
          api.get('/winners'),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
          saveOfflineIdentity(profileRes.value.data);
        } else {
          const cached = getOfflineIdentity();
          if (cached) setProfile(cached);
        }

        let allEvents = [];
        if (eventsRes.status === 'fulfilled') {
          allEvents = eventsRes.value.data;
          const upcoming = allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN');
          setUpcomingEvents(upcoming.slice(0, 4));
        }

        const myEventsList = myEventsRes.status === 'fulfilled' ? myEventsRes.value.data : [];
        setMyRegistrations(myEventsList.slice(0, 3));
        if (myEventsList.length > 0) saveOfflinePasses(myEventsList);
        else {
          const cachedPasses = getOfflinePasses();
          if (cachedPasses.length > 0) setMyRegistrations(cachedPasses.slice(0, 3));
        }

        const winnersCount = winnersRes.status === 'fulfilled' ? winnersRes.value.data.length : 0;

        setCounts({
          upcoming: allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN').length,
          total: allEvents.length,
          myEvents: myEventsList.length,
          winners: winnersCount,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const cachedId = getOfflineIdentity();
        if (cachedId) setProfile(cachedId);
        const cachedPasses = getOfflinePasses();
        if (cachedPasses.length > 0) setMyRegistrations(cachedPasses.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const data = profile || user;
  const fullName = `${data?.firstName || 'John'} ${data?.lastName || 'Doe'}`;
  const userId = data?.userId || 'USR-102938';
  const dept = data?.department || 'BCA';
  const yearClass = `${data?.year ? `${data.year}nd Year` : '2nd Year'} • Class ${data?.className || 'A'}`;
  const rollNumber = data?.rollNumber || '21BCA102';
  const mobile = data?.mobile || '9876543210';
  const email = data?.email || 'john.doe@email.com';

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${data?.firstName || 'Student'}`}
      subtitle="Your modern classic event management & campus passport"
      headerActions={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/user/events" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiSearch /> Explore Events
          </Link>
        </div>
      }
    >
      {/* Offline Mode Alert Banner */}
      {isOffline && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#F59E0B',
            padding: '12px 18px',
            borderRadius: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📱</span>
          <span>
            <strong>Offline Mode Active:</strong> You are currently disconnected from the internet. Your Student Identity Pass & QR code are securely served from offline local cache.
          </span>
        </div>
      )}

      {/* =========================================================================
          1. MODERN CLASSIC EXECUTIVE IDENTITY PASSPORT (HERO E-CARD)
          ========================================================================= */}
      <div className="identity-hero-card hover-lift glow-border">
        {/* Top Header Tag */}
        <div className="identity-hero-top-badge">
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', letterSpacing: '1px' }}>
            <span className="pulse-beacon" />
            <HiShieldCheck style={{ fontSize: '0.9rem' }} /> OFFICIAL CAMPUS IDENTITY PASSPORT
          </span>
        </div>

        {/* Student Avatar with Metallic Ring */}
        <div className="identity-hero-avatar-wrap">
          {data?.profileImage?.url ? (
            <img
              src={data.profileImage.url}
              alt={fullName}
              className="identity-hero-avatar"
            />
          ) : (
            <div className="identity-hero-avatar-placeholder">
              {data?.firstName ? data.firstName[0] : activeThemeConfig.icon}
            </div>
          )}
          <span className="avatar-verified-seal" title="Verified Student Identity">
            ✓
          </span>
        </div>

        {/* Student Profile Info */}
        <div className="identity-hero-details">
          <h2>{fullName}</h2>

          <div className="identity-hero-id-row">
            <span
              className="user-id-chip"
              onClick={handleCopyId}
              title="Click to copy User ID"
            >
              {userId} {copied ? '✓ Copied' : '📋'}
            </span>

            <span className="dept-pill">
              {dept} DEPARTMENT
            </span>
          </div>

          {/* Academic & Contact Meta Grid */}
          <div className="identity-hero-meta-grid">
            <div className="identity-meta-item">
              <HiAcademicCap className="meta-icon" />
              <span>{yearClass}</span>
            </div>
            <div className="identity-meta-item">
              <HiIdentification className="meta-icon" />
              <span>Roll No: <strong>{rollNumber}</strong></span>
            </div>
            <div className="identity-meta-item">
              <HiPhone className="meta-icon" />
              <span>{mobile}</span>
            </div>
            <div className="identity-meta-item">
              <HiMail className="meta-icon" />
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Real-time Identity QR Stand */}
        <div className="identity-hero-qr-box">
          <div className="qr-code-white-frame">
            <QRCode value={userId} size={105} />
          </div>
          <span className="qr-label">Identity QR</span>
          <span className="qr-sublabel">(SCAN FOR VERIFICATION)</span>
        </div>
      </div>

      {/* =========================================================================
          2. FOUR COMMAND STAT METRIC CARDS
          ========================================================================= */}
      <div className="stats-grid">
        <div className="stat-card-clean hover-lift">
          <div className="stat-card-icon purple">
            <HiCalendar />
          </div>
          <div className="stat-card-content">
            <p>Upcoming Events</p>
            <h3>{counts.upcoming}</h3>
            <span className="stat-badge-green">● Active Schedule</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-icon cyan">
            <HiTicket />
          </div>
          <div className="stat-card-content">
            <p>Total Events</p>
            <h3>{counts.total}</h3>
            <span className="stat-badge-green">● Live Catalog</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-icon green">
            <HiClipboardList />
          </div>
          <div className="stat-card-content">
            <p>My Registrations</p>
            <h3>{counts.myEvents}</h3>
            <span className="stat-badge-green">● Enrolled</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-icon orange">
            <HiStar />
          </div>
          <div className="stat-card-content">
            <p>Podium Winners</p>
            <h3>{counts.winners}</h3>
            <span className="stat-badge-green">● Hall of Fame</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN TWO-COLUMN SPLIT: UPCOMING EVENTS & MY ACTIVE PASSES
          ========================================================================= */}
      <div className="dashboard-split-grid">
        {/* Left Column: Upcoming Featured Events */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Upcoming Campus Events</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Explore live competitions & register with one click
              </p>
            </div>
            <Link to="/user/upcoming-events" className="view-all-link">
              View All <HiArrowRight />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="events-preview-grid">
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
                      <span>
                        <HiCalendar style={{ color: 'var(--primary)' }} />{' '}
                        {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span>
                        <HiLocationMarker style={{ color: '#0EA5E9' }} /> {evt.location || 'Campus Seminar Hall'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <span className="upcoming-mini-badge">
                        {evt.status ? evt.status.replace(/_/g, ' ') : 'Upcoming'}
                      </span>
                      <Link
                        to="/user/events"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                      >
                        Join Event
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎪</div>
              <h3>No Upcoming Events</h3>
              <p>New activities and hackathons will be announced soon.</p>
            </div>
          )}
        </div>

        {/* Right Column: My Active Event Passes & Attendance QR */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>My Event Passes</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Present QR code to Event Members for check-in
              </p>
            </div>
            <Link to="/user/my-events" className="view-all-link">
              All Passes <HiArrowRight />
            </Link>
          </div>

          {myRegistrations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myRegistrations.map((reg) => {
                const eventObj = reg.eventId || {};
                const isAccepted = reg.attendanceStatus === 'ACCEPTED';
                return (
                  <div key={reg._id} className="pass-strip-card">
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {eventObj.name || 'Campus Event'}
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        📅 {eventObj.date ? new Date(eventObj.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Soon'} • 📍 {eventObj.location || 'Hall'}
                      </p>
                      <div style={{ marginTop: 6 }}>
                        <span className={`badge ${isAccepted ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.62rem' }}>
                          {isAccepted ? '✓ Attendance Verified' : '⌛ Pending Scan'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPass(reg)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <HiQrcode style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> View QR
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div className="empty-icon">🎫</div>
              <h3>No Active Passes</h3>
              <p>You have not registered for any events yet.</p>
              <Link to="/user/events" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. ATTENDANCE QR MODAL FOR STUDENT CHECK-IN
          ========================================================================= */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <div className="modal-header">
              <h2>🎟️ Event Attendance Pass</h2>
              <button className="modal-close" onClick={() => setSelectedPass(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                {selectedPass.eventId?.name || 'Event Pass'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Hold this Attendance QR code in front of the scanner camera at the entrance
              </p>

              {/* Attendance QR Stand */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-qr)',
                  border: '3px solid var(--primary)',
                  marginBottom: 16,
                }}
              >
                <QRCode value={selectedPass.qrToken || selectedPass._id} size={180} />
              </div>

              {/* 6-Digit PIN Code Fallback Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  marginBottom: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Backup Check-in PIN:</span>
                <strong style={{ fontSize: '1.05rem', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--primary)' }}>
                  {selectedPass.checkInPin || selectedPass._id.slice(-6).toUpperCase()}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.78rem' }}>
                <p><strong>Student:</strong> {fullName} ({userId})</p>
                <p><strong>Status:</strong> {selectedPass.attendanceStatus === 'ACCEPTED' ? '✅ Verified' : '⌛ Pending Scan'}</p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedPass(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;
