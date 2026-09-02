import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiQrcode, HiTicket, HiChartBar, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { user } = useAuth();
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.name || 'Mike Johnson';

  return (
    <DashboardLayout>
      {/* Top Greeting */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            👋 Welcome, {displayName}
          </h1>
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <HiShieldCheck style={{ fontSize: '1rem' }} /> MEMBER ACCESS GRANTED
          </span>
        </div>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', margin: 0 }}>
          Event Operations & Live Attendance Terminal
        </p>
      </div>

      {/* 3 Main Action Launch Cards (Exact Memebers/1.png Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {/* Card 1: Live Attendance Scanner */}
        <Link
          to="/member/scanner"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: 20,
                }}
              >
                <HiQrcode />
              </div>

              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                SCAN STUDENT QR & VERIFY ENTRY
              </span>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                Live Attendance Scanner
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Scan student QR codes and verify entries in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)', marginTop: 24 }}>
              Launch Terminal <HiArrowRight />
            </div>
          </div>
        </Link>

        {/* Card 2: Manage Events */}
        <Link
          to="/member/events"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: 20,
                }}
              >
                <HiTicket />
              </div>

              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284C7', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                VIEW SCHEDULES, ROOMS & QUOTAS
              </span>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                Manage Events
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                View event schedules, rooms, participants and quotas.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem', fontWeight: 800, color: '#0284C7', marginTop: 24 }}>
              Launch Terminal <HiArrowRight />
            </div>
          </div>
        </Link>

        {/* Card 3: Marking System */}
        <Link
          to="/member/marks"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: 20,
                }}
              >
                <HiChartBar />
              </div>

              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                SCORE CRITERIA & PUBLISH MARKS
              </span>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                Marking System
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Define scoring criteria and publish student marks.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem', fontWeight: 800, color: '#10B981', marginTop: 24 }}>
              Launch Terminal <HiArrowRight />
            </div>
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
