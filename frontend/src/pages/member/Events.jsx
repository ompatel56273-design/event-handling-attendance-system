import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MemberEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/events'); setEvents(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <DashboardLayout><div className="loading-center"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Events</h1><p>All events in the system</p></div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Date</th><th>Status</th><th>Participants</th><th>Location</th></tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e._id}>
                <td style={{ fontWeight: 600 }}>{e.name}</td>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td><span className={`badge ${e.status === 'COMPLETED' ? 'badge-neutral' : 'badge-info'}`}>{e.status.replace(/_/g, ' ')}</span></td>
                <td>{e.participantCount}/{e.maxParticipants}</td>
                <td>{e.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default MemberEvents;
