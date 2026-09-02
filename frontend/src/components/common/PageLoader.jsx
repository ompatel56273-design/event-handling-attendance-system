import React from 'react';

const PageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        color: 'var(--primary, #6366F1)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '3.5px solid rgba(99, 102, 241, 0.15)',
          borderTop: '3.5px solid #6366F1',
          borderRadius: '50%',
          animation: 'spinLoader 650ms linear infinite',
          marginBottom: 16,
        }}
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', letterSpacing: '0.3px' }}>
        Loading Terminal...
      </span>
      <style>{`
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
