import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRCode from 'react-qr-code';
import LiveQRScanner from '../../components/common/LiveQRScanner';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import {
  HiCheckCircle, HiXCircle, HiInformationCircle,
  HiCamera, HiRefresh, HiLightningBolt
} from 'react-icons/hi';

const AdminAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [participants, setParticipants] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [fullScreenQR, setFullScreenQR] = useState(null);

  // Scanner Live Camera States
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [generating, setGenerating] = useState(false);

  const handleLiveCameraScan = async (scannedToken) => {
    if (!scannedToken) return;
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/attendance/scan', { token: scannedToken.trim() });
      setScanResult(res.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid or expired Attendance QR code.' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]._id);
        loadEventDetails(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEventDetails = async (eventId) => {
    if (!eventId) return;
    try {
      const [partsRes, attRes] = await Promise.all([
        api.get(`/admin/events/${eventId}/participants`),
        api.get(`/admin/attendance/event/${eventId}`),
      ]);
      setParticipants(partsRes.data);
      setAttendanceHistory(attRes.data);

      if (partsRes.data.length > 0) {
        setSelectedUser(partsRes.data[0]._id);
        setActiveRegistration(partsRes.data[0]);
      } else {
        setSelectedUser('');
        setActiveRegistration(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    loadEventDetails(eventId);
  };

  const handleUserChange = (e) => {
    const regId = e.target.value;
    setSelectedUser(regId);
    const found = participants.find(p => p._id === regId);
    setActiveRegistration(found || null);
  };

  const handleGenerateQR = async () => {
    if (!activeRegistration) {
      setMsg({ type: 'error', text: 'Please select a registered user first.' });
      return;
    }
    setGenerating(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/attendance/generate-qr', {
        registrationId: activeRegistration._id,
      });
      setMsg({ type: 'success', text: 'Attendance QR generated successfully for this event!' });
      
      // Update local state
      setActiveRegistration(prev => ({
        ...prev,
        attendanceQrGenerated: true,
        attendanceQrToken: res.data.attendanceQrToken,
      }));

      loadEventDetails(selectedEvent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to generate QR.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleProcessScan = async () => {
    if (!scanInput.trim()) return;
    try {
      const res = await api.post('/attendance/scan', { token: scanInput.trim() });
      setScanResult(res.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Scan failed.' });
    }
  };

  const handleAttendanceAction = async (action) => {
    if (!scanResult) return;
    try {
      await api.post('/attendance/process', {
        registrationId: scanResult.registrationId,
        userId: scanResult.user._id,
        eventId: scanResult.event._id,
        action,
      });
      setScanResult(prev => ({ ...prev, processed: action }));
      setMsg({ type: 'success', text: `Attendance ${action.toLowerCase()} successfully.` });
      if (selectedEvent) loadEventDetails(selectedEvent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Processing failed.' });
    }
  };

  const handleExport = async (format = 'xlsx') => {
    try {
      const res = await api.get(`/admin/attendance/export?eventId=${selectedEvent || ''}&format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Attendance_${selectedEvent ? 'Event' : 'All'}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const currentEvent = events.find(e => e._id === selectedEvent);
  const currentUser = activeRegistration?.userId;

  return (
    <DashboardLayout
      title="Attendance Management"
      subtitle="Issue event attendance QRs and process real-time attendance"
      headerActions={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleExport('xlsx')}
            title="Download Excel Spreadsheet"
          >
            📊 Export Excel
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleExport('csv')}
            title="Download CSV"
          >
            📄 Export CSV
          </button>
          <button
            className={`btn ${scanMode ? 'btn-danger' : 'btn-secondary'} btn-sm`}
            onClick={() => { setScanMode(!scanMode); setScanResult(null); setScanInput(''); }}
          >
            <HiCamera /> {scanMode ? 'Close Scanner' : 'Open Scanner'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGenerateQR}
            disabled={generating || !activeRegistration}
          >
            {generating ? 'Generating...' : 'Generate Attendance QR'}
          </button>
        </div>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Select Event & Select User Filter Bar (Exact Match from Master Image) */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="form-row" style={{ alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.74rem', color: '#64748B' }}>Select Event</label>
            <select
              className="form-control"
              value={selectedEvent}
              onChange={handleEventChange}
            >
              {events.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.74rem', color: '#64748B' }}>Select User</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={handleUserChange}
              disabled={participants.length === 0}
            >
              {participants.length === 0 ? (
                <option value="">No registered users for this event</option>
              ) : (
                participants.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.firstName} {p.userId?.lastName} ({p.userId?.userId || 'USR'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Scanner Live Camera Box if active */}
      {scanMode && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #5C33CF' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div>
              <h2>Live Camera Attendance Scanner</h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Scan student Attendance QR code using webcam or mobile camera</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { setScanMode(false); setScanResult(null); }}>
              Close Scanner
            </button>
          </div>

          {!scanResult ? (
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
              <LiveQRScanner
                onScan={handleLiveCameraScan}
                modeLabel="Attendance QR"
                placeholder="Scan with camera or paste attendance token..."
              />
            </div>
          ) : (
            <div style={{ maxWidth: 460, margin: '0 auto' }}>
              {scanResult.processed ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 8 }}>
                    {scanResult.processed === 'ACCEPTED' ? '✅' : '❌'}
                  </div>
                  <h3>Attendance {scanResult.processed}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    {scanResult.user?.firstName} {scanResult.user?.lastName} — {scanResult.event?.name}
                  </p>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 16 }}
                    onClick={() => { setScanResult(null); setScanInput(''); }}
                  >
                    Scan Another QR
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    {scanResult.user?.profileImage?.url ? (
                      <img src={scanResult.user.profileImage.url} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                    ) : (
                      <div className="identity-hero-avatar-placeholder" style={{ width: 60, height: 60, fontSize: '1.4rem' }}>
                        {scanResult.user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{scanResult.user?.firstName} {scanResult.user?.lastName}</h3>
                      <p style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{scanResult.user?.userId}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {scanResult.user?.department} | Roll: {scanResult.user?.rollNumber}
                      </p>
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    <strong>Event:</strong> {scanResult.event?.name}
                  </div>

                  <div className="attendance-action-buttons">
                    <button className="btn btn-success" onClick={() => handleAttendanceAction('ACCEPTED')}>
                      <HiCheckCircle /> Accept
                    </button>
                    <button className="btn btn-danger" onClick={() => handleAttendanceAction('DECLINED')}>
                      <HiXCircle /> Decline
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Layout: Attendance E-Card on Left + Attendance History on Right */}
      <div className="attendance-mgmt-layout">
        {/* Left: Attendance E-Card Widget */}
        <div className="attendance-ecard-card">
          <div className="attendance-ecard-header">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 4 }}>Attendance E-Card</span>
              <h3>{currentEvent?.name || 'Selected Event'}</h3>
            </div>
            <span className="badge badge-info">{currentEvent?.date ? new Date(currentEvent.date).toLocaleDateString() : ''}</span>
          </div>

          <div className="attendance-ecard-body">
            {currentUser?.profileImage?.url ? (
              <img
                src={currentUser.profileImage.url}
                alt={currentUser.firstName}
                className="identity-hero-avatar"
                style={{ width: 85, height: 85 }}
              />
            ) : (
              <div className="identity-hero-avatar-placeholder" style={{ width: 85, height: 85, fontSize: '1.8rem' }}>
                {currentUser?.firstName ? currentUser.firstName[0] : 'J'}
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'John Doe'}
              </h3>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>
                {currentUser?.userId || 'USR-102938'}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {currentUser?.department || 'BCA'} | {currentUser?.year || '2'}nd Year - {currentUser?.className || 'A'}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Roll No. {currentUser?.rollNumber || '21BCA102'}
              </p>
            </div>

            <div className="attendance-qr-container">
              {activeRegistration?.attendanceQrGenerated && activeRegistration?.attendanceQrToken ? (
                <>
                  <div
                    className="cyber-qr-stand"
                    style={{ padding: 8, cursor: 'pointer' }}
                    title="Click to view QR in Fullscreen"
                    onClick={() =>
                      setFullScreenQR({
                        value: activeRegistration.attendanceQrToken,
                        title: `Attendance QR — ${currentUser?.firstName} ${currentUser?.lastName || ''}`,
                        subtitle: `${currentUser?.department} | Roll: ${currentUser?.rollNumber}`,
                        tokenLabel: `Token: ${activeRegistration.attendanceQrToken}`,
                      })
                    }
                  >
                    <QRCode value={activeRegistration.attendanceQrToken} size={90} />
                  </div>
                  <p style={{ fontSize: '0.74rem', fontWeight: 700, marginTop: 4 }}>Attendance QR</p>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>🔍 Fullscreen</span>
                </>
              ) : (
                <div style={{ padding: '14px 10px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px dashed var(--border-color)', textAlign: 'center', width: '110px' }}>
                  <p style={{ color: '#F59E0B', fontSize: '0.72rem', fontWeight: 700 }}>No QR</p>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Click Generate</span>
                </div>
              )}
            </div>
          </div>

          <div className="attendance-disclaimer">
            <HiInformationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
            <span>Only Event Members and Super Admin can scan this QR and mark attendance.</span>
          </div>
        </div>

        {/* Right: Attendance History Table */}
        <div className="card">
          <div className="card-header">
            <h2>Attendance History</h2>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((att) => (
                    <tr key={att._id}>
                      <td>{new Date(att.processedAt || att.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>{new Date(att.processedAt || att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`badge ${att.status === 'ACCEPTED' ? 'badge-success' : 'badge-danger'}`}>
                          {att.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        By: {att.processedByRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Event Member'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>
                      No attendance verified for this event yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Pass Modal */}
      <FullScreenQRModal
        isOpen={!!fullScreenQR}
        onClose={() => setFullScreenQR(null)}
        {...fullScreenQR}
      />
    </DashboardLayout>
  );
};

export default AdminAttendance;
