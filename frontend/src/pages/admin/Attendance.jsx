import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRCode from 'react-qr-code';
import LiveQRScanner from '../../components/common/LiveQRScanner';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import ExportDropdown from '../../components/common/ExportDropdown';
import {
  HiCheckCircle, HiXCircle, HiInformationCircle,
  HiCamera, HiRefresh, HiLocationMarker, HiCalendar,
  HiDownload, HiFilter, HiArrowsExpand, HiX
} from 'react-icons/hi';
import { FaIdBadge } from 'react-icons/fa';

const AdminAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [participants, setParticipants] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [fullScreenQR, setFullScreenQR] = useState(null);

  // Scanner Modal
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events');
      const evts = Array.isArray(res.data) && res.data.length > 0 ? res.data : [
        { _id: 'e3', eventId: 'EVT-1003', name: 'Poster Presentation', location: 'Auditorium', date: '2026-06-18' },
        { _id: 'e4', eventId: 'EVT-1004', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25' },
      ];
      setEvents(evts);
      setSelectedEvent(evts[0]._id);
      loadEventDetails(evts[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEventDetails = async (eventId) => {
    if (!eventId) return;
    try {
      const [partsRes, attRes] = await Promise.allSettled([
        api.get(`/admin/events/${eventId}/participants`),
        api.get(`/admin/attendance/event/${eventId}`),
      ]);

      const parts = partsRes.status === 'fulfilled' && Array.isArray(partsRes.value.data) && partsRes.value.data.length > 0
        ? partsRes.value.data
        : [
            {
              _id: 'reg-charlie',
              student: { firstName: 'Charlie', lastName: 'Brown', userId: 'USR-102941', department: 'BCA', year: 2, className: 'C', rollNumber: '21BCA088' },
              qrToken: 'ATT-CAMPUS-POSTER-2026-941',
              status: 'REGISTERED',
            },
          ];

      setParticipants(parts);
      const atts = attRes.status === 'fulfilled' && Array.isArray(attRes.value.data) ? attRes.value.data : [];
      setAttendanceHistory(atts);

      if (parts.length > 0) {
        setSelectedUser(parts[0]._id);
        setActiveRegistration(parts[0]);
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

  const handleLiveCameraScan = async (token) => {
    if (!token) return;
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/attendance/scan', { token: token.trim() });
      setScanResult(res.data);
      loadEventDetails(selectedEvent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid or expired Attendance QR code.' });
    }
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
      setActiveRegistration(prev => ({ ...prev, qrToken: res.data.qrToken }));
      setMsg({ type: 'success', text: 'Attendance QR generated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to generate QR.' });
    } finally {
      setGenerating(false);
    }
  };

  const currentEvent = events.find(e => e._id === selectedEvent) || events[0] || {};
  const currentStudent = activeRegistration?.student || activeRegistration?.user || {};
  const studentName = `${currentStudent.firstName || 'Charlie'} ${currentStudent.lastName || 'Brown'}`.trim();
  const studentInitials = (studentName[0] || 'C').toUpperCase();
  const qrValue = activeRegistration?.qrToken || `ATT-EVENT-${currentEvent.eventId || '2026'}-${currentStudent.userId || '102941'}`;

  // Export Data normalization
  const exportHeaders = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'userId', label: 'User ID' },
    { key: 'department', label: 'Department' },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'eventName', label: 'Event Name' },
    { key: 'status', label: 'Attendance Status' },
    { key: 'verifiedDate', label: 'Verified Date / Time' },
  ];

  const exportRows = participants.map((p) => {
    const s = p.student || p.user || {};
    return {
      studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
      userId: s.userId || '—',
      department: s.department || 'BCA',
      rollNumber: s.rollNumber || '—',
      eventName: currentEvent.name || 'Campus Event',
      status: p.status === 'ATTENDED' ? 'VERIFIED' : 'PENDING',
      verifiedDate: p.markedAt ? new Date(p.markedAt).toLocaleString('en-GB') : 'Not marked',
    };
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Attendance Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Issue event attendance QRs, scan credentials, and export records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Multi-Format Export Dropdown */}
          <ExportDropdown
            title={`Attendance — ${currentEvent.name || 'Event'}`}
            headers={exportHeaders}
            data={exportRows}
            filename={`Attendance_${(currentEvent.name || 'Event').replace(/\s+/g, '_')}`}
            showImport={false}
          />

          <button
            className="btn btn-secondary"
            onClick={() => setScanMode(true)}
            style={{ borderRadius: 12, padding: '10px 18px', gap: 8 }}
          >
            <HiCamera /> Open Scanner
          </button>

          <button
            className="btn btn-primary"
            onClick={handleGenerateQR}
            disabled={generating}
            style={{ borderRadius: 12, padding: '10px 22px', fontWeight: 700 }}
          >
            {generating ? 'Generating...' : 'Generate Attendance QR'}
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Event & User Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
            Select Event
          </label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '0 16px', height: 48 }}>
            <HiCalendar style={{ color: 'var(--primary)', fontSize: '1.2rem', marginRight: 10 }} />
            <select
              value={selectedEvent}
              onChange={handleEventChange}
              style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
            >
              {events.map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
            Select User (Optional)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '0 16px', height: 48 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginRight: 10 }}>👤</span>
            <select
              value={selectedUser}
              onChange={handleUserChange}
              style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
            >
              {participants.map((p) => {
                const s = p.student || p.user || {};
                const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                const id = s.userId || p._id;
                return (
                  <option key={p._id} value={p._id}>{name} ({id})</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 2 Column Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1.25fr',
          gap: 26,
        }}
      >
        {/* Left: Attendance E-Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 22,
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 14px', borderRadius: 20 }}>
              Attendance E-Card
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <HiCalendar />
              {currentEvent.date ? new Date(currentEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '18 June 2026'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {currentEvent.name || 'Poster Presentation'}
          </h2>

          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <HiLocationMarker style={{ color: '#EF4444' }} /> {currentEvent.location || 'Auditorium'}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                }}
              >
                {studentInitials}
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                  {studentName}
                </h4>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
                  {currentStudent.userId || 'USR-102941'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {currentStudent.department || 'BCA'} | {currentStudent.year ? `${currentStudent.year}nd Year` : '2nd Year'} - {currentStudent.className || 'C'}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Roll No. {currentStudent.rollNumber || '21BCA088'}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                onClick={() =>
                  setFullScreenQR({
                    value: qrValue,
                    title: `${studentName} — ${currentEvent.name}`,
                    subtitle: `${currentEvent.location} • Attendance Token`,
                    tokenLabel: `Token: ${qrValue}`,
                  })
                }
                title="Click to view QR in Fullscreen"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: 10,
                  border: '2px solid var(--primary)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                <QRCode value={qrValue} size={90} />
              </div>
              <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
                Attendance QR
              </span>
              <span
                onClick={() =>
                  setFullScreenQR({
                    value: qrValue,
                    title: `${studentName} — ${currentEvent.name}`,
                    subtitle: `${currentEvent.location} • Attendance Token`,
                    tokenLabel: `Token: ${qrValue}`,
                  })
                }
                style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}
              >
                <HiArrowsExpand /> Fullscreen
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-app)', borderRadius: 14, border: '1px solid var(--border-color)', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <HiInformationCircle style={{ color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0 }} />
            <span>Only Event Members and Super Admin can scan this QR and mark attendance.</span>
          </div>
        </div>

        {/* Right: Attendance History */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 22,
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>🕒</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Attendance History
            </h3>
          </div>

          {attendanceHistory.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: 100,
                  height: 120,
                  borderRadius: 16,
                  background: 'var(--bg-app)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: 18,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 8 }}>
                  <FaIdBadge />
                </div>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-color)', marginBottom: 4 }} />
                <div style={{ width: 28, height: 4, borderRadius: 2, background: 'var(--border-color)' }} />
                <div style={{ position: 'absolute', bottom: -10, right: -10, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  🕒
                </div>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                No attendance verified
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                This student's attendance for this event is not marked yet.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>DATE</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>TIME</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>STATUS</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>BY</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((att, idx) => (
                    <tr key={att._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {new Date(att.markedAt || att.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {new Date(att.markedAt || att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 12 }}>
                          VERIFIED
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                        {att.markedBy?.name || 'Super Admin'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Live Scanner Modal */}
      {scanMode && (
        <div className="modal-backdrop-overlay" onClick={() => setScanMode(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Camera Attendance Scanner</h3>
              <button className="modal-close-icon-btn" onClick={() => setScanMode(false)}><HiX /></button>
            </div>
            <div style={{ marginTop: 20 }}>
              <LiveQRScanner onScanSuccess={handleLiveCameraScan} />
            </div>
          </div>
        </div>
      )}

      {/* FullScreen QR Modal */}
      <FullScreenQRModal
        isOpen={!!fullScreenQR}
        onClose={() => setFullScreenQR(null)}
        {...fullScreenQR}
      />
    </DashboardLayout>
  );
};

export default AdminAttendance;
