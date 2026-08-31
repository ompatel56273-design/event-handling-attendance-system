import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { HiCheckCircle, HiXCircle, HiAcademicCap, HiCalendar, HiShieldCheck, HiArrowLeft } from 'react-icons/hi';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/certificates/verify/${certificateId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate verification failed. Credential not found.');
      } finally {
        setLoading(false);
      }
    };
    if (certificateId) verify();
  }, [certificateId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07080C',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        position: 'relative',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: '2rem' }}>🕷️</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px' }}>EVENTHUB</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          OFFICIAL CREDENTIAL VERIFICATION SYSTEM
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <h3>Verifying Credential Authenticity...</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Querying secure blockchain & campus database records
          </p>
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            padding: '36px 24px',
            border: '2px solid #EF4444',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 16px',
            }}
          >
            <HiXCircle />
          </div>
          <h2 style={{ fontSize: '1.3rem', color: '#EF4444', marginBottom: 8 }}>Verification Unsuccessful</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            Searched ID: <strong>{certificateId}</strong>
          </div>
          <Link to="/login" className="btn btn-secondary btn-sm" style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiArrowLeft /> Go to EventHub Portal
          </Link>
        </div>
      ) : (
        <div
          className="card"
          style={{
            maxWidth: 560,
            width: '100%',
            padding: '36px 28px',
            border: '2px solid #00D27A',
            boxShadow: '0 0 35px rgba(0, 210, 122, 0.2)',
            borderRadius: '24px',
          }}
        >
          {/* Verification Badge */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'rgba(0, 210, 122, 0.15)',
                color: '#00D27A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                margin: '0 auto 12px',
                border: '2px solid rgba(0, 210, 122, 0.4)',
                boxShadow: '0 0 20px rgba(0, 210, 122, 0.3)',
              }}
            >
              <HiCheckCircle />
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '1.2px',
                color: '#00D27A',
                background: 'rgba(0, 210, 122, 0.1)',
                border: '1px solid rgba(0, 210, 122, 0.3)',
                padding: '4px 14px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <HiShieldCheck /> OFFICIALLY VERIFIED CREDENTIAL
            </span>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 14, color: '#FFFFFF' }}>
              {data.certificate.title}
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>
              ID: {data.certificate.certificateId}
            </p>
          </div>

          {/* Details Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Student Name</span>
              <strong style={{ color: '#FFFFFF' }}>{data.certificate.recipient.name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Student ID / Roll No</span>
              <strong style={{ fontFamily: 'monospace', color: '#0EA5E9' }}>
                {data.certificate.recipient.userId} • {data.certificate.recipient.rollNumber}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department</span>
              <span style={{ color: '#FFFFFF' }}>
                {data.certificate.recipient.department} ({data.certificate.recipient.year}nd Year - {data.certificate.recipient.className})
              </span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Event</span>
              <strong style={{ color: '#FFFFFF' }}>{data.certificate.event.name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Event Date & Venue</span>
              <span style={{ color: '#CBD5E1' }}>
                {new Date(data.certificate.event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {data.certificate.event.location}
              </span>
            </div>

            {data.certificate.position && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Podium Result</span>
                <span className="badge badge-warning">{data.certificate.position} ({data.certificate.marks}/100)</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Issued By</span>
              <span style={{ color: '#FFFFFF' }}>{data.certificate.issuedBy}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Issue Date</span>
              <span style={{ color: '#CBD5E1' }}>
                {new Date(data.certificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/login" className="btn btn-primary btn-sm">
              Access EventHub Portal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
