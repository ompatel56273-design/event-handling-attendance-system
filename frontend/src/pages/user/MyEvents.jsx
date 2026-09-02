import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CertificateModal from '../../components/common/CertificateModal';
import FeedbackModal from '../../components/common/FeedbackModal';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import QRCode from 'react-qr-code';
import {
  HiCalendar, HiLocationMarker, HiClock, HiQrcode,
  HiAcademicCap, HiChatAlt2, HiFilter, HiX, HiArrowsExpand
} from 'react-icons/hi';
import { FaQrcode, FaCertificate, FaCommentDots } from 'react-icons/fa';

const DEFAULT_MY_REGISTRATIONS = [
  {
    _id: 'reg1',
    event: { _id: 'e3', name: 'UI/UX Design Challenge', location: 'Lab 3', date: '2026-07-10', startTime: '09:30 AM', endTime: '01:30 PM', image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=500' },
    status: 'REGISTERED',
    isAttended: false,
    qrToken: 'ATT-EVT-1003-USR-102938',
  },
  {
    _id: 'reg2',
    event: { _id: 'e4', name: 'Code Carnival 2.0', location: 'Seminar Hall', date: '2026-07-25', startTime: '09:00 AM', endTime: '05:00 PM', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500' },
    status: 'ATTENDED',
    isAttended: true,
    qrToken: 'ATT-EVT-1004-USR-102938',
  },
];

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState(null);
  const [fullScreenQR, setFullScreenQR] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const [eventsRes, certsRes] = await Promise.allSettled([
        api.get('/users/me/events'),
        api.get('/certificates/my-certificates'),
      ]);

      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0) {
        setRegistrations(eventsRes.value.data);
      } else {
        setRegistrations(DEFAULT_MY_REGISTRATIONS);
      }

      if (certsRes.status === 'fulfilled' && Array.isArray(certsRes.value.data)) {
        setCertificates(certsRes.value.data);
      }
    } catch (err) {
      console.error(err);
      setRegistrations(DEFAULT_MY_REGISTRATIONS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header (Matching Student/4.png) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            My Events & Passes
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Track your registered event passes, live attendance, scores, and verified certificates
          </p>
        </div>

        <button
          style={{
            height: 42,
            padding: '0 16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
          }}
        >
          <HiFilter /> Filters
        </button>
      </div>

      {/* List of Registered Event Passes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {registrations.map((reg, idx) => {
          const evt = reg.event || {};
          const isAttended = reg.isAttended || reg.status === 'ATTENDED';
          const qrVal = reg.qrToken || `ATT-PASS-${evt._id || idx}-USR-102938`;

          return (
            <div
              key={reg._id || idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 22,
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              {/* Event Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 320 }}>
                <img
                  src={evt.image?.url || evt.image || DEFAULT_MY_REGISTRATIONS[0].event.image}
                  alt={evt.name}
                  style={{ width: 120, height: 85, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
                />

                <div>
                  {/* Scan Status Pill */}
                  <span
                    style={{
                      background: isAttended ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: isAttended ? '#10B981' : '#F59E0B',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAttended ? '#10B981' : '#F59E0B' }} />
                    {isAttended ? 'Attendance Verified' : 'Attendance Not Scanned Yet'}
                  </span>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {evt.name || 'Event Title'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiCalendar style={{ color: 'var(--primary)' }} />
                      {evt.date ? new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 July 2026'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiClock style={{ color: 'var(--primary)' }} />
                      {evt.startTime || '09:30 AM'} - {evt.endTime || '01:30 PM'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiLocationMarker style={{ color: '#EF4444' }} />
                      {evt.location || 'Lab 3'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Action Buttons (Exact Student/4.png Layout) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedPass(reg)}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    gap: 6,
                  }}
                >
                  <HiQrcode /> View Pass QR
                </button>

                <button
                  onClick={() => setSelectedCertificate({ eventName: evt.name, studentName: 'John Doe', certId: `CRT-${idx + 101}`, date: '2026-07-10' })}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FaCertificate style={{ color: '#F59E0B' }} /> Certificate
                </button>

                <button
                  onClick={() => setSelectedFeedbackEvent(evt)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FaCommentDots style={{ color: 'var(--primary)' }} /> Feedback
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pass QR Modal */}
      {selectedPass && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedPass(null)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Event Attendance Pass</h3>
              <button className="modal-close-icon-btn" onClick={() => setSelectedPass(null)}><HiX /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 18 }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {selectedPass.event?.name}
              </h4>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                📍 {selectedPass.event?.location} • 📅 {selectedPass.event?.date ? new Date(selectedPass.event.date).toLocaleDateString() : 'Active Pass'}
              </span>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  border: '2px solid var(--primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  marginBottom: 16,
                }}
              >
                <QRCode value={selectedPass.qrToken || 'ATT-PASS-102938'} size={180} />
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>
                Token: {selectedPass.qrToken || 'ATT-PASS-102938'}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Present this QR code to the coordinator at the entrance
              </span>

              <button
                onClick={() => {
                  setFullScreenQR({
                    value: selectedPass.qrToken || 'ATT-PASS-102938',
                    title: selectedPass.event?.name || 'Event Pass',
                    subtitle: `${selectedPass.event?.location || 'Campus'} • Entry Token`,
                    tokenLabel: `Token: ${selectedPass.qrToken || 'ATT-PASS-102938'}`,
                  });
                  setSelectedPass(null);
                }}
                className="btn btn-primary"
                style={{ marginTop: 18, width: '100%', borderRadius: 12, padding: '10px' }}
              >
                <HiArrowsExpand /> Open in Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}

      {/* Feedback Modal */}
      {selectedFeedbackEvent && (
        <FeedbackModal
          isOpen={!!selectedFeedbackEvent}
          onClose={() => setSelectedFeedbackEvent(null)}
          event={selectedFeedbackEvent}
        />
      )}

      {/* Fullscreen QR Modal */}
      <FullScreenQRModal
        isOpen={!!fullScreenQR}
        onClose={() => setFullScreenQR(null)}
        {...fullScreenQR}
      />
    </DashboardLayout>
  );
};

export default MyEvents;
