import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiUsers, HiTicket, HiClipboardCheck, HiQrcode,
  HiPlusCircle, HiArrowRight, HiTrendingUp
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, events: 0, registrations: 0, attendance: 0 });
  const [recentRegs, setRecentRegs] = useState([]);
  const [eventStatusCounts, setEventStatusCounts] = useState({ upcoming: 12, ongoing: 8, completed: 30, cancelled: 6 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [usersRes, eventsRes, regsRes, attRes] = await Promise.allSettled([
          api.get('/admin/users?limit=1'),
          api.get('/admin/events'),
          api.get('/admin/registrations'),
          api.get('/admin/attendance'),
        ]);

        const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value.data.total || 0) : 0;
        const allEvents = eventsRes.status === 'fulfilled' ? eventsRes.value.data : [];
        const allRegs = regsRes.status === 'fulfilled' ? regsRes.value.data : [];
        const allAtt = attRes.status === 'fulfilled' ? attRes.value.data : [];

        setStats({
          users: totalUsers,
          events: allEvents.length,
          registrations: allRegs.length,
          attendance: allAtt.length,
        });

        if (allRegs.length > 0) {
          setRecentRegs(allRegs.slice(0, 5));
        }

        if (allEvents.length > 0) {
          const upcoming = allEvents.filter(e => e.status === 'UPCOMING' || e.status === 'REGISTRATION_OPEN').length;
          const ongoing = allEvents.filter(e => e.status === 'ONGOING').length;
          const completed = allEvents.filter(e => e.status === 'COMPLETED').length;
          const cancelled = allEvents.filter(e => e.status === 'CANCELLED').length;
          setEventStatusCounts({ upcoming, ongoing, completed, cancelled });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout
      title="SuperAdmin Dashboard"
      subtitle="Comprehensive campus events & attendance control center"
      headerActions={
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            📅 {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      }
    >
      {/* 4 Metric Stats with Growth Indicators matching Master Image */}
      <div className="stats-grid">
        <div className="stat-card-clean hover-lift">
          <div className="stat-card-content">
            <p>Total Users</p>
            <h3>{stats.users.toLocaleString()}</h3>
            <span className="growth-rate"><HiTrendingUp /> Active Students</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-content">
            <p>Total Events</p>
            <h3>{stats.events}</h3>
            <span className="growth-rate"><HiTrendingUp /> Campus Events</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-content">
            <p>Registrations</p>
            <h3>{stats.registrations.toLocaleString()}</h3>
            <span className="growth-rate"><HiTrendingUp /> Total Enrollments</span>
          </div>
        </div>

        <div className="stat-card-clean hover-lift">
          <div className="stat-card-content">
            <p>Attendance</p>
            <h3>{stats.attendance.toLocaleString()}</h3>
            <span className="growth-rate"><HiTrendingUp /> Scanned & Verified</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split matching Master Image */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Left Column: Recent Registrations */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Registrations</h2>
            <Link to="/admin/registrations" className="view-all-link">
              View All <HiArrowRight />
            </Link>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.length > 0 ? (
                  recentRegs.map((reg) => (
                    <tr key={reg._id}>
                      <td style={{ fontWeight: 600 }}>
                        {reg.userId?.firstName} {reg.userId?.lastName}
                      </td>
                      <td>{reg.eventId?.name || 'Event'}</td>
                      <td>{new Date(reg.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className="badge badge-success">{reg.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: '30px' }}>
                      No student registrations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Event Status Overview & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Doughnut Chart Box */}
          <div className="card">
            <div className="card-header">
              <h2>Event Status Overview</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              {/* Circular SVG Donut Chart */}
              <div style={{ width: 130, height: 130, position: 'relative' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Upcoming: #E20626 */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E20626" strokeWidth="3.8" strokeDasharray="25 75" strokeDashoffset="0" />
                  {/* Ongoing: #0EA5E9 */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0EA5E9" strokeWidth="3.8" strokeDasharray="18 82" strokeDashoffset="-25" />
                  {/* Completed: #00D27A */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#00D27A" strokeWidth="3.8" strokeDasharray="45 55" strokeDashoffset="-43" />
                  {/* Cancelled: #9C23D9 */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#9C23D9" strokeWidth="3.8" strokeDasharray="12 88" strokeDashoffset="-88" />
                </svg>
              </div>

              {/* Legends */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E20626', boxShadow: '0 0 6px #E20626' }}></span>
                  <span style={{ color: 'var(--text-muted)' }}>Upcoming:</span>
                  <strong style={{ marginLeft: 'auto', color: '#FFFFFF' }}>{eventStatusCounts.upcoming}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0EA5E9', boxShadow: '0 0 6px #0EA5E9' }}></span>
                  <span style={{ color: 'var(--text-muted)' }}>Ongoing:</span>
                  <strong style={{ marginLeft: 'auto', color: '#FFFFFF' }}>{eventStatusCounts.ongoing}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00D27A', boxShadow: '0 0 6px #00D27A' }}></span>
                  <span style={{ color: 'var(--text-muted)' }}>Completed:</span>
                  <strong style={{ marginLeft: 'auto', color: '#FFFFFF' }}>{eventStatusCounts.completed}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9C23D9', boxShadow: '0 0 6px #9C23D9' }}></span>
                  <span style={{ color: 'var(--text-muted)' }}>Cancelled:</span>
                  <strong style={{ marginLeft: 'auto', color: '#FFFFFF' }}>{eventStatusCounts.cancelled}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Grid from Master Image */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Link to="/admin/events" className="btn btn-secondary btn-sm" style={{ padding: '14px 10px', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <HiPlusCircle style={{ fontSize: '1.4rem', color: '#5C33CF' }} />
              <span>Create Event</span>
            </Link>
            <Link to="/admin/attendance" className="btn btn-secondary btn-sm" style={{ padding: '14px 10px', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <HiQrcode style={{ fontSize: '1.4rem', color: '#00C2FF' }} />
              <span>Attendance QR</span>
            </Link>
            <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ padding: '14px 10px', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <HiUsers style={{ fontSize: '1.4rem', color: '#10B981' }} />
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/marks" className="btn btn-secondary btn-sm" style={{ padding: '14px 10px', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <HiClipboardCheck style={{ fontSize: '1.4rem', color: '#F59E0B' }} />
              <span>View Marks</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
