import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CertificateModal from '../../components/common/CertificateModal';
import FeedbackModal from '../../components/common/FeedbackModal';
import QRCode from 'react-qr-code';
import { HiCalendar, HiLocationMarker, HiInformationCircle, HiAcademicCap, HiStar } from 'react-icons/hi';

const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedECard, setSelectedECard] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState(null);

  useEffect(() => {
    fetchMyEventsAndCerts();
  }, []);

  const fetchMyEventsAndCerts = async () => {
    try {
      const [eventsRes, certsRes] = await Promise.allSettled([
        api.get('/users/me/events'),
        api.get('/certificates/my-certificates'),
      ]);

      if (eventsRes.status === 'fulfilled') setRegistrations(eventsRes.value.data);
      if (certsRes.status === 'fulfilled') setCertificates(certsRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewECard = async (eventId) => {
    try {
      const res = await api.get(`/users/me/events/${eventId}/e-card`);
      setSelectedECard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCertificateForEvent = async (eventId) => {
    // Find certificate in state or re-fetch
    const cert = certificates.find((c) => (c.eventId?._id || c.eventId) === eventId);
    if (cert) {
      setSelectedCertificate(cert);
    } else {
      try {
        const res = await api.get('/certificates/my-certificates');
        setCertificates(res.data);
        const newlyFound = res.data.find((c) => (c.eventId?._id || c.eventId) === eventId);
        if (newlyFound) setSelectedCertificate(newlyFound);
      } catch (err) {
        console.error('Failed to fetch certificate:', err);
      }
    }
  };

  return (
    <DashboardLayout
      title="My Events & Certificates"
      subtitle="Track your registered event passes, live attendance, scores, and verified certificates"
    >
      {/* Attendance E-Card Modal Matching Master UI */}
      {selectedECard && (
        <div className="modal-overlay" onClick={() => setSelectedECard(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>🎟️ Event Attendance Pass</h2>
              <button className="modal-close" onClick={() => setSelectedECard(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 800 }}>{selectedECard.event?.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(selectedECard.event?.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {selectedECard.event?.location || 'Campus Hall'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '14px', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-qr)' }}>
                  <QRCode value={selectedECard.registration?.attendanceQrToken || selectedECard.registration?._id} size={150} />
                </div>
                <span className="qr-label" style={{ fontSize: '0.85rem' }}>Attendance Check-in QR</span>

                {/* 6-Digit PIN Code Fallback */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '6px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Backup PIN:</span>
                  <strong style={{ fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--primary)' }}>
                    {selectedECard.registration?.checkInPin || selectedECard.registration?._id?.slice(-6)?.toUpperCase() || '849201'}
                  </strong>
                </div>
              </div>

              <div className="attendance-disclaimer" style={{ marginTop: 20 }}>
                <HiInformationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                <span>Present this QR code to Event Members at the entrance scanner to mark attendance.</span>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedECard(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Events Joined Yet</h3>
          <p>Browse our upcoming events and join to see them here.</p>
          <Link to="/user/events" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {registrations.map((reg, idx) => {
            const eventName = reg.eventId?.name || 'College Event';
            const eventDate = reg.eventId?.date
              ? new Date(reg.eventId.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Upcoming';
            const isAttended = reg.attendanceStatus === 'ACCEPTED' || reg.status === 'ATTENDED';
            const isDeclined = reg.attendanceStatus === 'DECLINED' || reg.status === 'ABSENT';

            return (
              <div key={reg._id} className="event-row-card">
                <img
                  src={reg.eventId?.image?.url || eventThumbnails[idx % eventThumbnails.length]}
                  alt={eventName}
                  className="event-row-thumb"
                />

                <div className="event-row-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3>{eventName}</h3>
                    <span className="badge badge-success">Registered</span>
                  </div>
                  <div className="event-row-tags">
                    <span><HiCalendar style={{ color: 'var(--primary)' }} /> {eventDate}</span>
                    <span><HiLocationMarker style={{ color: '#0EA5E9' }} /> {reg.eventId?.location || 'Campus'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.78rem' }}>
                    <span>
                      <strong>Attendance:</strong>{' '}
                      <span className={`badge ${isAttended ? 'badge-success' : isDeclined ? 'badge-danger' : 'badge-warning'}`}>
                        {isAttended ? '✓ Verified' : isDeclined ? 'Declined' : 'Pending Scan'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="event-row-action" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => viewECard(reg.eventId?._id)}
                  >
                    View Pass QR
                  </button>

                  {isAttended && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => openCertificateForEvent(reg.eventId?._id)}
                      >
                        <HiAcademicCap style={{ fontSize: '1.1rem' }} /> Certificate
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#F59E0B' }}
                        onClick={() => setSelectedFeedbackEvent(reg.eventId)}
                      >
                        <HiStar style={{ fontSize: '1.1rem' }} /> Give Feedback
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedFeedbackEvent && (
        <FeedbackModal
          event={selectedFeedbackEvent}
          onClose={() => setSelectedFeedbackEvent(null)}
          onSubmitted={() => fetchMyEventsAndCerts()}
        />
      )}
    </DashboardLayout>
  );
};

export default MyEvents;
