import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import { HiDownload, HiCheckCircle, HiX, HiShare, HiExternalLink } from 'react-icons/hi';

const CertificateModal = ({ certificate, onClose }) => {
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const {
    certificateId,
    type,
    title,
    position,
    marks,
    issueDate,
    recipient,
    event,
    userId: userPop,
    eventId: eventPop,
  } = certificate;

  const studentName = recipient?.name || (userPop ? `${userPop.firstName} ${userPop.lastName}` : 'Student Name');
  const studentId = recipient?.userId || userPop?.userId || 'USR-102938';
  const studentDept = recipient?.department || userPop?.department || 'BCA';
  const studentRoll = recipient?.rollNumber || userPop?.rollNumber || '21BCA102';
  const eventName = event?.name || eventPop?.name || 'Campus Event';
  const eventDate = event?.date || eventPop?.date || issueDate;
  const verificationUrl = `${window.location.origin}/verify-certificate/${certificateId}`;

  const isWinner = type && type.startsWith('WINNER');

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#08080D',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_${certificateId}.pdf`);
    } catch (err) {
      console.error('Failed to export certificate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '95%',
          background: '#0B0D15',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>📜</span>
            <div>
              <h2>Verified Digital Credential</h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Credential ID: <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{certificateId}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <HiX />
          </button>
        </div>

        {/* Certificate Container to Export */}
        <div style={{ padding: '24px', overflowX: 'auto' }}>
          <div
            ref={certRef}
            style={{
              width: '800px',
              minHeight: '520px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, #090B14 0%, #111524 50%, #080A12 100%)',
              border: isWinner ? '4px solid #F59E0B' : '4px solid var(--primary)',
              borderRadius: '20px',
              padding: '40px 48px',
              position: 'relative',
              boxShadow: isWinner ? '0 0 40px rgba(245, 158, 11, 0.25)' : 'var(--shadow-qr)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#FFFFFF',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Watermark Logo */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '18rem',
                opacity: 0.03,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🕷️
            </div>

            {/* Certificate Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '2.2rem' }}>🎓</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#FFFFFF' }}>
                    EVENTHUB CAMPUS BOARD
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.8px' }}>
                    OFFICIAL VERIFIED CERTIFICATION PROGRAM
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: isWinner ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary-light)',
                    color: isWinner ? '#F59E0B' : 'var(--primary)',
                    border: `1px solid ${isWinner ? 'rgba(245, 158, 11, 0.4)' : 'var(--primary-border)'}`,
                  }}
                >
                  {isWinner ? `🏆 ${position.toUpperCase()} WINNER` : '✓ VERIFIED PARTICIPATION'}
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>
                  {certificateId}
                </p>
              </div>
            </div>

            {/* Certificate Body Text */}
            <div style={{ textAlign: 'center', margin: '28px 0' }}>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  background: isWinner ? 'linear-gradient(135deg, #F59E0B, #FCD34D)' : 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '10px',
                }}
              >
                {isWinner ? 'Certificate of Excellence' : 'Certificate of Participation'}
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                PROUDLY PRESENTED TO
              </p>

              {/* Student Name */}
              <h2
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: '12px 0 6px',
                  fontFamily: 'serif',
                  letterSpacing: '0.5px',
                }}
              >
                {studentName}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 700 }}>
                {studentDept} Department • Roll No: {studentRoll} • ID: {studentId}
              </p>

              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', maxWidth: '640px', margin: '18px auto 0', lineHeight: 1.6 }}>
                For {isWinner ? `achieving ${position} in` : 'actively participating in'} the campus event{' '}
                <strong style={{ color: '#FFFFFF' }}>"{eventName}"</strong> held on{' '}
                {new Date(eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
              </p>
            </div>

            {/* Certificate Footer (Signatures & QR Stand) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
              {/* Left Signatures */}
              <div style={{ display: 'flex', gap: 36, textAlign: 'center' }}>
                <div>
                  <div style={{ width: '130px', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', paddingBottom: '4px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#FFFFFF' }}>Dr. A. Sharma</span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>EVENT CONVENER</p>
                </div>

                <div>
                  <div style={{ width: '130px', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', paddingBottom: '4px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#FFFFFF' }}>Principal Seal</span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAMPUS DIRECTOR</p>
                </div>
              </div>

              {/* Right Verification QR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ background: '#FFFFFF', padding: '4px', borderRadius: '6px' }}>
                  <QRCode value={verificationUrl} size={58} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00D27A', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HiCheckCircle /> SCAN TO VERIFY
                  </p>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Issued: {new Date(issueDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HiExternalLink /> Open Public Verification Link
          </a>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <HiDownload /> {downloading ? 'Generating PDF...' : 'Download PDF Certificate'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
