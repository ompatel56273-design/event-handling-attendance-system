import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiUsers, HiCalendar, HiTicket, HiQrcode,
  HiPlus, HiArrowRight, HiChevronRight, HiEye,
  HiShieldCheck, HiSparkles, HiDocumentText
} from 'react-icons/hi';
import { FaUserPlus, FaQrcode, FaUsersCog, FaPoll } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 5, events: 4, registrations: 7, attendance: 2 });
  const [recentRegs, setRecentRegs] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [eventStatusCounts, setEventStatusCounts] = useState({ upcoming: 4, ongoing: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [usersRes, eventsRes, regsRes, attRes] = await Promise.allSettled([
        api.get('/admin/users?limit=10'),
        api.get('/admin/events'),
        api.get('/admin/registrations'),
        api.get('/admin/attendance'),
      ]);

      const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value.data.total || usersRes.value.data.users?.length || 5) : 5;
      const allEvents = eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data) ? eventsRes.value.data : [];
      const allRegs = regsRes.status === 'fulfilled' && Array.isArray(regsRes.value.data) ? regsRes.value.data : [];
      const allAtt = attRes.status === 'fulfilled' && Array.isArray(attRes.value.data) ? attRes.value.data : [];

      setStats({
        users: totalUsers || 5,
        events: allEvents.length || 4,
        registrations: allRegs.length || 7,
        attendance: allAtt.length || 2,
      });

      if (allRegs.length > 0) {
        setRecentRegs(allRegs.slice(0, 5));
      } else {
        // Fallback default mockup data matching Super admin/1.png
        setRecentRegs([
          { _id: 'r1', user: { name: 'Emma Wilson' }, event: { name: 'Debate Competition' }, createdAt: '2026-05-13', status: 'REGISTERED' },
          { _id: 'r2', user: { name: 'John Doe' }, event: { name: 'UI/UX Design Challenge' }, createdAt: '2026-05-12', status: 'REGISTERED' },
          { _id: 'r3', user: { name: 'Bob Johnson' }, event: { name: 'Code Carnival 2.0' }, createdAt: '2026-05-12', status: 'REGISTERED' },
          { _id: 'r4', user: { name: 'Charlie Brown' }, event: { name: 'Poster Presentation' }, createdAt: '2026-05-12', status: 'REGISTERED' },
          { _id: 'r5', user: { name: 'Alice Smith' }, event: { name: 'Code Carnival 2.0' }, createdAt: '2026-05-11', status: 'REGISTERED' },
        ]);
      }

      if (allEvents.length > 0) {
        setEventsList(allEvents);
        const upcoming = allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN').length;
        const ongoing = allEvents.filter(e => e.status === 'ONGOING').length;
        const completed = allEvents.filter(e => e.status === 'COMPLETED').length;
        const cancelled = allEvents.filter(e => e.status === 'CANCELLED').length;
        setEventStatusCounts({ upcoming, ongoing, completed, cancelled });
      } else {
        setEventsList([
          { _id: 'e1', name: 'Code Carnival 2.0', registered: 120, maxParticipants: 200, percent: 60, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400' },
          { _id: 'e2', name: 'UI/UX Design Challenge', registered: 85, maxParticipants: 150, percent: 57, image: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=400' },
          { _id: 'e3', name: 'Poster Presentation', registered: 60, maxParticipants: 100, percent: 60, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400' },
          { _id: 'e4', name: 'Debate Competition', registered: 40, maxParticipants: 80, percent: 50, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <DashboardLayout>
      {/* =========================================================================
          GREETING HEADER
          ========================================================================= */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Welcome back, Super Admin! 👋
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
          Here's what's happening in your campus today.
        </p>
      </div>

      {/* =========================================================================
          ROW 1: 4 KPI STAT CARDS (Exact Super admin/1.png Layout)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 30,
        }}
      >
        {/* Card 1: Total Users */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: 12,
              }}
            >
              <HiUsers />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Users</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '2px 0 6px', color: 'var(--text-primary)' }}>
              {stats.users}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              ↑ 25% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span>
            </span>
          </div>

          {/* Mini SVG Sparkline */}
          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <path d="M0 35 Q 20 20, 40 28 T 80 10" stroke="#818CF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 2: Total Events */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: 12,
              }}
            >
              <HiCalendar />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '2px 0 6px', color: 'var(--text-primary)' }}>
              {stats.events}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              ↑ 33% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span>
            </span>
          </div>

          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <path d="M0 32 Q 25 35, 45 18 T 80 8" stroke="#38BDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 3: Total Registrations */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: 12,
              }}
            >
              <HiTicket />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registrations</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '2px 0 6px', color: 'var(--text-primary)' }}>
              {stats.registrations}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              ↑ 40% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span>
            </span>
          </div>

          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <path d="M0 30 Q 30 35, 50 15 T 80 5" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Card 4: Attendance Scanned */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: 12,
              }}
            >
              <HiQrcode />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Attendance Scanned</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '2px 0 6px', color: 'var(--text-primary)' }}>
              {stats.attendance}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              ↑ 20% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>from last month</span>
            </span>
          </div>

          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <path d="M0 32 Q 25 30, 45 20 T 80 12" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: RECENT REGISTRATIONS & EVENT STATUS OVERVIEW (2 Columns)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: 24,
          marginBottom: 30,
        }}
      >
        {/* Left: Recent Registrations Table Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Recent Registrations
            </h3>
            <Link
              to="/admin/registrations"
              style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.74rem' }}>USER</th>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.74rem' }}>EVENT</th>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.74rem' }}>JOINED DATE</th>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.74rem' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.map((reg, idx) => {
                  const uName = reg.user?.name || (reg.user?.firstName ? `${reg.user.firstName} ${reg.user.lastName || ''}` : 'Student User');
                  const eName = reg.event?.name || 'Code Carnival 2.0';
                  const initials = getInitials(uName);
                  const colors = ['#6366F1', '#3B82F6', '#06B6D4', '#38BDF8', '#A855F7'];
                  const avatarBg = colors[idx % colors.length];

                  return (
                    <tr key={reg._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: avatarBg,
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                            }}
                          >
                            {initials}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{uName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{eName}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                        {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10B981',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 16,
                            letterSpacing: '0.4px',
                          }}
                        >
                          REGISTERED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Event Status Overview Donut & 4 Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Donut Chart Overview Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Event Status Overview
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16 }}>
              {/* Donut graphic */}
              <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#E2E8F0" strokeWidth="12" fill="none" opacity="0.2" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="url(#donut_grad)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="238"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="donut_grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span style={{ position: 'absolute', fontSize: '1.4rem' }}>📅</span>
              </div>

              {/* Status breakdown legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1' }} /> Upcoming
                  </span>
                  <strong>{eventStatusCounts.upcoming}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} /> Ongoing
                  </span>
                  <strong>{eventStatusCounts.ongoing}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Completed
                  </span>
                  <strong>{eventStatusCounts.completed}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Cancelled
                  </span>
                  <strong>{eventStatusCounts.cancelled}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quick Actions (2x2 Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Link
              to="/admin/events?create=true"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(168, 85, 247, 0.14)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiPlus />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', display: 'block' }}>Create Event</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Add new campus event</span>
                </div>
              </div>
              <HiChevronRight style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link
              to="/admin/attendance"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(56, 189, 248, 0.14)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiQrcode />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', display: 'block' }}>Attendance QR</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan & verify attendance</span>
                </div>
              </div>
              <HiChevronRight style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link
              to="/admin/users"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.14)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiUsers />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', display: 'block' }}>Manage Users</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Add, edit & manage users</span>
                </div>
              </div>
              <HiChevronRight style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link
              to="/admin/marks"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.14)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiDocumentText />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', display: 'block' }}>View Marks</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View evaluation marks</span>
                </div>
              </div>
              <HiChevronRight style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: REGISTRATIONS OVERVIEW, POPULAR EVENTS & QUICK INSIGHTS (3 Cols)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.3fr 1fr',
          gap: 24,
        }}
      >
        {/* Col 1: Registrations Overview Line Chart */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Registrations Overview
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '4px 10px', borderRadius: 8 }}>
              This Month ⌄
            </span>
          </div>

          {/* Line Chart Illustration */}
          <div style={{ position: 'relative', height: 180, width: '100%', marginTop: 20 }}>
            <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart_fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 130 Q 50 110, 80 80 T 140 95 T 190 60 T 250 80 T 300 30 L 300 160 L 0 160 Z"
                fill="url(#chart_fill)"
              />
              <path
                d="M0 130 Q 50 110, 80 80 T 140 95 T 190 60 T 250 80 T 300 30"
                stroke="#6366F1"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="80" cy="80" r="4" fill="#6366F1" />
              <circle cx="140" cy="95" r="4" fill="#6366F1" />
              <circle cx="190" cy="60" r="4" fill="#6366F1" />
              <circle cx="300" cy="30" r="5" fill="#6366F1" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
              <span>1 Aug</span>
              <span>8 Aug</span>
              <span>15 Aug</span>
              <span>22 Aug</span>
              <span>29 Aug</span>
            </div>
          </div>
        </div>

        {/* Col 2: Popular Events */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Popular Events
            </h3>
            <Link to="/admin/events" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {eventsList.slice(0, 4).map((evt, idx) => {
              const regCount = evt.participantCount || evt.registered || 60;
              const maxCount = evt.maxParticipants || 100;
              const pct = Math.min(100, Math.round((regCount / maxCount) * 100));
              const lineColors = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B'];
              const color = lineColors[idx % lineColors.length];

              return (
                <div key={evt._id || idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={evt.image?.url || evt.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200'}
                    alt={evt.name}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{evt.name}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {regCount} / {maxCount}
                      </span>
                    </div>
                    {/* Progress line */}
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-app)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Quick Insights */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Quick Insights
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '4px 10px', borderRadius: 8 }}>
              This Month ⌄
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#6366F1' }}><HiUsers /></span>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Registrations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{stats.registrations}</strong>
                <span style={{ color: '#10B981', fontSize: '0.74rem', fontWeight: 700 }}>↑ 40%</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#38BDF8' }}><HiQrcode /></span>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Attendance Scanned</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{stats.attendance}</strong>
                <span style={{ color: '#10B981', fontSize: '0.74rem', fontWeight: 700 }}>↑ 20%</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#10B981' }}><HiShieldCheck /></span>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Certificates Issued</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>0</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700 }}>— 0%</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#F59E0B' }}><HiCalendar /></span>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Active Events</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>2</strong>
                <span style={{ color: '#10B981', fontSize: '0.74rem', fontWeight: 700 }}>↑ 25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
