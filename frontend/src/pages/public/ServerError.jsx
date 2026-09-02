import { Link, useNavigate } from 'react-router-dom';
import { HiServer, HiRefresh, HiHome, HiWifi } from 'react-icons/hi';
import { FaServer } from 'react-icons/fa';

const ServerError = () => {
  const navigate = useNavigate();

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
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
          }}
        >
          <FaServer />
        </div>

        <h1
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            letterSpacing: '-2px',
            margin: '0 0 6px 0',
            lineHeight: 1,
            color: '#F59E0B',
          }}
        >
          500
        </h1>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          Server / Network Connection Issue
        </h2>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 28px 0' }}>
          The server is currently taking longer than usual to respond or is undergoing brief maintenance. Offline-saved identity cards and passes remain fully accessible.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HiRefresh /> Retry Connection
          </button>

          <Link
            to="/"
            className="btn btn-secondary"
            style={{
              padding: '12px 24px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HiHome /> Home Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
