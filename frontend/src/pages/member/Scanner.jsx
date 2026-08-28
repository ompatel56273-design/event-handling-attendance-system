import { useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LiveQRScanner from '../../components/common/LiveQRScanner';
import {
  HiCheckCircle, HiXCircle, HiPhone, HiMail
} from 'react-icons/hi';

const Scanner = () => {
  const [mode, setMode] = useState('identity'); // 'identity' or 'attendance'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleScan = async (scannedValue) => {
    if (!scannedValue) return;
    setError('');
    setResult(null);

    if (mode === 'identity') {
      try {
        const res = await api.post('/qr/identity/scan', { userId: scannedValue.trim() });
        setResult({ type: 'identity', data: res.data });
      } catch (err) {
        setError(err.response?.data?.message || 'Identity scan failed. Student not found.');
      }
    } else {
      try {
        const res = await api.post('/attendance/scan', { token: scannedValue.trim() });
        setResult({ type: 'attendance', data: res.data });
      } catch (err) {
        setError(err.response?.data?.message || 'Attendance scan failed. Invalid or expired QR token.');
      }
    }
  };

  const handleProcess = async (action) => {
    if (!result?.data) return;
    setProcessing(true);
    try {
      await api.post('/attendance/process', {
        registrationId: result.data.registrationId,
        userId: result.data.user._id,
        eventId: result.data.event._id,
        action,
      });
      setResult(prev => ({ ...prev, processed: action }));
    } catch (err) {
      setError(err.response?.data?.message || 'Processing attendance failed.');
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
  };

  return (
    <DashboardLayout
      title="Attendance & Identity Scanner"
      subtitle="Live camera QR verification & attendance check-in"
    >
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Mode Switcher Tabs */}
        <div className="filter-tabs-bar" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <button
            className={`tab-pill ${mode === 'identity' ? 'active' : ''}`}
            onClick={() => { setMode('identity'); resetScanner(); }}
          >
            🪪 Identity QR Scanner
          </button>
          <button
            className={`tab-pill ${mode === 'attendance' ? 'active' : ''}`}
            onClick={() => { setMode('attendance'); resetScanner(); }}
          >
            📋 Attendance QR Scanner
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Live Camera Scanner Box */}
        {!result && (
          <LiveQRScanner
            key={mode}
            onScan={handleScan}
            modeLabel={mode === 'identity' ? 'Identity QR (User ID)' : 'Attendance QR Token'}
            placeholder={mode === 'identity' ? 'Scan Identity QR or type User ID (e.g. USR-102938)...' : 'Scan Attendance QR or paste token...'}
          />
        )}

        {/* 1. Identity Scan Result */}
        {result?.type === 'identity' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #EAEFF5', marginBottom: 18 }}>
              <span style={{ color: '#10B981', fontSize: '1.4rem' }}>●</span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981' }}>Student Verified</h3>
                <p style={{ fontSize: '0.72rem', color: '#64748B' }}>Valid Identity QR Confirmed</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              {result.data.user?.profileImage?.url ? (
                <img src={result.data.user.profileImage.url} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <div className="identity-hero-avatar-placeholder" style={{ width: 80, height: 80, fontSize: '1.6rem' }}>
                  {result.data.user?.firstName ? result.data.user.firstName[0] : 'U'}
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {result.data.user?.firstName} {result.data.user?.lastName}
                </h3>
                <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                  {result.data.user?.userId}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {result.data.user?.department} | {result.data.user?.year}nd Year - {result.data.user?.className}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Roll No. {result.data.user?.rollNumber}
                </p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B' }}>
                <HiPhone style={{ color: '#5C33CF' }} /> <span>{result.data.user?.mobile}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B' }}>
                <HiMail style={{ color: '#5C33CF' }} /> <span>{result.data.user?.email}</span>
              </div>
            </div>

            <button className="btn btn-secondary btn-full" style={{ marginTop: 18 }} onClick={resetScanner}>
              Scan Next Student
            </button>
          </div>
        )}

        {/* 2. Attendance Action Result */}
        {result?.type === 'attendance' && (
          <div className="card">
            {result.processed ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
                  {result.processed === 'ACCEPTED' ? '✅' : '❌'}
                </div>
                <h2 style={{ fontSize: '1.3rem' }}>Attendance {result.processed}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  {result.data.user?.firstName} {result.data.user?.lastName} — {result.data.event?.name}
                </p>
                <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={resetScanner}>
                  Scan Next Attendance QR
                </button>
              </div>
            ) : (
              <>
                <div className="card-header" style={{ borderBottom: '1px solid #EAEFF5', paddingBottom: 12 }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 4 }}>Attendance Check-in</span>
                    <h3 style={{ fontSize: '1.15rem' }}>{result.data.event?.name}</h3>
                  </div>
                  <span className="badge badge-info">{new Date(result.data.event?.date).toLocaleDateString()}</span>
                </div>

                {result.data.alreadyProcessed && (
                  <div className="alert alert-warning" style={{ marginTop: 12, marginBottom: 12 }}>
                    ⚠️ This student's attendance has already been recorded as <strong>{result.data.attendance?.status}</strong>. You may update it below if needed.
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '14px 0 18px' }}>
                  {result.data.user?.profileImage?.url ? (
                    <img src={result.data.user.profileImage.url} alt="" style={{ width: 75, height: 75, borderRadius: 12, objectFit: 'cover' }} />
                  ) : (
                    <div className="identity-hero-avatar-placeholder" style={{ width: 75, height: 75, fontSize: '1.5rem' }}>
                      {result.data.user?.firstName ? result.data.user.firstName[0] : 'U'}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {result.data.user?.firstName} {result.data.user?.lastName}
                    </h3>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {result.data.user?.userId}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {result.data.user?.department} | Roll: {result.data.user?.rollNumber}
                    </p>
                  </div>
                </div>

                <div className="attendance-action-buttons">
                  <button className="btn btn-success btn-lg" onClick={() => handleProcess('ACCEPTED')} disabled={processing}>
                    <HiCheckCircle style={{ fontSize: '1.2rem' }} /> Accept
                  </button>
                  <button className="btn btn-danger btn-lg" onClick={() => handleProcess('DECLINED')} disabled={processing}>
                    <HiXCircle style={{ fontSize: '1.2rem' }} /> Decline
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
