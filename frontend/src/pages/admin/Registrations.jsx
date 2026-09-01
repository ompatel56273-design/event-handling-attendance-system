import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiSearch } from 'react-icons/hi';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [regsRes, eventsRes] = await Promise.all([
          api.get('/admin/registrations'),
          api.get('/admin/events'),
        ]);
        setRegistrations(regsRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fetchFiltered = async (eventId, searchQuery = search) => {
    setSelectedEvent(eventId);
    try {
      let url = '/admin/registrations?';
      if (eventId) url += `eventId=${eventId}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      const res = await api.get(url);
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFiltered(selectedEvent, search);
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this registration?')) return;
    try {
      await api.delete(`/admin/registrations/${id}`);
      setMsg({ type: 'success', text: 'Registration removed successfully.' });
      fetchFiltered(selectedEvent, search);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to remove registration.' });
    }
  };

  const handleExport = async (format = 'xlsx') => {
    try {
      const res = await api.get(`/admin/registrations/export?eventId=${selectedEvent || ''}&format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Registrations_${selectedEvent ? 'Event' : 'All'}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <DashboardLayout
      title="Registration Management"
      subtitle="View, filter, and manage all student event registrations"
      headerActions={
        <div style={{ display: 'flex', gap: 10 }}>
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
        </div>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 240 }}>
            <select
              className="form-control"
              value={selectedEvent}
              onChange={(e) => fetchFiltered(e.target.value, search)}
            >
              <option value="">All Events</option>
              {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>

          <form onSubmit={handleSearch} className="search-input" style={{ width: 320, marginLeft: 'auto' }}>
            <HiSearch className="search-icon" />
            <input
              placeholder="Search student, roll, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Registrations Found</h3>
          <p>No student registrations match the selected filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Year / Class</th>
                <th>Roll No.</th>
                <th>Event</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.userId?.firstName} {r.userId?.lastName}</td>
                  <td>{r.userId?.department || '—'}</td>
                  <td>{r.userId?.year || '—'}/{r.userId?.className || '—'}</td>
                  <td>{r.userId?.rollNumber || '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.eventId?.name || '—'}</td>
                  <td>{new Date(r.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`badge ${r.status === 'ATTENDED' ? 'badge-success' : r.status === 'REGISTERED' ? 'badge-info' : 'badge-danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status !== 'REMOVED_BY_ADMIN' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(r._id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminRegistrations;
