import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import QRCode from 'react-qr-code';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import {
  HiCalendar, HiLocationMarker, HiSearch,
  HiArrowRight, HiUser, HiCheck,
  HiTicket, HiUsers, HiShieldCheck, HiSparkles,
  HiChevronDown, HiChevronRight, HiPaperAirplane
} from 'react-icons/hi';
import {
  FaTrophy, FaWrench, FaCode, FaMusic, FaUsers,
  FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaFacebook, FaMoon, FaSun, FaUniversity
} from 'react-icons/fa';

const DEFAULT_FEATURED_EVENTS = [
  {
    _id: 'default-1',
    eventId: 'EVT-2026-001',
    name: 'Code Carnival 2.0',
    description: 'A coding competition to test your algorithms, debugging speed, and data structure skills.',
    date: '2026-05-25',
    startTime: '10:00 AM',
    location: 'Seminar Hall',
    isPopular: true,
    status: 'REGISTRATION_OPEN',
    image: {
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 42,
    maxParticipants: 60,
  },
  {
    _id: 'default-2',
    eventId: 'EVT-2026-002',
    name: 'UI/UX Design Challenge',
    description: 'Design the future with creativity and product innovation using modern design tools.',
    date: '2026-06-10',
    startTime: '09:00 AM',
    location: 'Lab 3',
    status: 'REGISTRATION_OPEN',
    image: {
      url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 28,
    maxParticipants: 40,
  },
  {
    _id: 'default-3',
    eventId: 'EVT-2026-003',
    name: 'Poster Presentation',
    description: 'Showcase your technical and research ideas through powerful visual posters.',
    date: '2026-06-24',
    startTime: '11:00 AM',
    location: 'Auditorium',
    status: 'COMPLETED',
    image: {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 85,
    maxParticipants: 100,
  },
  {
    _id: 'default-4',
    eventId: 'EVT-2026-004',
    name: 'Debate Competition',
    description: 'Battle of wits on hot topics in AI, ethics, and future technology.',
    date: '2026-06-30',
    startTime: '02:00 PM',
    location: 'Conference Hall',
    status: 'COMPLETED',
    image: {
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 30,
    maxParticipants: 32,
  },
];

const PublicLanding = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState(DEFAULT_FEATURED_EVENTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certSearch, setCertSearch] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState(false);
  const [fullScreenQR, setFullScreenQR] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(DEFAULT_FEATURED_EVENTS);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents(DEFAULT_FEATURED_EVENTS);
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

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterMsg(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterMsg(false), 3000);
    }
  };

  const categories = [
    { id: 'All', name: 'All', icon: <HiSparkles /> },
    { id: 'Competitions', name: 'Competitions', icon: <FaTrophy /> },
    { id: 'Workshops', name: 'Workshops', icon: <FaWrench /> },
    { id: 'Hackathons', name: 'Hackathons', icon: <FaCode /> },
    { id: 'Concerts', name: 'Concerts', icon: <FaMusic /> },
    { id: 'Festivals', name: 'Festivals', icon: <HiSparkles /> },
    { id: 'Clubs', name: 'Clubs', icon: <FaUsers /> },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      activeCategory === 'All'
        ? true
        : ev.name?.toLowerCase().includes(activeCategory.toLowerCase()) ||
          ev.description?.toLowerCase().includes(activeCategory.toLowerCase()) ||
          (activeCategory === 'Competitions' && ev.status === 'REGISTRATION_OPEN');

    const matchesSearch =
      !searchQuery.trim() ||
      ev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.eventId?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const isDark = mode === 'dark';

  // Exact Color Tokens from Mockup
  const brandPurple = '#5B4DFB';
  const brandPurpleHover = '#4A3DE5';
  const brandTeal = '#00B894';
  const bgPage = isDark ? '#080A15' : '#FFFFFF';
  const bgHeroCard = isDark
    ? 'linear-gradient(135deg, #13172E 0%, #1A2042 100%)'
    : 'linear-gradient(135deg, #F3EEFF 0%, #FAF8FF 40%, #F5F1FF 100%)';
  const bgCard = isDark ? '#111526' : '#FFFFFF';
  const textHead = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E243D' : '#EEF1F6';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: bgPage,
        color: textHead,
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        transition: 'background 200ms ease, color 200ms ease',
        overflowX: 'hidden',
      }}
    >
      {/* =========================================================================
          1. TOP NAVIGATION BAR (FULL WIDTH END-TO-END)
          ========================================================================= */}
      <nav
        style={{
          width: '100%',
          background: isDark ? 'rgba(8, 10, 21, 0.98)' : '#FFFFFF',
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '12px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo & Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: brandPurple,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(91, 77, 251, 0.35)',
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: textHead,
                letterSpacing: '-0.3px',
              }}
            >
              CampusFlow
            </span>
          </Link>

          {/* Navigation Center Links */}
          <div
            className="landing-desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: '0.94rem', fontWeight: 600 }}
          >
            <a
              href="#events"
              style={{
                color: brandPurple,
                textDecoration: 'none',
                position: 'relative',
                paddingBottom: 4,
              }}
            >
              Events
              <span
                style={{
                  position: 'absolute',
                  bottom: -15,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  background: brandPurple,
                  borderRadius: 2,
                }}
              />
            </a>
            <a href="#features" style={{ color: textMuted, textDecoration: 'none' }}>Features</a>
            <a href="#verify" style={{ color: textMuted, textDecoration: 'none' }}>Verify Certificate</a>
            <a href="#about" style={{ color: textMuted, textDecoration: 'none' }}>About Us</a>
          </div>

          {/* Right Controls: Mode Toggle & Dashboard Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Simple Light/Dark Switcher */}
            <button
              onClick={toggleMode}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: `1px solid ${borderColor}`,
                background: isDark ? '#161C33' : '#FFFFFF',
                color: textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              {isDark ? <FaSun style={{ color: '#F59E0B' }} /> : <FaMoon style={{ color: brandPurple }} />}
            </button>

            {/* Dashboard / Sign In Button */}
            {isAuthenticated ? (
              <Link
                to={getDashboardPath(role)}
                style={{
                  height: 40,
                  padding: '0 22px',
                  borderRadius: 10,
                  background: brandPurple,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(91, 77, 251, 0.35)',
                }}
              >
                Dashboard
                <span style={{ fontSize: '0.95rem' }}>☷</span>
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  height: 40,
                  padding: '0 22px',
                  borderRadius: 10,
                  background: brandPurple,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(91, 77, 251, 0.35)',
                }}
              >
                Dashboard
                <span style={{ fontSize: '0.95rem' }}>☷</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. HERO SECTION (FULL WIDTH END-TO-END CONTAINER)
          ========================================================================= */}
      <div style={{ width: '100%', padding: '20px 32px 0', boxSizing: 'border-box' }}>
        <section
          style={{
            width: '100%',
            background: bgHeroCard,
            borderRadius: 24,
            border: `1px solid ${isDark ? '#26305C' : '#EAE3FC'}`,
            padding: '50px 60px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 50,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Column: Headlines, Buttons & 4 Stat Cards */}
          <div>
            {/* Top Pill Badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '6px 18px',
                borderRadius: 20,
                background: isDark ? 'rgba(91, 77, 251, 0.25)' : '#FFFFFF',
                color: brandPurple,
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: 20,
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(91, 77, 251, 0.08)',
                border: `1px solid ${isDark ? '#3E4980' : '#E8E1FC'}`,
              }}
            >
              Campus Events 2026
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.6rem, 4vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-1.5px',
                margin: '0 0 18px 0',
                color: textHead,
              }}
            >
              Discover. Attend. <br />
              <span style={{ color: brandPurple }}>
                Make Every Moment Count.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '1.08rem',
                color: textMuted,
                lineHeight: 1.65,
                maxWidth: '620px',
                margin: '0 0 32px 0',
              }}
            >
              Find the latest campus happenings, register instantly, and manage all your digital passes in one place.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
              <a
                href="#events"
                style={{
                  height: 48,
                  padding: '0 28px',
                  borderRadius: 12,
                  background: brandPurple,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 18px rgba(91, 77, 251, 0.35)',
                }}
              >
                Browse Events <HiArrowRight />
              </a>

              <Link
                to={isAuthenticated ? getDashboardPath(role) : "/login"}
                style={{
                  height: 48,
                  padding: '0 26px',
                  borderRadius: 12,
                  background: isDark ? '#141A30' : '#FFFFFF',
                  border: `1.5px solid ${borderColor}`,
                  color: textHead,
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <HiUser style={{ color: textMuted, fontSize: '1.1rem' }} /> {isAuthenticated ? 'Go to Dashboard' : 'Student & Admin Sign In'}
              </Link>
            </div>

            {/* 4 Stats Cards (Row Layout as in Image/image.png) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                background: isDark ? '#111526' : '#FFFFFF',
                border: `1px solid ${borderColor}`,
                borderRadius: 16,
                padding: '16px 20px',
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* Stat 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#EEF0FD',
                    color: brandPurple,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <HiCalendar />
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>120+</strong>
                  <span style={{ fontSize: '0.74rem', color: textMuted }}>Events</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FDF2F4',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <HiUsers />
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>15K+</strong>
                  <span style={{ fontSize: '0.74rem', color: textMuted }}>Students</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#E6FAF5',
                    color: brandTeal,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <HiTicket />
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>8K+</strong>
                  <span style={{ fontSize: '0.74rem', color: textMuted }}>QR Passes Issued</span>
                </div>
              </div>

              {/* Stat 4 (Colleges) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <FaUniversity />
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>25+</strong>
                  <span style={{ fontSize: '0.74rem', color: textMuted }}>Colleges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Artwork with Pedestal, Layered Colorful Petals & Floating Phone */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Floating 3D Calendar Pill Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '10px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: brandPurple,
                  zIndex: 3,
                }}
              >
                <HiCalendar style={{ fontSize: '1.2rem' }} /> 25 May
              </div>

              {/* Floating 3D VIP Ticket Pill Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 45,
                  right: 10,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '10px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#EC4899',
                  zIndex: 3,
                }}
              >
                <HiTicket style={{ fontSize: '1.2rem' }} /> VIP Pass
              </div>

              {/* Colorful 3D Petals/Leaves Background Graphic */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '45px',
                  width: '360px',
                  height: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  gap: '10px',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: 48, height: 120, background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)', borderRadius: '50% 50% 0 0', transform: 'rotate(-30deg)' }} />
                <div style={{ width: 52, height: 145, background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)', borderRadius: '50% 50% 0 0', transform: 'rotate(-15deg)' }} />
                <div style={{ width: 54, height: 155, background: 'linear-gradient(180deg, #F43F5E 0%, #E11D48 100%)', borderRadius: '50% 50% 0 0', transform: 'rotate(15deg)' }} />
                <div style={{ width: 48, height: 120, background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)', borderRadius: '50% 50% 0 0', transform: 'rotate(30deg)' }} />
              </div>

              {/* Floating 3D Phone Mockup */}
              <div
                onClick={() =>
                  setFullScreenQR({
                    value: 'CAMPUSFLOW-CODE-CARNIVAL-2026',
                    title: 'Code Carnival 2.0 Entry Pass',
                    subtitle: '25 May 2026 • 10:00 AM • Seminar Hall',
                    tokenLabel: 'Pass Token: CC2-2026-9482',
                  })
                }
                title="Click to view QR in Fullscreen"
                style={{
                  width: '280px',
                  background: '#1A2142',
                  borderRadius: '38px',
                  padding: '14px',
                  boxShadow: '0 25px 60px rgba(91, 77, 251, 0.28), 0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '4px solid #303B6B',
                  cursor: 'pointer',
                  zIndex: 2,
                  transform: 'translateY(-10px)',
                  transition: 'transform 200ms ease',
                }}
              >
                {/* Phone Inner Screen */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #2A3670 0%, #151C3B 100%)',
                    borderRadius: '28px',
                    padding: '20px 16px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#93A4E8', fontWeight: 600 }}>Your QR Pass</span>

                  {/* White QR Code Stand */}
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      padding: '14px',
                      margin: '14px auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    }}
                  >
                    <QRCode value="https://campusflow.io/verify/pass-2026-001" size={140} />
                  </div>

                  <h4 style={{ fontSize: '1.05rem', margin: '6px 0 2px', fontWeight: 800 }}>Code Carnival 2.0</h4>
                  <p style={{ fontSize: '0.75rem', color: '#93A4E8', margin: '0 0 6px' }}>25 May 2026 • 10:00 AM</p>
                  <span style={{ fontSize: '0.72rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <HiLocationMarker style={{ color: '#EF4444' }} /> Seminar Hall
                  </span>
                </div>
              </div>

              {/* 3D Purple Pedestal Base */}
              <div
                style={{
                  width: '360px',
                  height: '65px',
                  background: 'linear-gradient(180deg, #7A6CFD 0%, #5142E8 100%)',
                  borderRadius: '50%',
                  marginTop: '-32px',
                  zIndex: 1,
                  boxShadow: '0 15px 35px rgba(91, 77, 251, 0.4)',
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          3. SEARCH BAR & CATEGORY FILTER CHIPS STRIP (FULL WIDTH)
          ========================================================================= */}
      <section style={{ width: '100%', padding: '30px 32px 24px', boxSizing: 'border-box' }}>
        {/* Unified Search & Dates Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: bgCard,
            border: `1.5px solid ${borderColor}`,
            borderRadius: 16,
            padding: '4px 10px 4px 20px',
            marginBottom: 20,
            boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <HiSearch style={{ color: textMuted, fontSize: '1.3rem', marginRight: 12 }} />
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
              fontSize: '0.96rem',
              outline: 'none',
              height: 48,
            }}
          />

          {/* All Dates Dropdown Pill on the right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#161C33' : '#F4F5F9',
              borderRadius: 12,
              padding: '10px 18px',
              cursor: 'pointer',
              color: textHead,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <HiCalendar style={{ color: brandPurple }} />
            <span>{dateFilter}</span>
            <HiChevronDown style={{ color: textMuted }} />
          </div>
        </div>

        {/* Category Chips Bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: isSelected ? 'none' : `1px solid ${borderColor}`,
                  background: isSelected ? brandPurple : bgCard,
                  color: isSelected ? '#FFFFFF' : textHead,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(91, 77, 251, 0.3)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED EVENTS (4-CARD FULL-WIDTH GRID ROW WITH ARROW)
          ========================================================================= */}
      <section id="events" style={{ width: '100%', padding: '0 32px 36px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: brandPurple, fontSize: '1.25rem' }}>★</span>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: textHead }}>
              Featured Events
            </h2>
          </div>

          <a
            href="#events"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: brandPurple,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View all events →
          </a>
        </div>

        {/* 4-Card Horizontal Layout Container with Right Arrow */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {filteredEvents.slice(0, 4).map((event, idx) => {
              const isPopular = event.isPopular || idx === 0;
              const isRegistered = event.status === 'COMPLETED' || idx >= 2;

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
                  {/* Photo with 'Popular' Pill Badge */}
                  <div style={{ height: 165, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={event.image?.url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                      alt={event.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isPopular && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: brandPurple,
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 20,
                        }}
                      >
                        Popular
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Date & Location Line */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, fontSize: '0.78rem', color: textMuted, flexWrap: 'wrap' }}>
                      <span style={{ color: brandPurple, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HiCalendar />
                        {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {event.startTime || '10:00 AM'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HiLocationMarker style={{ color: '#EF4444' }} /> {event.location}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '0 0 6px 0', color: textHead }}>
                      {event.name}
                    </h3>

                    <p style={{ fontSize: '0.84rem', color: textMuted, lineHeight: 1.5, margin: '0 0 18px 0', flex: 1 }}>
                      {event.description}
                    </p>

                    {/* Dual Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          background: 'transparent',
                          border: `1.5px solid ${borderColor}`,
                          color: textHead,
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        View Details
                      </button>

                      <Link
                        to={isAuthenticated ? '/user/events' : '/signup?redirect=/user/events'}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          background: isRegistered ? brandTeal : brandPurple,
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          textDecoration: 'none',
                          boxShadow: isRegistered
                            ? '0 4px 12px rgba(0, 184, 148, 0.3)'
                            : '0 4px 12px rgba(91, 77, 251, 0.3)',
                        }}
                      >
                        {isRegistered ? 'View Pass' : 'Register Now'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Floating Carousel Arrow */}
          <div
            style={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: textHead,
              fontSize: '1.2rem',
              zIndex: 5,
            }}
          >
            <HiChevronRight />
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FULL-WIDTH "ALL YOUR EVENTS. ONE SMART DASHBOARD." BANNER
          ========================================================================= */}
      <section id="features" style={{ width: '100%', padding: '0 32px 36px', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            background: isDark
              ? 'linear-gradient(135deg, #13172E 0%, #1A2042 100%)'
              : 'linear-gradient(135deg, #18144E 0%, #100C3C 100%)',
            borderRadius: 22,
            padding: '36px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(24, 20, 78, 0.25)',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Column: Shield + Title + 4 Checkmark Bullets */}
          <div style={{ maxWidth: '700px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: brandPurple,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: 16,
              }}
            >
              <HiShieldCheck />
            </div>

            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 16px 0', color: '#FFFFFF' }}>
              All your events. One smart dashboard.
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 12,
                fontSize: '0.9rem',
                color: '#CBD5E1',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#818CF8' }}>✓</span> Register in seconds
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#818CF8' }}>✓</span> Get digital QR passes instantly
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#818CF8' }}>✓</span> Track your registrations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#818CF8' }}>✓</span> Never miss an update
              </div>
            </div>
          </div>

          {/* Right Column: CTA Button + Floating Phone Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.88rem', color: '#A5B4FC', margin: '0 0 12px 0', fontWeight: 600 }}>
                Get your digital pass <br />anytime, anywhere!
              </p>
              <Link
                to={isAuthenticated ? getDashboardPath(role) : '/signup'}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  color: '#1E1B4B',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Learn More →
              </Link>
            </div>

            {/* Mini Phone Card */}
            <div
              style={{
                width: '125px',
                background: '#2A335E',
                borderRadius: '18px',
                padding: '10px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '0.62rem', color: '#CBD5E1', fontWeight: 700 }}>Your QR Pass</span>
              <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 6, margin: '6px auto', display: 'inline-block' }}>
                <QRCode value="https://campusflow.io/verify" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. VERIFY A CERTIFICATE (FULL WIDTH CARD STRIP)
          ========================================================================= */}
      <section id="verify" style={{ width: '100%', padding: '0 32px 48px', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            background: isDark ? 'linear-gradient(135deg, #0D2824 0%, #0F332D 100%)' : '#EAF8F5',
            border: `1px solid ${isDark ? '#17473F' : '#C4EDE3'}`,
            borderRadius: 20,
            padding: '24px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            boxSizing: 'border-box',
          }}
        >
          {/* Left Title & Shield Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: brandTeal,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              <HiShieldCheck />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 2px 0', color: textHead }}>
                Verify a Certificate
              </h3>
              <p style={{ fontSize: '0.86rem', color: textMuted, margin: 0 }}>
                Enter a student certificate ID to verify authenticity.
              </p>
            </div>
          </div>

          {/* Right Input & Verify Action Button */}
          <form
            onSubmit={handleVerifyCert}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              maxWidth: '520px',
              minWidth: '280px',
            }}
          >
            <input
              type="text"
              placeholder="e.g. CERT-EVT-2026-XXXX"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              style={{
                flex: 1,
                height: 46,
                padding: '0 18px',
                borderRadius: 12,
                background: bgCard,
                border: `1.5px solid ${borderColor}`,
                color: textHead,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                height: 46,
                padding: '0 26px',
                borderRadius: 12,
                background: brandTeal,
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(0, 184, 148, 0.3)',
              }}
            >
              <HiShieldCheck style={{ fontSize: '1.1rem' }} /> Verify
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER WITH 5 COLUMNS & NEWSLETTER (FULL WIDTH)
          ========================================================================= */}
      <footer
        id="about"
        style={{
          width: '100%',
          borderTop: `1px solid ${borderColor}`,
          background: isDark ? '#060810' : '#FFFFFF',
          padding: '50px 36px 30px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 1.2fr',
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Col 1: Brand & Socials */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: brandPurple,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                C
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: textHead }}>CampusFlow</span>
            </div>

            <p style={{ fontSize: '0.86rem', color: textMuted, lineHeight: 1.6, margin: '0 0 18px 0', maxWidth: '320px' }}>
              Empowering campuses with smarter event management and digital experiences.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? '#151B33' : '#F4F5F9', color: textHead, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}><FaFacebook /></span>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? '#151B33' : '#F4F5F9', color: textHead, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}><FaInstagram /></span>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? '#151B33' : '#F4F5F9', color: textHead, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}><FaTwitter /></span>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? '#151B33' : '#F4F5F9', color: textHead, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}><FaLinkedin /></span>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: isDark ? '#151B33' : '#F4F5F9', color: textHead, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}><FaYoutube /></span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 14px 0', color: textHead }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: textMuted }}>
              <a href="#events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</a>
              <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
              <a href="#verify" style={{ color: 'inherit', textDecoration: 'none' }}>Verify Certificate</a>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 14px 0', color: textHead }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: textMuted }}>
              <span style={{ cursor: 'pointer' }}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Contact Us</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 14px 0', color: textHead }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: textMuted }}>
              <span style={{ cursor: 'pointer' }}>Help Center</span>
              <span style={{ cursor: 'pointer' }}>FAQs</span>
              <span style={{ cursor: 'pointer' }}>Guidelines</span>
            </div>
          </div>

          {/* Col 5: Stay Updated Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 6px 0', color: textHead }}>Stay Updated</h4>
            <p style={{ fontSize: '0.84rem', color: textMuted, margin: '0 0 12px 0' }}>
              Subscribe to get the latest events and updates.
            </p>

            <form onSubmit={handleNewsletter} style={{ display: 'flex', alignItems: 'center', background: bgCard, border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: 4 }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  color: textHead,
                  fontSize: '0.86rem',
                  padding: '8px 12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: brandPurple,
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
              </button>
            </form>
            {newsletterMsg && <span style={{ fontSize: '0.76rem', color: brandTeal, marginTop: 6, display: 'block' }}>✓ Subscribed successfully!</span>}
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div
          style={{
            width: '100%',
            borderTop: `1px solid ${borderColor}`,
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: '0.84rem',
            color: textMuted,
          }}
        >
          <span>© 2026 CampusFlow. All rights reserved.</span>

          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Log In</Link>
            <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>Sign Up</Link>
            <a href="#events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</a>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          8. MODAL: EVENT DETAILS POPUP
          ========================================================================= */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, background: bgCard, border: `1px solid ${borderColor}` }}>
            <div className="modal-header">
              <div>
                <h2>{selectedEvent.name}</h2>
                <p style={{ fontSize: '0.78rem', color: textMuted }}>Event ID: {selectedEvent.eventId}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.84rem', marginBottom: 16 }}>
                <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Time:</strong> {selectedEvent.startTime || '10:00 AM'} - {selectedEvent.endTime || '04:00 PM'}</div>
                <div><strong>Location:</strong> {selectedEvent.location}</div>
                <div><strong>Capacity:</strong> {selectedEvent.participantCount || 0} / {selectedEvent.maxParticipants || 60}</div>
              </div>

              {selectedEvent.description && (
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ marginBottom: 4, fontSize: '0.9rem' }}>Description</h4>
                  <p style={{ fontSize: '0.84rem', color: textMuted, lineHeight: 1.5 }}>{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
              <Link
                to={isAuthenticated ? '/user/events' : '/signup'}
                className="btn btn-primary"
                onClick={() => setSelectedEvent(null)}
                style={{ background: brandPurple }}
              >
                {isAuthenticated ? 'Proceed to Register' : 'Sign Up to Register'}
              </Link>
            </div>
          </div>
        </div>
      )}

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
