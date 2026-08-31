import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LiveQRScanner from '../../components/common/LiveQRScanner';
import {
  HiCheckCircle, HiXCircle, HiPhone, HiMail, HiKey, HiCamera, HiQrcode, HiTrendingUp
} from 'react-icons/hi';

const Scanner = () => {
  const [mode, setMode] = useState('attendance'); // 'attendance' or 'identity'
  const [inputMethod, setInputMethod] = useState('camera'); // 'camera' or 'pin'
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [turnout, setTurnout] = useState({ totalRegistered: 0, checkedInCount: 0, turnoutPercentage: 0 });
  const [manualPin, setManualPin] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0]._id);
        fetchTurnout(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTurnout = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await api.get(`/attendance/events/${eventId}/turnout`);
      setTurnout(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventChange = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    fetchTurnout(evId);
  };

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
        const res = await api.post('/attendance/scan', {
          token: scannedValue.trim(),
          eventId: selectedEventId,
        });
        setResult({ type: 'attendance', data: res.data });
      } catch (err) {
        setError(err.response?.data?.message || 'Attendance scan failed. Invalid or expired QR token.');
      }
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!manualPin.trim()) return;
    setError('');
    setResult(null);

    try {
      const res = await api.post('/attendance/scan', {
        pin: manualPin.trim(),
        eventId: selectedEventId,
      });
      setResult({ type: 'attendance', data: res.data });
      setManualPin('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-digit PIN. No registration found.');
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
      setResult((prev) => ({ ...prev, processed: action }));
      if (selectedEventId) fetchTurnout(selectedEventId);
    } catch (err) {
      setError(err.response?.data?.message || 'Processing attendance failed.');
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
    setManualPin('');
  };

  return (
    <DashboardLayout
      title="Attendance & Identity Scanner"
      subtitle="Live camera QR verification & real-time turnout tracker"
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Real-time Turnout Ticker Widget */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Active Event Monitor
              </label>
              <select
                className="form-control"
                style={{ padding: '6px 10px', fontSize: '0.86rem' }}
                value={selectedEventId}
                onChange={handleEventChange}
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.name}</option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {turnout.turnoutPercentage}%
              </span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Turnout Rate</p>
            </div>
          </div>

          {/* Turnout Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: 10 }}>
            <div
              style={{
                width: `${turnout.turnoutPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00D27A, var(--primary))',
                borderRadius: '4px',
                transition: 'width 400ms ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span>✓ Checked in: <strong style={{ color: '#00D27A' }}>{turnout.checkedInCount}</strong></span>
            <span>Total Enrolled: <strong>{turnout.totalRegistered}</strong></span>
            <span>Pending: <strong>{turnout.pendingCount}</strong></span>
          </div>
        </div>

        {/* Mode Switcher (Attendance vs Identity) */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <button
            className={`btn ${mode === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => { setMode('attendance'); resetScanner(); }}
          >
            <HiQrcode /> Event Attendance Check-in
          </button>
          <button
            className={`btn ${mode === 'identity' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => { setMode('identity'); resetScanner(); }}
          >
            <HiCheckCircle /> Identity Card Lookup
          </button>
        </div>

        {/* Input Method Toggle (Live Camera vs 6-Digit PIN) */}
        {mode === 'attendance' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              className={`filter-tab ${inputMethod === 'camera' ? 'active' : ''}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              onClick={() => setInputMethod('camera')}
            >
              <HiCamera /> Camera Scanner
            </button>
            <button
              className={`filter-tab ${inputMethod === 'pin' ? 'active' : ''}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              onClick={() => setInputMethod('pin')}
            >
              <HiKey /> 6-Digit PIN Fallback
            </button>
          </div>
        )}

        {/* Scanner Body */}
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 18 }}>
              {error}
            </div>
          )}

          {!result ? (
            inputMethod === 'camera' || mode === 'identity' ? (
              <LiveQRScanner
                onScan={handleScan}
                modeTitle={mode === 'identity' ? 'Scan Student Identity QR' : 'Scan Event Attendance Pass QR'}
              />
            ) : (
              <form onSubmit={handlePinSubmit} style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: 2 }}>
                  <HiKey style={{ margin: '0 auto' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Manual PIN Check-in</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  If the student's phone screen is cracked or damaged, enter their 6-digit one-time check-in PIN
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-Digit PIN (e.g. 849201)"
                    value={manualPin}
                    onChange={(e) => setManualPin(e.target.value.replace(/\D/g, ''))}
                    className="form-control"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      letterSpacing: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: 'var(--primary)',
                    }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Verify Student PIN
                </button>
              </form>
            )
          ) : (
            <div>
              {/* Scan Result Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  {result.data.user.profileImage?.url ? (
                    <img
                      src={result.data.user.profileImage.url}
                      alt=""
                      style={{ width: 64, height: 64, borderRadius: '16px', border: '2px solid var(--primary)' }}
                    />
                  ) : (
                    <div className="identity-hero-avatar-placeholder" style={{ width: 64, height: 64, borderRadius: '16px', fontSize: '1.6rem' }}>
                      {result.data.user.firstName ? result.data.user.firstName[0] : 'S'}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                      {result.data.user.firstName} {result.data.user.lastName}
                    </h3>
                    <p style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700, fontSize: '0.84rem' }}>
                      {result.data.user.userId} • Roll: {result.data.user.rollNumber}
                    </p>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {result.data.user.department} ({result.data.user.year}nd Year - {result.data.user.className})
                    </p>
                  </div>
                </div>

                {result.data.event && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <p><strong>Event:</strong> {result.data.event.name}</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                      📍 {result.data.event.location || 'Campus Hall'}
                    </p>
                  </div>
                )}

                {result.data.alreadyProcessed && (
                  <div className="alert alert-warning" style={{ marginTop: 12, marginBottom: 0, fontSize: '0.78rem' }}>
                    ⚠️ {result.data.message}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {result.processed ? (
                <div>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: result.processed === 'ACCEPTED' ? 'rgba(0, 210, 122, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: result.processed === 'ACCEPTED' ? '#00D27A' : '#EF4444',
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    ✓ Attendance {result.processed}
                  </div>
                  <button className="btn btn-primary" onClick={resetScanner} style={{ width: '100%' }}>
                    Scan Next Participant
                  </button>
                </div>
              ) : mode === 'attendance' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleProcess('ACCEPTED')}
                    disabled={processing}
                    style={{ background: '#00D27A', borderColor: '#00D27A' }}
                  >
                    ✓ Accept Entry
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleProcess('DECLINED')}
                    disabled={processing}
                  >
                    ✗ Decline Entry
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={resetScanner} style={{ width: '100%' }}>
                  Scan Next Identity Card
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
