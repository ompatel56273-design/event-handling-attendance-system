import { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { HiX, HiArrowsExpand, HiClipboardCopy, HiCheck } from 'react-icons/hi';
import { useState } from 'react';

const FullScreenQRModal = ({
  isOpen,
  onClose,
  title = 'QR Verification Pass',
  subtitle = 'Official Campus Verification Pass',
  value = '',
  tokenLabel = '',
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fullscreen-qr-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 4, 10, 0.92)',
        backdropFilter: 'blur(22px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalScale 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="fullscreen-qr-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '28px',
          padding: '36px 32px',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px var(--primary-glow)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          aria-label="Close Fullscreen QR"
        >
          <HiX />
        </button>

        {/* Title & Subtitle */}
        <div>
          <span
            className="badge badge-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.74rem',
              letterSpacing: '0.8px',
              padding: '4px 12px',
              marginBottom: 10,
            }}
          >
            <HiArrowsExpand /> FULLSCREEN SCAN VIEW
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {subtitle}
          </p>
        </div>

        {/* High-Resolution Standout QR Code Box */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 0 35px var(--shadow-qr), 0 12px 30px rgba(0, 0, 0, 0.5)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <QRCode value={value} size={250} level="H" />

          {/* Cyber Corner HUD Highlights */}
          <div className="scanner-corner tl" style={{ top: 8, left: 8, width: 22, height: 22 }} />
          <div className="scanner-corner tr" style={{ top: 8, right: 8, width: 22, height: 22 }} />
          <div className="scanner-corner bl" style={{ bottom: 8, left: 8, width: 22, height: 22 }} />
          <div className="scanner-corner br" style={{ bottom: 8, right: 8, width: 22, height: 22 }} />
        </div>

        {/* Token Info & Copy Button */}
        <div style={{ width: '100%' }}>
          <div
            onClick={handleCopy}
            title="Click to copy raw token"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'monospace',
              fontSize: '0.86rem',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{tokenLabel || value}</span>
            {copied ? <HiCheck style={{ color: '#10B981', fontSize: '1.1rem' }} /> : <HiClipboardCopy style={{ fontSize: '1.1rem' }} />}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
            💡 Hold phone screen brightness high for rapid optical camera scanner verification.
          </p>
        </div>

        {/* Action Button */}
        <button
          className="btn btn-secondary"
          onClick={onClose}
          style={{ width: '100%', padding: '10px', fontSize: '0.92rem', fontWeight: 700 }}
        >
          Done & Close
        </button>
      </div>
    </div>
  );
};

export default FullScreenQRModal;
