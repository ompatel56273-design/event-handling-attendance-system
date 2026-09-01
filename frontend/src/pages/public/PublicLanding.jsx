import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import {
  HiCalendar, HiLocationMarker, HiSearch,
  HiSun, HiMoon, HiArrowRight
} from 'react-icons/hi';

const PublicLanding = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certSearch, setCertSearch] = useState('');
  const [fullScreenQR, setFullScreenQR] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (Array.isArray(res.data)) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCert = (e) => {
    e.preventDefault();
    if (certSearch.trim()) {
      navigate(`/verify-certificate/${certSearch.trim().toUpperCase()}`);
    }
  };

  const categories = ['All', 'Competitions', 'Hackathons', 'Workshops', 'Concerts', 'Festivals', 'Clubs'];

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      categoryFilter === 'All'
        ? true
        : ev.name?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
          ev.description?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
          (categoryFilter === 'Competitions' && ev.status === 'REGISTRATION_OPEN');

    const matchesSearch =
      !searchQuery.trim() ||
      ev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.eventId?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const isDark = mode === 'dark';

  // Exact Colors matching 00_first_page_landing_ui_concept.jpg
  const brandBlue = '#0066FF';
  const bgMain = isDark ? '#080C16' : '#FFFFFF';
  const bgCard = isDark ? '#111726' : '#FFFFFF';
  const textHead = isDark ? '#F8FAFC' : '#172B4D';
  const textBody = isDark ? '#94A3B8' : '#5E6C84';
  const borderColor = isDark ? '#1E293B' : '#E6ECF5';
  const chipBg = isDark ? 'rgba(0, 102, 255, 0.15)' : '#EBF3FF';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgMain,
        color: textHead,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'background 200ms ease, color 200ms ease',
        position: 'relative',
      }}
    >
      {/* Subtle Geometric Background Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '600px',
          background: isDark
            ? 'radial-gradient(ellipse at 50% 0%, rgba(0, 102, 255, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(0, 102, 255, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* =========================================================================
          1. TOP NAVBAR (CAMPUSFLOW LOGO, LINKS, SIGN UP PILL)
          ========================================================================= */}
      <nav
        style={{
          borderBottom: `1px solid ${borderColor}`,
          background: isDark ? 'rgba(8, 12, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: brandBlue,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
              }}
            >
              C
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: textHead, letterSpacing: '-0.3px' }}>
              CampusFlow
            </span>
          </Link>

          {/* Center Links */}
          <div
            className="landing-desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: '0.94rem', fontWeight: 500 }}
          >
            <a href="#events" style={{ color: textHead, textDecoration: 'none' }}>Events</a>
            <a href="#features" style={{ color: textBody, textDecoration: 'none' }}>Features</a>
            <a href="#verify" style={{ color: textBody, textDecoration: 'none' }}>Verify</a>
          </div>

          {/* Right Action Elements */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Mode Switcher */}
            <button
              onClick={toggleMode}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: `1px solid ${borderColor}`,
                background: bgCard,
                color: textHead,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.1rem',
              }}
            >
              {isDark ? <HiSun style={{ color: '#F59E0B' }} /> : <HiMoon style={{ color: brandBlue }} />}
            </button>

            {isAuthenticated ? (
              <Link
                to={getDashboardPath(role)}
                style={{
                  height: 40,
                  padding: '0 22px',
                  borderRadius: 20,
                  background: brandBlue,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Dashboard <HiArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: textHead,
                    fontWeight: 600,
                    fontSize: '0.94rem',
                    textDecoration: 'none',
                    padding: '8px 12px',
                  }}
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  style={{
                    height: 40,
                    padding: '0 24px',
                    borderRadius: 20,
                    background: brandBlue,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.94rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. HERO SECTION (CAMPUS EVENTS 2026 BADGE, HEADLINE, 2 PILL BUTTONS)
          ========================================================================= */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '65px 24px 35px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: 20,
            background: chipBg,
            color: brandBlue,
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Campus Events 2026
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.16,
            letterSpacing: '-1.4px',
            maxWidth: '860px',
            margin: '0 auto 18px',
            color: textHead,
          }}
        >
          Discover and attend college events with digital QR passes
        </h1>

        <p
          style={{
            fontSize: '1.12rem',
            color: textBody,
            maxWidth: '660px',
            margin: '0 auto 34px',
            lineHeight: 1.6,
          }}
        >
          Find the latest campus happenings, register instantly, and manage all your digital passes in one place.
        </p>

        {/* 2 Pill Buttons (Browse Events + Student Sign In) */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 46 }}>
          <a
            href="#events"
            style={{
              padding: '12px 30px',
              borderRadius: 24,
              background: brandBlue,
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.98rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Browse Events
          </a>

          <Link
            to="/login"
            style={{
              padding: '12px 28px',
              borderRadius: 24,
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: `1.5px solid ${borderColor}`,
              color: textHead,
              fontWeight: 600,
              fontSize: '0.98rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Student Sign In
          </Link>
        </div>

        {/* Single Integrated Search Input Box */}
        <div style={{ maxWidth: '640px', margin: '0 auto 22px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: isDark ? '#111726' : '#FFFFFF',
              border: `1.5px solid ${borderColor}`,
              borderRadius: 14,
              padding: '6px 18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <HiSearch style={{ color: textBody, fontSize: '1.25rem', marginRight: 10 }} />
            <input
              type="text"
              placeholder="Search events, competitions, workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: textHead,
                fontSize: '0.94rem',
                outline: 'none',
                padding: '8px 0',
              }}
            />
          </div>
        </div>

        {/* Category Pill Chips */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 20,
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  border: `1px solid ${isSelected ? brandBlue : borderColor}`,
                  cursor: 'pointer',
                  background: isSelected ? chipBg : bgCard,
                  color: isSelected ? brandBlue : textBody,
                  transition: 'all 150ms ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. 3-COLUMN EVENT CARDS (EXACT DESIGN MATCH)
          ========================================================================= */}
      <section
        id="events"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              background: bgCard,
              borderRadius: 18,
              border: `1px solid ${borderColor}`,
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>📅</span>
            <h3 style={{ marginTop: 10, fontSize: '1.15rem' }}>No events found</h3>
            <p style={{ fontSize: '0.88rem', color: textBody }}>
              Try searching with different keywords or select "All".
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {filteredEvents.map((event) => {
              const banner =
                event.image?.url ||
                'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60';
              const isOpen = event.status === 'REGISTRATION_OPEN';

              return (
                <div
                  key={event._id}
                  style={{
                    background: bgCard,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isDark ? 'none' : '0 4px 18px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Photo Container */}
                  <div style={{ height: 185, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={banner}
                      alt={event.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Date & Location Row (Pill + Pin) */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: chipBg,
                          color: brandBlue,
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <HiCalendar />
                        {new Date(event.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })} • {event.startTime || '9:00 AM'}
                      </span>

                      <span
                        style={{
                          fontSize: '0.76rem',
                          color: textBody,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <HiLocationMarker style={{ color: '#EF4444' }} />
                        {event.location || 'Campus Hall'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: textHead }}>
                      {event.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.86rem',
                        color: textBody,
                        lineHeight: 1.5,
                        margin: '0 0 20px 0',
                        flex: 1,
                      }}
                    >
                      {event.description
                        ? event.description.length > 95
                          ? `${event.description.slice(0, 95)}...`
                          : event.description
                        : 'Official college event with live attendance and digital evaluation.'}
                    </p>

                    {/* Dual Action Buttons: View Details (White Outline) + Register (Solid Blue) */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 20,
                          background: isDark ? 'transparent' : '#FFFFFF',
                          border: `1.5px solid ${borderColor}`,
                          color: textHead,
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Details
                      </button>

                      <Link
                        to={isAuthenticated ? '/user/events' : (isOpen ? '/signup?redirect=/user/events' : '/login')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 20,
                          background: isOpen ? brandBlue : '#64748B',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        {isOpen ? (isAuthenticated ? 'Register' : 'Register') : 'View Pass'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. EVENT DETAILS MODAL
          ========================================================================= */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, background: bgCard, border: `1px solid ${borderColor}` }}>
            <div className="modal-header">
              <div>
                <h2>{selectedEvent.name}</h2>
                <p style={{ fontSize: '0.78rem', color: textBody }}>Event ID: {selectedEvent.eventId}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.84rem', marginBottom: 16 }}>
                <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Time:</strong> {selectedEvent.startTime || '10:00 AM'} - {selectedEvent.endTime || '04:00 PM'}</div>
                <div><strong>Location:</strong> {selectedEvent.location}</div>
                <div><strong>Capacity:</strong> {selectedEvent.participantCount || 0} / {selectedEvent.maxParticipants}</div>
              </div>

              {selectedEvent.description && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ marginBottom: 4, fontSize: '0.9rem' }}>Description</h4>
                  <p style={{ fontSize: '0.84rem', color: textBody, lineHeight: 1.5 }}>{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.rules && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ marginBottom: 4, fontSize: '0.9rem' }}>Rules</h4>
                  <p style={{ fontSize: '0.84rem', color: textBody, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{selectedEvent.rules}</p>
                </div>
              )}

              {selectedEvent.markingCriteria?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 6, fontSize: '0.9rem' }}>Marking Criteria</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedEvent.markingCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
                          borderRadius: 6,
                          fontSize: '0.82rem',
                        }}
                      >
                        <span>{crit.name}</span>
                        <strong>Max {crit.maxMarks} pts</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
              <Link
                to={isAuthenticated ? '/user/events' : '/signup'}
                className="btn btn-primary"
                onClick={() => setSelectedEvent(null)}
              >
                {isAuthenticated ? 'Proceed to Register' : 'Sign Up to Register'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. CERTIFICATE VERIFICATION
          ========================================================================= */}
      <section
        id="verify"
        style={{
          borderTop: `1px solid ${borderColor}`,
          background: isDark ? '#0C111E' : '#F8FAFC',
          padding: '60px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', color: textHead }}>
            Verify a Certificate
          </h2>
          <p style={{ fontSize: '0.88rem', color: textBody, margin: '0 0 20px 0' }}>
            Enter a student certificate ID to verify authenticity.
          </p>

          <form onSubmit={handleVerifyCert} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="e.g. CERT-EVT-2026-XXXX"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              style={{
                flex: 1,
                height: 44,
                padding: '0 16px',
                borderRadius: 12,
                background: bgCard,
                border: `1.5px solid ${borderColor}`,
                color: textHead,
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                height: 44,
                padding: '0 24px',
                borderRadius: 12,
                background: brandBlue,
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Verify
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: `1px solid ${borderColor}`,
          padding: '28px 24px',
          background: bgCard,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.86rem',
            color: textBody,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, color: textHead }}>⚡ CampusFlow</span>
            <span>© 2026 Campus Event Management.</span>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/login" style={{ color: textBody, textDecoration: 'none' }}>Log in</Link>
            <Link to="/signup" style={{ color: textBody, textDecoration: 'none' }}>Sign Up</Link>
            <a href="#events" style={{ color: textBody, textDecoration: 'none' }}>Events</a>
          </div>
        </div>
      </footer>

      {/* Fullscreen QR Modal */}
      <FullScreenQRModal
        isOpen={!!fullScreenQR}
        onClose={() => setFullScreenQR(null)}
        {...fullScreenQR}
      />
    </div>
  );
};

export default PublicLanding;
