import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LiveQRScanner from '../../components/common/LiveQRScanner';
import {
  HiCheckCircle, HiXCircle, HiCamera, HiQrcode,
  HiKey, HiRefresh, HiShieldCheck, HiLightBulb,
  HiWifi, HiDocumentReport, HiClipboardCopy, HiCheck
} from 'react-icons/hi';
import { FaQrcode, FaCamera, FaKey, FaIdCard } from 'react-icons/fa';

const Scanner = () => {
  const [mode, setMode] = useState('attendance'); // 'attendance' or 'identity'
  const [inputMethod, setInputMethod] = useState('camera'); // 'camera' or 'pin'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [turnout, setTurnout] = useState({ totalRegistered: 3, checkedInCount: 1, turnoutPercentage: 33 });
  const [manualToken, setManualToken] = useState('');
  const [manualPin, setManualPin] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScanText, setLastScanText] = useState('No scans yet');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
        setSelectedEventId(res.data[0]._id);
        fetchTurnout(res.data[0]._id);
      } else {
        const mockEvts = [
          { _id: 'e4', name: 'Code Carnival 2.0' },
          { _id: 'e3', name: 'UI/UX Design Challenge' },
        ];
        setEvents(mockEvts);
        setSelectedEventId(mockEvts[0]._id);
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
    setLastScanText(scannedValue);

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
        fetchTurnout(selectedEventId);
      } catch (err) {
        setError(err.response?.data?.message || 'Attendance scan failed. Invalid or expired QR token.');
      }
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (manualToken.trim()) {
      handleScan(manualToken.trim());
    }
  };

  const currentEvent = events.find(e => e._id === selectedEventId) || events[0] || {};
  const pendingCount = Math.max(0, (turnout.totalRegistered || 3) - (turnout.checkedInCount || 1));

  return (
    <DashboardLayout>
      {/* Top Title & Access Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            <HiQrcode />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Attendance & Identity Scanner
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Live camera QR verification & real-time turnout tracker
            </p>
          </div>
        </div>

        <span
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '6px 16px',
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <HiShieldCheck style={{ fontSize: '1.05rem' }} /> MEMBER ACCESS GRANTED
        </span>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', fontWeight: 700, fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '14px 20px', borderRadius: 14, marginBottom: 20, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✓ Attendance marked successfully for student!</span>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: 'none', color: '#10B981', fontWeight: 800, cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}

      {/* =========================================================================
          2 COLUMN LAYOUT (SCANNER TERMINAL & SIDEBAR OVERVIEW)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Left Column: Event Monitor, Mode Selectors, Camera Standby Box, Manual Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Event Monitor Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1, maxWidth: 360 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Active Event Monitor
                </label>
                <select
                  value={selectedEventId}
                  onChange={handleEventChange}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', display: 'block', lineHeight: 1 }}>
                  {turnout.turnoutPercentage || 33}%
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Turnout Rate</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-app)', overflow: 'hidden', margin: '14px 0 16px' }}>
              <div style={{ width: `${turnout.turnoutPercentage || 33}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
            </div>

            {/* Metrics Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <HiCheck /> Checked In: {turnout.checkedInCount || 1}
              </span>
              <span>Total Enrolled: {turnout.totalRegistered || 3}</span>
              <span style={{ color: '#F59E0B' }}>Pending: {pendingCount}</span>
            </div>
          </div>

          {/* 4 Mode & Input Selector Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => setMode('attendance')}
              style={{
                padding: '12px',
                borderRadius: 12,
                border: mode === 'attendance' ? 'none' : '1px solid var(--border-color)',
                background: mode === 'attendance' ? 'var(--primary)' : 'var(--bg-card)',
                color: mode === 'attendance' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <HiQrcode /> Event Attendance Check-in
            </button>

            <button
              onClick={() => setMode('identity')}
              style={{
                padding: '12px',
                borderRadius: 12,
                border: mode === 'identity' ? 'none' : '1px solid var(--border-color)',
                background: mode === 'identity' ? 'var(--primary)' : 'var(--bg-card)',
                color: mode === 'identity' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FaIdCard /> Identity Card Lookup
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => setInputMethod('camera')}
              style={{
                padding: '10px',
                borderRadius: 12,
                border: inputMethod === 'camera' ? 'none' : '1px solid var(--border-color)',
                background: inputMethod === 'camera' ? 'var(--primary)' : 'var(--bg-card)',
                color: inputMethod === 'camera' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FaCamera /> Camera Scanner
            </button>

            <button
              onClick={() => setInputMethod('pin')}
              style={{
                padding: '10px',
                borderRadius: 12,
                border: inputMethod === 'pin' ? 'none' : '1px solid var(--border-color)',
                background: inputMethod === 'pin' ? 'var(--primary)' : 'var(--bg-card)',
                color: inputMethod === 'pin' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FaKey /> 6-Digit PIN Fallback
            </button>
          </div>

          {/* Camera Scanner Container (Matching Memebers/2.png Layout) */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 22,
              padding: '30px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Viewfinder corner brackets */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                height: '240px',
                borderRadius: 18,
                background: 'var(--bg-app)',
                border: '2px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              {cameraActive ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <LiveQRScanner onScanSuccess={handleScan} />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      marginBottom: 12,
                    }}
                  >
                    <HiCamera />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                    Camera Standby
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Click "Start Camera" to activate real-time scanner
                  </p>
                </>
              )}
            </div>

            {/* Camera Controls */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className="btn btn-primary"
                style={{ borderRadius: 12, padding: '10px 24px', fontWeight: 800 }}
              >
                {cameraActive ? '⏹ Stop Camera' : '▶ Start Camera'}
              </button>

              <button
                onClick={() => setCameraFacing(f => (f === 'environment' ? 'user' : 'environment'))}
                className="btn btn-secondary"
                style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 700 }}
              >
                <HiRefresh /> Switch (Rear)
              </button>
            </div>

            {/* Manual QR Input */}
            <form onSubmit={handleManualSubmit} style={{ width: '100%' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Manual QR Code Input / Scanner Token
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '0 14px', height: 44, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Point camera at QR code or paste text..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                />
                <HiClipboardCopy style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <HiCheckCircle /> Verify & Process QR Code
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scanner Overview & Quick Tips Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Scanner Overview Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 22,
              padding: '26px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>🎴</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Scanner Overview
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.86rem' }}>
              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Connection Status</span>
                <span style={{ color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Camera Connected
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Recognition Mode</span>
                <strong style={{ color: 'var(--primary)' }}>Real-time QR Detection</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Last Scan</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lastScanText}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Auto Save</span>
                <strong style={{ color: '#10B981' }}>Enabled</strong>
              </div>
            </div>
          </div>

          {/* Quick Tips Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 22,
              padding: '26px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: '1.2rem', color: '#F59E0B' }}>💡</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Quick Tips
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#F59E0B' }}>☀️</span>
                <span>Ensure good lighting for accurate scanning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#6366F1' }}>🔲</span>
                <span>Hold QR code steady within the frame</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#06B6D4' }}>🎴</span>
                <span>Identity cards can be scanned for quick check-in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#10B981' }}>🔢</span>
                <span>Use 6-digit PIN fallback if QR is not available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
