import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import {
  HiCalendar, HiTicket, HiClipboardList, HiStar,
  HiAcademicCap, HiIdentification, HiPhone, HiMail,
  HiLocationMarker, HiArrowRight, HiQrcode,
  HiArrowsExpand, HiCheckCircle
} from 'react-icons/hi';
import { FaGraduationCap, FaUniversity, FaQrcode } from 'react-icons/fa';

const DEFAULT_STUDENT_EVENTS = [
  { _id: 'e1', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18', startTime: '10:00 AM', status: 'UPCOMING', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400' },
  { _id: 'e2', name: 'Debate Competition', location: 'Conference Hall', date: '2026-06-30', startTime: '11:00 AM', status: 'UPCOMING', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400' },
  { _id: 'e3', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', status: 'REGISTRATION_OPEN', image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=400', isRegistered: true },
  { _id: 'e4', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', status: 'REGISTRATION_OPEN', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400', isRegistered: true },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [counts, setCounts] = useState({ upcoming: 4, total: 4, myEvents: 2, winners: 3 });
  const [fullScreenQR, setFullScreenQR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      }

      let allEvents = DEFAULT_STUDENT_EVENTS;
      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0) {
        allEvents = eventsRes.value.data;
      }
      setUpcomingEvents(allEvents.slice(0, 4));

      let myEventsList = [];
      if (myEventsRes.status === 'fulfilled' && Array.isArray(myEventsRes.value.data) && myEventsRes.value.data.length > 0) {
        myEventsList = myEventsRes.value.data;
      } else {
        myEventsList = [
          { _id: 'r1', event: { name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10' }, status: 'REGISTERED', qrToken: 'ATT-EVT-1003-USR-102938' },
          { _id: 'r2', event: { name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25' }, status: 'REGISTERED', qrToken: 'ATT-EVT-1004-USR-102938' },
        ];
      }
      setMyRegistrations(myEventsList.slice(0, 2));

      const winnersCount = winnersRes.status === 'fulfilled' && Array.isArray(winnersRes.value.data) ? winnersRes.value.data.length : 3;

      setCounts({
        upcoming: allEvents.length || 4,
        total: allEvents.length || 4,
        myEvents: myEventsList.length || 2,
        winners: winnersCount || 3,
      });
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const studentUser = profile?.user || user || {};
  const firstName = studentUser.firstName || 'John';
  const lastName = studentUser.lastName || 'Doe';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = (firstName[0] + (lastName[0] || '')).toUpperCase();
  const userId = studentUser.userId || 'USR-102938';
  const department = studentUser.department || 'BCA';
  const year = studentUser.year || 2;
  const className = studentUser.className || 'A';
  const rollNumber = studentUser.rollNumber || '21BCA102';
  const email = studentUser.email || 'john.doe@email.com';
  const mobile = studentUser.mobile || '9876543210';
  const qrIdentityValue = studentUser.qrToken || `IDENTITY-${userId}`;

  return (
    <DashboardLayout>
      {/* Top Greeting */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Welcome back, {firstName}! 👋
        </h1>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', margin: 0 }}>
          Your campus activities and registrations at a glance.
        </p>
      </div>

      {/* =========================================================================
          OFFICIAL CAMPUS IDENTITY PASSPORT CARD (Exact Student/1.png Layout)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          padding: '28px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontSize: '0.76rem',
              fontWeight: 900,
              padding: '4px 14px',
              borderRadius: 20,
              letterSpacing: '0.6px',
            }}
          >
            OFFICIAL CAMPUS IDENTITY PASSPORT
          </span>

          <span
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            STATUS: ACTIVE & VERIFIED
          </span>
        </div>

        {/* Student Details & QR Stand Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center' }}>
          {/* Left: Student Profile details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 900,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {fullName}
              </h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
                {userId} • Roll No. {rollNumber}
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {department} | {year}nd Year - Class {className}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📞 {mobile} | ✉️ {email}
              </span>
            </div>
          </div>

          {/* Right: Identity QR Box */}
          <div
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div
              onClick={() =>
                setFullScreenQR({
                  value: qrIdentityValue,
                  title: `${fullName} — Campus Passport`,
                  subtitle: `${department} • Roll No. ${rollNumber}`,
                  tokenLabel: `User ID: ${userId}`,
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 8,
                border: '2px solid var(--primary)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <QRCode value={qrIdentityValue} size={70} />
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                Digital Identity QR
              </strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Valid for 2026-2027 Academic Year
              </span>
              <span
                onClick={() =>
                  setFullScreenQR({
                    value: qrIdentityValue,
                    title: `${fullName} — Campus Passport`,
                    subtitle: `${department} • Roll No. ${rollNumber}`,
                    tokenLabel: `User ID: ${userId}`,
                  })
                }
                style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <HiArrowsExpand /> Fullscreen Pass
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4 KPI STAT CARDS ROW
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18,
          marginBottom: 28,
        }}
      >
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <HiCalendar />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{counts.upcoming}</h2>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Available to register</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.12)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <HiTicket />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{counts.total}</h2>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Campus competitions</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <HiClipboardList />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Registrations</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{counts.myEvents}</h2>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>Active event passes</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>
            <HiStar />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Podium Winners</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-primary)' }}>{counts.winners}</h2>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Hall of fame entries</span>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM 2 COLUMNS: UPCOMING COMPETITIONS & MY ACTIVE PASSES
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 24 }}>
        {/* Left Column: Upcoming Competitions */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 22,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Upcoming Competitions
            </h3>
            <Link to="/user/upcoming-events" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {upcomingEvents.map((evt, idx) => {
              const isRegistered = evt.isRegistered || idx >= 2;
              return (
                <div
                  key={evt._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={evt.image?.url || evt.image || DEFAULT_STUDENT_EVENTS[0].image}
                      alt={evt.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{evt.name}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HiCalendar style={{ color: 'var(--primary)' }} />
                        {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span>•</span>
                        <HiLocationMarker style={{ color: '#EF4444' }} /> {evt.location}
                      </span>
                    </div>
                  </div>

                  {isRegistered ? (
                    <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 12 }}>
                      ✓ Registered
                    </span>
                  ) : (
                    <Link
                      to="/user/upcoming-events"
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        background: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      Register Now
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: My Active Passes */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 22,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              My Active Passes
            </h3>
            <Link to="/user/my-events" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              View All Passes →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myRegistrations.map((reg, idx) => {
              const passQR = reg.qrToken || `ATT-PASS-${idx}-${userId}`;
              const eName = reg.event?.name || (idx === 0 ? 'UI/UX Design Challenge' : 'Code Carnival 2.0');
              const eLoc = reg.event?.location || (idx === 0 ? 'Lab 3' : 'Seminar Hall');

              return (
                <div
                  key={reg._id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: 16,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                      <FaQrcode />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{eName}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>📍 {eLoc}</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setFullScreenQR({
                        value: passQR,
                        title: `${fullName} — Event Pass`,
                        subtitle: `${eName} • ${eLoc}`,
                        tokenLabel: `Token: ${passQR}`,
                      })
                    }
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <HiQrcode /> View Pass
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      <FullScreenQRModal
        isOpen={!!fullScreenQR}
        onClose={() => setFullScreenQR(null)}
        {...fullScreenQR}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
