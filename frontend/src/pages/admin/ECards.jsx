import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiArrowRight } from 'react-icons/hi';
import { FaIdBadge } from 'react-icons/fa';

const AdminECards = () => {
  return (
    <DashboardLayout>
      {/* Top Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          👋 Hello, Super!
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          Here's what's happening with your events.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          E-Cards Management
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
          View and manage E-Cards through Attendance Management
        </p>
      </div>

      {/* Main Elevated Container (Exact Super admin/8.png Layout) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          padding: '80px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '460px',
        }}
      >
        {/* ID Card Graphic with glowing sparkles */}
        <div
          style={{
            width: 110,
            height: 140,
            borderRadius: 18,
            background: 'var(--bg-app)',
            border: '2.5px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: 24,
            boxShadow: '0 12px 30px rgba(0,0,0,0.05)',
          }}
        >
          {/* Lanyard clip at top */}
          <div style={{ position: 'absolute', top: -12, width: 24, height: 12, borderRadius: 4, background: 'var(--border-color)' }} />
          
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 10, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}>
            👤
          </div>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: 'var(--border-color)', marginBottom: 6 }} />
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--border-color)' }} />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          E-Card Access
        </h2>

        <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 28px 0' }}>
          Identity E-Cards are generated dynamically on user dashboards.<br />
          Attendance E-Cards are managed through Attendance Management.
        </p>

        <Link
          to="/admin/attendance"
          className="btn btn-primary"
          style={{
            padding: '12px 32px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: '0.96rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ➔ Go to Attendance Management
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default AdminECards;
