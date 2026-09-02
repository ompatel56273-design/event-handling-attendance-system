import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiHome, HiArrowLeft, HiRefresh, HiSearch,
  HiShieldExclamation, HiSparkles
} from 'react-icons/hi';
import { FaCompass, FaRocket } from 'react-icons/fa';

const NotFound = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();

  const dashboardPath = isAuthenticated && role ? getDashboardPath(role) : '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        background: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Glowing Ambient Gradient Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main 404 Glass Card */}
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 28,
          padding: '48px 36px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Animated Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.78rem',
            fontWeight: 900,
            letterSpacing: '0.5px',
            marginBottom: 20,
          }}
        >
          <HiShieldExclamation style={{ fontSize: '1.1rem' }} /> ERROR CODE: 404 — PAGE NOT FOUND
        </div>

        {/* Giant Glowing 404 Header */}
        <h1
          style={{
            fontSize: '5.5rem',
            fontWeight: 900,
            letterSpacing: '-2px',
            margin: '0 0 8px 0',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 20px rgba(99, 102, 241, 0.3))',
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          Lost in the Campus Space?
        </h2>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 28px 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
          The requested page or route does not exist, has been relocated, or is temporarily offline.
        </p>

        {/* Quick Action Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Link
            to="/"
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            <HiHome /> Home Portal
          </Link>

          <Link
            to={dashboardPath}
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <FaRocket style={{ color: 'var(--primary)' }} /> My Dashboard
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <HiArrowLeft /> Go Back
          </button>

          <span style={{ color: 'var(--border-color)' }}>•</span>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <HiRefresh /> Reload Page
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ marginTop: 24, fontSize: '0.78rem', color: 'var(--text-muted)', zIndex: 10 }}>
        EVENTHUB ENTERPRISE SUITE • CAMPUSFLOW PLATFORM
      </div>
    </div>
  );
};

export default NotFound;
