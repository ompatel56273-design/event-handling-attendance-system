import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRCode from 'react-qr-code';
import { HiCalendar, HiClock, HiLocationMarker, HiInformationCircle } from 'react-icons/hi';

const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedECard, setSelectedECard] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await api.get('/users/me/events');
      setRegistrations(res.data);
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

  return (
    <DashboardLayout
      title="My Events"
      subtitle="Track your registered events, attendance, and scores"
    >
      {/* Attendance E-Card Modal Matching Master UI */}
      {selectedECard && (
        <div className="modal-overlay" onClick={() => setSelectedECard(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Event Attendance E-Card</h2>
              <button className="modal-close" onClick={() => setSelectedECard(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="attendance-ecard-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
                <div className="attendance-ecard-header">
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 4 }}>Attendance E-Card</span>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedECard.event?.name}</h3>
                  </div>
                  <span className="badge badge-info">{new Date(selectedECard.event?.date).toLocaleDateString()}</span>
                </div>

                <div className="attendance-ecard-body">
                  {selectedECard.user?.profileImage?.url ? (
                    <img
                      src={selectedECard.user.profileImage.url}
                      alt={selectedECard.user.firstName}
                      className="identity-hero-avatar"
                      style={{ width: 90, height: 90 }}
                    />
                  ) : (
                    <div className="identity-hero-avatar-placeholder" style={{ width: 90, height: 90, fontSize: '1.8rem' }}>
                      {selectedECard.user?.firstName ? selectedECard.user.firstName[0] : 'U'}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {selectedECard.user?.firstName} {selectedECard.user?.lastName}
                    </h3>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                      {selectedECard.user?.userId}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {selectedECard.user?.department} | {selectedECard.user?.year}nd Year - {selectedECard.user?.className}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Roll No. {selectedECard.user?.rollNumber}
                    </p>
                  </div>

                  <div className="attendance-qr-container">
                    {selectedECard.registration?.attendanceQrGenerated && selectedECard.registration?.attendanceQrToken ? (
                      <>
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '6px' }}>
                          <QRCode value={selectedECard.registration.attendanceQrToken} size={110} />
                        </div>
                        <p>Attendance QR</p>
                        <span style={{ fontSize: '0.58rem', color: '#94A3B8' }}>(For this event only)</span>
                      </>
                    ) : (
                      <div style={{ padding: '16px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center', width: '130px' }}>
                        <p style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 600 }}>QR Pending</p>
                        <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Generated by Admin at event</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="attendance-disclaimer">
                  <HiInformationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>Only Event Members and Super Admin can scan this QR and mark attendance.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            const attendanceStatus = reg.status === 'ATTENDED' ? 'Accepted' : reg.status === 'ABSENT' ? 'Declined' : 'Pending';

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
                    <span><HiCalendar style={{ color: '#5C33CF' }} /> {eventDate}</span>
                    <span><HiLocationMarker style={{ color: '#10B981' }} /> {reg.eventId?.location || 'Campus'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.78rem' }}>
                    <span>
                      <strong>Attendance:</strong>{' '}
                      <span className={`badge ${attendanceStatus === 'Accepted' ? 'badge-success' : attendanceStatus === 'Declined' ? 'badge-danger' : 'badge-warning'}`}>
                        {attendanceStatus}
                      </span>
                    </span>
                    <span>
                      <strong>Marks:</strong>{' '}
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {reg.status === 'ATTENDED' ? '80 / 100' : '- / 100'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="event-row-action">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => viewECard(reg.eventId?._id)}
                  >
                    View E-Card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyEvents;
