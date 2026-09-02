import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import QRCode from 'react-qr-code';
import FullScreenQRModal from '../../components/common/FullScreenQRModal';
import {
  HiCalendar, HiLocationMarker, HiSearch,
  HiArrowRight, HiUsers, HiTicket, HiSparkles,
  HiChevronDown, HiPaperAirplane, HiViewGrid,
  HiShieldCheck, HiCheckCircle, HiStar, HiFire
} from 'react-icons/hi';
import {
  FaTrophy, FaWrench, FaCode, FaMusic, FaUsers,
  FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaMoon, FaSun, FaUniversity, FaCrown
} from 'react-icons/fa';

const DEFAULT_FEATURED_EVENTS = [
  {
    _id: 'default-1',
    eventId: 'EVT-2026-001',
    name: 'Code Carnival 2.0',
    description: 'A prestigious campus coding battle to test your algorithms, debugging speed, and data structure mastery.',
    date: '2026-05-25',
    startTime: '10:00 AM',
    location: 'Seminar Hall',
    badgeType: 'Popular',
    badgeColor: '#6366F1',
    category: 'Competitions',
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
    name: 'Web Dev Workshop',
    description: 'Master modern full-stack development, reactive architecture, Next.js, and cloud deployments.',
    date: '2026-05-28',
    startTime: '02:00 PM',
    location: 'Lab 3, Tech Block',
    badgeType: 'Workshop',
    badgeColor: '#3B82F6',
    category: 'Workshops',
    status: 'REGISTRATION_OPEN',
    image: {
      url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 35,
    maxParticipants: 50,
  },
  {
    _id: 'default-3',
    eventId: 'EVT-2026-003',
    name: 'Design Hack 2026',
    description: 'Build futuristic prototypes, collaborative design systems, and human-centric mobile experiences.',
    date: '2026-05-31',
    startTime: '11:00 AM',
    location: 'Innovation Center',
    badgeType: 'Hackathon',
    badgeColor: '#A855F7',
    category: 'Hackathons',
    status: 'REGISTRATION_OPEN',
    image: {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 48,
    maxParticipants: 64,
  },
  {
    _id: 'default-4',
    eventId: 'EVT-2026-004',
    name: 'Music Night',
    description: 'An electrifying evening of live campus bands, acoustic performances, and indie beats under the stars.',
    date: '2026-06-02',
    startTime: '06:00 PM',
    location: 'Open Air Theatre',
    badgeType: 'Concert',
    badgeColor: '#EC4899',
    category: 'Concerts',
    status: 'REGISTRATION_OPEN',
    image: {
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    },
    participantCount: 120,
    maxParticipants: 150,
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
    { id: 'All', name: 'All', icon: '★' },
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
          ev.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      ev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.eventId?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const isDark = mode === 'dark';

  // Cosmic Theme Palette
  const brandPurple = '#5B4DFB';
  const brandPink = '#EC4899';
  const brandTeal = '#00B894';
  const bgPage = isDark ? '#070913' : '#F8FAFC';
  const bgHeroCard = isDark
    ? 'linear-gradient(135deg, rgba(14, 19, 44, 0.95) 0%, rgba(9, 12, 28, 0.98) 100%)'
    : 'linear-gradient(135deg, #F3EEFF 0%, #FAF8FF 40%, #F5F1FF 100%)';
  const bgCard = isDark ? '#0D1127' : '#FFFFFF';
  const textHead = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? 'rgba(99, 102, 241, 0.22)' : '#E2E8F0';

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
        position: 'relative',
      }}
    >
      {/* Dynamic Cosmic Ambient Background Glows */}
      {isDark && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '4%',
              left: '12%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '10%',
              right: '8%',
              width: '520px',
              height: '520px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
              filter: 'blur(90px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </>
      )}

      {/* =========================================================================
          1. TOP NAVIGATION BAR (FULL WIDTH END-TO-END)
          ========================================================================= */}
      <nav
        style={{
          width: '100%',
          background: isDark ? 'rgba(7, 9, 19, 0.95)' : '#FFFFFF',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '14px 44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo & Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.35rem',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: '1.3rem',
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
            style={{ display: 'flex', alignItems: 'center', gap: 38, fontSize: '0.94rem', fontWeight: 600 }}
          >
            <a
              href="#events"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                position: 'relative',
                paddingBottom: 4,
              }}
            >
              Events
              <span
                style={{
                  position: 'absolute',
                  bottom: -16,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: '#6366F1',
                  borderRadius: 2,
                  boxShadow: '0 0 12px #6366F1',
                }}
              />
            </a>
            <a href="#features" style={{ color: textMuted, textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={(e) => e.currentTarget.style.color = textMuted}>Features</a>
            <a href="#verify" style={{ color: textMuted, textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={(e) => e.currentTarget.style.color = textMuted}>Verify Certificate</a>
            <a href="#about" style={{ color: textMuted, textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={(e) => e.currentTarget.style.color = textMuted}>About Us</a>
          </div>

          {/* Right Controls: Mode Toggle & Dashboard Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Theme Switcher */}
            <button
              onClick={toggleMode}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `1px solid ${borderColor}`,
                background: isDark ? '#11162E' : '#FFFFFF',
                color: textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'transform 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDark ? <FaSun style={{ color: '#F59E0B' }} /> : <FaMoon style={{ color: brandPurple }} />}
            </button>

            {/* Dashboard / Sign In Button */}
            <Link
              to={isAuthenticated ? getDashboardPath(role) : "/login"}
              style={{
                height: 42,
                padding: '0 24px',
                borderRadius: 12,
                background: brandPurple,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(91, 77, 251, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4F46E5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = brandPurple;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Dashboard
              <span style={{ fontSize: '0.95rem' }}>☷</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. HERO SECTION (SPLIT 2-COLUMN INSIDE GLOWING CARD)
          ========================================================================= */}
      <div style={{ width: '100%', padding: '24px 40px 0', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <section
          style={{
            width: '100%',
            background: bgHeroCard,
            borderRadius: 26,
            border: `1px solid ${borderColor}`,
            padding: '52px 60px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 40,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 10px 30px rgba(91, 77, 251, 0.06)',
          }}
        >
          {/* Left Column: Headlines, Buttons & 4 Stat Cards */}
          <div>
            {/* Top Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 18px',
                borderRadius: 20,
                background: isDark ? 'rgba(99, 102, 241, 0.16)' : '#FFFFFF',
                color: isDark ? '#A5B4FC' : brandPurple,
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: 22,
                border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.35)' : '#E8E1FC'}`,
              }}
            >
              <span style={{ color: '#818CF8' }}>★</span> Campus Events 2026
            </div>

            {/* Main Headline with Vivid Multi-Stop Gradient */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 3.8vw, 3.9rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1px',
                margin: '0 0 18px 0',
                color: '#FFFFFF',
              }}
            >
              Discover. <span style={{ color: '#818CF8' }}>Attend.</span> <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 50%, #D946EF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Make Every Moment Count.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '1.04rem',
                color: textMuted,
                lineHeight: 1.6,
                maxWidth: '580px',
                margin: '0 0 34px 0',
              }}
            >
              Find the latest campus happenings, register instantly, and manage all your digital passes in one place.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
              {/* Button 1: Browse Events with Purple-to-Pink Gradient */}
              <a
                href="#events"
                style={{
                  height: 50,
                  padding: '0 30px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 26px rgba(236, 72, 153, 0.38)',
                  transition: 'transform 150ms ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Browse Events <HiArrowRight />
              </a>

              {/* Button 2: Go to Dashboard Dark Glass Button */}
              <Link
                to={isAuthenticated ? getDashboardPath(role) : "/login"}
                style={{
                  height: 50,
                  padding: '0 28px',
                  borderRadius: 14,
                  background: isDark ? 'rgba(18, 24, 48, 0.85)' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.16)' : borderColor}`,
                  color: textHead,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : borderColor;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>☷</span> {isAuthenticated ? 'Go to Dashboard' : 'Go to Dashboard'}
              </Link>
            </div>

            {/* 4 Stats Cards in Floating Glass Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                background: isDark ? 'rgba(13, 17, 39, 0.75)' : '#FFFFFF',
                border: `1px solid ${borderColor}`,
                borderRadius: 18,
                padding: '18px 22px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* Stat 1: Events */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(59, 130, 246, 0.16)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    flexShrink: 0,
                  }}
                >
                  <HiCalendar />
                </div>
                <div>
                  <strong style={{ fontSize: '1.12rem', fontWeight: 800, display: 'block', lineHeight: 1.1, color: textHead }}>120+</strong>
                  <span style={{ fontSize: '0.76rem', color: textMuted }}>Events</span>
                </div>
              </div>

              {/* Stat 2: Students */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(236, 72, 153, 0.16)',
                    color: '#EC4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    flexShrink: 0,
                  }}
                >
                  <HiUsers />
                </div>
                <div>
                  <strong style={{ fontSize: '1.12rem', fontWeight: 800, display: 'block', lineHeight: 1.1, color: textHead }}>15K+</strong>
                  <span style={{ fontSize: '0.76rem', color: textMuted }}>Students</span>
                </div>
              </div>

              {/* Stat 3: QR Passes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(6, 182, 212, 0.16)',
                    color: '#06B6D4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    flexShrink: 0,
                  }}
                >
                  <HiTicket />
                </div>
                <div>
                  <strong style={{ fontSize: '1.12rem', fontWeight: 800, display: 'block', lineHeight: 1.1, color: textHead }}>8K+</strong>
                  <span style={{ fontSize: '0.76rem', color: textMuted }}>QR Passes Issued</span>
                </div>
              </div>

              {/* Stat 4: Colleges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.16)',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    flexShrink: 0,
                  }}
                >
                  <FaUniversity />
                </div>
                <div>
                  <strong style={{ fontSize: '1.12rem', fontWeight: 800, display: 'block', lineHeight: 1.1, color: textHead }}>25+</strong>
                  <span style={{ fontSize: '0.76rem', color: textMuted }}>Colleges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Glowing QR Pass on Neon Concentric Pedestal */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Floating 3D Blue Date Pill */}
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  left: 10,
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  borderRadius: 14,
                  padding: '8px 16px',
                  boxShadow: '0 8px 22px rgba(37, 99, 235, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  zIndex: 4,
                }}
              >
                <HiCalendar style={{ fontSize: '1.1rem' }} /> 25 May
              </div>

              {/* Floating 3D VIP Crown Ticket Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 10,
                  background: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
                  borderRadius: 14,
                  padding: '8px 16px',
                  boxShadow: '0 8px 22px rgba(219, 39, 119, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  zIndex: 4,
                }}
              >
                <FaCrown style={{ fontSize: '0.95rem' }} /> VIP Pass
              </div>

              {/* Floating Holographic Ticket Pass */}
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
                  background: 'linear-gradient(180deg, #131A38 0%, #0C1026 100%)',
                  borderRadius: '28px',
                  padding: '22px 20px',
                  boxShadow: '0 24px 60px rgba(99, 102, 241, 0.38), 0 0 35px rgba(236, 72, 153, 0.18)',
                  border: '2px solid rgba(99, 102, 241, 0.38)',
                  cursor: 'pointer',
                  zIndex: 3,
                  transform: 'translateY(-10px)',
                  textAlign: 'center',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-14px)';
                  e.currentTarget.style.boxShadow = '0 28px 70px rgba(99, 102, 241, 0.5), 0 0 45px rgba(236, 72, 153, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 24px 60px rgba(99, 102, 241, 0.38), 0 0 35px rgba(236, 72, 153, 0.18)';
                }}
              >
                <span style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Your QR Pass
                </span>

                {/* White Stand for High-Contrast QR Code */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '14px',
                    margin: '14px auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  }}
                >
                  <QRCode value="https://campusflow.io/verify/pass-2026-001" size={135} />
                </div>

                <h4 style={{ fontSize: '1.18rem', margin: '6px 0 3px', fontWeight: 800, color: '#FFFFFF' }}>
                  Code Carnival 2.0
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 6px' }}>
                  25 May 2026 • 10:00 AM
                </p>
                <span style={{ fontSize: '0.76rem', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 700 }}>
                  <HiLocationMarker /> Seminar Hall
                </span>
              </div>

              {/* 3D Concentric Neon Pedestal Graphic */}
              <div
                style={{
                  position: 'relative',
                  width: '380px',
                  height: '75px',
                  marginTop: '-36px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                {/* Top Glowing Purple Neon Ring */}
                <div
                  style={{
                    width: '330px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid #8B5CF6',
                    background: 'linear-gradient(180deg, #1C244B 0%, #0E132B 100%)',
                    boxShadow: '0 0 22px #8B5CF6, inset 0 0 16px rgba(139, 92, 246, 0.45)',
                    position: 'absolute',
                    top: 0,
                  }}
                />

                {/* Bottom Radiant Magenta Neon Ring with Floor Flare */}
                <div
                  style={{
                    width: '375px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '3.5px solid #EC4899',
                    background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
                    boxShadow: '0 0 38px #EC4899, 0 0 75px rgba(236, 72, 153, 0.65), inset 0 0 22px rgba(236, 72, 153, 0.55)',
                    position: 'absolute',
                    top: 18,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          3. SEARCH BAR & CATEGORY FILTER CHIPS STRIP (FULL WIDTH)
          ========================================================================= */}
      <section style={{ width: '100%', padding: '28px 40px 20px', boxSizing: 'border-box' }}>
        {/* Unified Search & Dates Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: bgCard,
            border: `1.5px solid ${borderColor}`,
            borderRadius: 18,
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
              background: isDark ? 'rgba(99, 102, 241, 0.12)' : '#F4F5F9',
              borderRadius: 12,
              padding: '10px 20px',
              cursor: 'pointer',
              color: textHead,
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <HiCalendar style={{ color: '#818CF8' }} />
            <span>{dateFilter}</span>
            <HiChevronDown style={{ color: textMuted }} />
          </div>
        </div>

        {/* Category Chips Bar Matching Design */}
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
                  borderRadius: 14,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: isSelected ? 'none' : `1px solid ${borderColor}`,
                  background: isSelected ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : bgCard,
                  color: isSelected ? '#FFFFFF' : textHead,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(99, 102, 241, 0.45)' : 'none',
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
      <section id="events" style={{ width: '100%', padding: '0 40px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#818CF8', fontSize: '1.25rem' }}>★</span>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: textHead }}>
              Featured Events
            </h2>
          </div>

          <a
            href="#events"
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#818CF8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View all events →
          </a>
        </div>

        {/* 4-Card Horizontal Layout Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 22,
          }}
        >
          {filteredEvents.slice(0, 4).map((event, idx) => {
            const badgeLabel = event.badgeType || (idx === 0 ? 'Popular' : idx === 1 ? 'Workshop' : idx === 2 ? '</>' : '🎵');
            const badgeBg = event.badgeColor || (idx === 0 ? '#6366F1' : idx === 1 ? '#3B82F6' : idx === 2 ? '#A855F7' : '#EC4899');

            return (
              <div
                key={event._id || idx}
                onClick={() => setSelectedEvent(event)}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.03)',
                  transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.55)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.03)';
                }}
              >
                {/* Photo with Badge */}
                <div style={{ height: 165, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={event.image?.url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                    alt={event.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: badgeBg,
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '4px 14px',
                      borderRadius: 20,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {badgeLabel}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 800, margin: '0 0 6px 0', color: textHead }}>
                      {event.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: textMuted, margin: '0 0 5px 0' }}>
                      {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {event.startTime || '10:00 AM'}
                    </p>
                    <span style={{ fontSize: '0.76rem', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <HiLocationMarker /> {event.location}
                    </span>
                  </div>

                  {/* Circular Arrow Button */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.16)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '1.05rem',
                      flexShrink: 0,
                      transition: 'background 150ms ease',
                    }}
                  >
                    <HiArrowRight />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. FULL-WIDTH "ALL YOUR EVENTS. ONE SMART DASHBOARD." BANNER
          ========================================================================= */}
      <section id="features" style={{ width: '100%', padding: '0 40px 40px', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            background: isDark
              ? 'linear-gradient(135deg, #0F142D 0%, #161D42 100%)'
              : 'linear-gradient(135deg, #18144E 0%, #100C3C 100%)',
            borderRadius: 24,
            padding: '38px 52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            color: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Column: Title + 4 Checkmark Bullets */}
          <div style={{ maxWidth: '680px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 16px 0', color: '#FFFFFF' }}>
              All your events. One smart dashboard.
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                fontSize: '0.92rem',
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
              <p style={{ fontSize: '0.9rem', color: '#A5B4FC', margin: '0 0 12px 0', fontWeight: 600 }}>
                Get your digital pass <br />anytime, anywhere!
              </p>
              <Link
                to={isAuthenticated ? getDashboardPath(role) : '/signup'}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  color: '#1E1B4B',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(255,255,255,0.2)',
                }}
              >
                Learn More →
              </Link>
            </div>

            {/* Mini Phone Card */}
            <div
              style={{
                width: '125px',
                background: '#1A2244',
                borderRadius: '18px',
                padding: '10px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
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
      <section id="verify" style={{ width: '100%', padding: '0 40px 40px', boxSizing: 'border-box' }}>
        <div
          style={{
            width: '100%',
            background: bgCard,
            border: `1.5px solid ${borderColor}`,
            borderRadius: 24,
            padding: '38px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            boxSizing: 'border-box',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.48rem', fontWeight: 800, margin: '0 0 6px 0', color: textHead }}>
              Verify an Event Certificate
            </h3>
            <p style={{ fontSize: '0.9rem', color: textMuted, margin: 0 }}>
              Enter Certificate ID to instantly validate certificate authenticity and awards.
            </p>
          </div>

          <form onSubmit={handleVerifyCert} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="e.g. CRT-102938"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              style={{
                background: isDark ? '#141A33' : '#F4F5F9',
                border: `1.5px solid ${borderColor}`,
                borderRadius: 12,
                padding: '12px 18px',
                color: textHead,
                fontSize: '0.92rem',
                outline: 'none',
                minWidth: '240px',
              }}
            />
            <button
              type="submit"
              style={{
                background: brandPurple,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '12px 26px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(91, 77, 251, 0.4)',
              }}
            >
              Verify Now
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER (5 COLUMNS + COPYRIGHT STRIP)
          ========================================================================= */}
      <footer
        id="about"
        style={{
          width: '100%',
          background: isDark ? '#05070E' : '#FFFFFF',
          borderTop: `1px solid ${borderColor}`,
          padding: '50px 40px 24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.3fr',
            gap: 36,
            marginBottom: 40,
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: brandPurple, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                C
              </div>
              <strong style={{ fontSize: '1.25rem', color: textHead }}>CampusFlow</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: textMuted, lineHeight: 1.6, margin: '0 0 16px 0', maxWidth: '300px' }}>
              Next-generation campus event terminal. Empowering students, faculty, and administrators with paperless QR access.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
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
                <p style={{ fontSize: '0.78rem', color: textMuted }}>Event ID: {selectedEvent.eventId || 'EVT-2026'}</p>
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
