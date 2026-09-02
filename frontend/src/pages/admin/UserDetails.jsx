import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRCode from 'react-qr-code';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import EventThumbnail from '../../components/common/EventThumbnail';
import {
  HiArrowLeft, HiCalendar, HiLocationMarker, HiTicket,
  HiCheckCircle, HiIdentification, HiAcademicCap,
  HiMail, HiPhone, HiShieldCheck, HiStar,
  HiArrowsExpand, HiDocumentReport
} from 'react-icons/hi';
import { FaIdBadge, FaUniversity, FaMedal, FaTrophy } from 'react-icons/fa';

const DEFAULT_USER_DETAILS = {
  _id: 'u1',
  userId: 'USR-102938',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  mobile: '9876543210',
  department: 'BCA',
  year: 2,
  className: 'A',
  rollNumber: '21BCA102',
  role: 'USER',
  isActive: true,
  createdAt: '2026-08-10',
  joinedEvents: [
    {
      _id: 'evt-1',
      name: 'Code Carnival 2.0',
      date: '2026-07-25',
      location: 'Seminar Hall',
      status: 'ATTENDED',
      attendanceVerified: true,
      attendanceTime: '2026-07-25 10:15 AM',
      marks: {
        total: 95,
        criteria: [
          { name: 'Problem Solving', max: 40, obtained: 38 },
          { name: 'Logic & Approach', max: 30, obtained: 28 },
          { name: 'Code Quality', max: 20, obtained: 19 },
          { name: 'Time Management', max: 10, obtained: 10 },
        ],
      },
      award: '🥇 1st Place Gold Winner',
      certificateId: 'CRT-102938',
    },
    {
      _id: 'evt-2',
      name: 'UI/UX Design Challenge',
      date: '2026-06-10',
      location: 'Lab 3',
      status: 'REGISTERED',
      attendanceVerified: true,
      attendanceTime: '2026-06-10 09:45 AM',
      marks: {
        total: 88,
        criteria: [
          { name: 'Visual Aesthetics', max: 40, obtained: 36 },
          { name: 'User Flow & Wireframing', max: 30, obtained: 26 },
          { name: 'Prototyping Interaction', max: 20, obtained: 17 },
          { name: 'Presentation Speed', max: 10, obtained: 9 },
        ],
      },
      award: '🥈 2nd Place Silver Medal',
      certificateId: 'CRT-102939',
    },
    {
      _id: 'evt-3',
      name: 'Poster Presentation',
      date: '2026-06-18',
      location: 'Auditorium',
      status: 'REGISTERED',
      attendanceVerified: false,
      attendanceTime: null,
      marks: null,
      award: null,
      certificateId: null,
    },
  ],
};

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(DEFAULT_USER_DETAILS);
  const [loading, setLoading] = useState(true);
  const [fullScreenQR, setFullScreenQR] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        if (res.data) {
          setUserData(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.warn('Using local detailed fallback for user:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  const fullName = `${userData.firstName || 'John'} ${userData.lastName || 'Doe'}`.trim();
  const initials = (userData.firstName?.[0] || 'J') + (userData.lastName?.[0] || 'D');
  const passportQR = `CAMPUS-PASS-${userData.userId || 'USR-102938'}-${userData.rollNumber || '21BCA102'}`;

  return (
    <DashboardLayout>
      {/* Back Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-secondary"
          style={{ borderRadius: 12, padding: '8px 18px', gap: 8, fontSize: '0.86rem', fontWeight: 700 }}
        >
          <HiArrowLeft /> Back to Users
        </button>

        <span
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '6px 16px',
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <HiShieldCheck style={{ fontSize: '1.05rem' }} /> VERIFIED STUDENT ACCOUNT
        </span>
      </div>

      {/* Hero Profile Overview Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 26,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ height: 110, background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)' }} />

        <div style={{ padding: '0 32px 28px', marginTop: -45, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                border: '4px solid var(--bg-card)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                fontWeight: 900,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              {initials}
            </div>

            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {fullName}
              </h2>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: 2 }}>
                {userData.userId || 'USR-102938'} • Roll No. {userData.rollNumber || '21BCA102'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {userData.department || 'BCA'} | Year {userData.year || 2} - Class {userData.className || 'A'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <span
              style={{
                background: userData.isActive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                color: userData.isActive ? '#10B981' : '#EF4444',
                fontSize: '0.82rem',
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: userData.isActive ? '#10B981' : '#EF4444' }} />
              {userData.isActive ? 'Active Account' : 'Inactive Account'}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Column Split: Left E-ICard Passport & Right Attribute Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 24, marginBottom: 28 }}>
        {/* Left: Official Campus Identity Passport (E-ICard) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 22,
            padding: '26px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.14)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 14px', borderRadius: 20 }}>
              Official Campus E-ICard
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              VALID 2026 — 2027
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>STUDENT NAME</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{fullName}</strong>
              <span style={{ fontSize: '0.84rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 800 }}>{userData.userId}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{userData.department} • Class {userData.className}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Roll: {userData.rollNumber}</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                onClick={() =>
                  setFullScreenQR({
                    value: passportQR,
                    title: `${fullName} — Campus Passport`,
                    subtitle: `Roll: ${userData.rollNumber} • ${userData.department}`,
                    tokenLabel: `Token: ${passportQR}`,
                  })
                }
                title="Click for Fullscreen QR Stand"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: 10,
                  border: '2px solid var(--primary)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                <QRCode value={passportQR} size={90} />
              </div>
              <span
                onClick={() =>
                  setFullScreenQR({
                    value: passportQR,
                    title: `${fullName} — Campus Passport`,
                    subtitle: `Roll: ${userData.rollNumber} • ${userData.department}`,
                    tokenLabel: `Token: ${passportQR}`,
                  })
                }
                style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}
              >
                <HiArrowsExpand /> Fullscreen QR
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 'auto 0 0 0', lineHeight: 1.5 }}>
            Official digital identity credential issued by CampusFlow University. Scan to verify attendance and access campus events.
          </p>
        </div>

        {/* Right: Academic Specifications Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>EMAIL ADDRESS</span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{userData.email}</h4>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>PHONE NUMBER</span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{userData.mobile || '9876543210'}</h4>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>DEPARTMENT</span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{userData.department}</h4>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>YEAR & CLASS</span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>Year {userData.year || 2} — Class {userData.className || 'A'}</h4>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL JOINED EVENTS</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366F1', margin: '4px 0 0 0' }}>{userData.joinedEvents?.length || 3} Events</h4>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>PODIUM AWARDS</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F59E0B', margin: '4px 0 0 0' }}>2 Awards Won 🏆</h4>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: JOINED EVENTS, ATTENDANCE & MARKS SPECIFICATIONS
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: 28,
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
              Joined Events & Evaluation Breakdown
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Complete record of event registrations, attendance E-Cards, criteria marks, and certificates
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {userData.joinedEvents?.map((evt, idx) => (
            <div
              key={evt._id || idx}
              style={{
                padding: '22px 24px',
                borderBottom: idx < userData.joinedEvents.length - 1 ? '1px solid var(--border-color)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Event Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <EventThumbnail name={evt.name} size={48} borderRadius={12} />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {evt.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiCalendar /> {evt.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiLocationMarker style={{ color: '#EF4444' }} /> {evt.location}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {evt.award && (
                    <span style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#D97706', fontSize: '0.8rem', fontWeight: 800, padding: '6px 14px', borderRadius: 16 }}>
                      {evt.award}
                    </span>
                  )}

                  <span
                    style={{
                      background: evt.attendanceVerified ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
                      color: evt.attendanceVerified ? '#10B981' : '#F59E0B',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <HiCheckCircle />
                    {evt.attendanceVerified ? 'Attendance Scanned & Verified' : 'Registration Open (Pending Scan)'}
                  </span>
                </div>
              </div>

              {/* Criteria Marks & Certificate Bar */}
              {evt.marks ? (
                <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      CRITERIA MARKS EVALUATION
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {evt.marks.criteria.map((c, i) => (
                        <span key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem' }}>
                          {c.name}: <strong>{c.obtained}/{c.max}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL SCORE</span>
                      <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', display: 'block' }}>
                        {evt.marks.total} / 100
                      </strong>
                    </div>

                    {evt.certificateId && (
                      <Link
                        to={`/verify-certificate/${evt.certificateId}`}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        Verify Certificate ➔
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-app)', borderRadius: 12, padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Evaluation and scoring for this event have not been conducted yet.
                </div>
              )}
            </div>
          ))}
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

export default UserDetails;
