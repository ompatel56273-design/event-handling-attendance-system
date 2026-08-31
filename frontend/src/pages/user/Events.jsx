import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiLocationMarker, HiSearch, HiUserGroup, HiUser, HiPlus, HiTrash, HiX } from 'react-icons/hi';

const eventThumbnails = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=60',
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Team Registration Dialog State
  const [selectedEventForJoin, setSelectedEventForJoin] = useState(null);
  const [joinType, setJoinType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' or 'TEAM'
  const [teamName, setTeamName] = useState('');
  const [teammateIds, setTeammateIds] = useState(['']);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJoinModal = (event) => {
    setSelectedEventForJoin(event);
    setJoinType(event.participationType === 'TEAM' ? 'TEAM' : 'INDIVIDUAL');
    setTeamName('');
    setTeammateIds(['']);
    setMsg({ type: '', text: '' });
  };

  const handleAddTeammateField = () => {
    if (teammateIds.length < 3) {
      setTeammateIds([...teammateIds, '']);
    }
  };

  const handleRemoveTeammateField = (idx) => {
    setTeammateIds(teammateIds.filter((_, i) => i !== idx));
  };

  const handleTeammateChange = (idx, val) => {
    const updated = [...teammateIds];
    updated[idx] = val;
    setTeammateIds(updated);
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    if (!selectedEventForJoin) return;
    setJoining(selectedEventForJoin._id);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        isTeam: joinType === 'TEAM',
        teamName: teamName.trim(),
        memberIds: teammateIds.filter((id) => id.trim() !== ''),
      };

      const res = await api.post(`/events/${selectedEventForJoin._id}/join`, payload);
      setMsg({ type: 'success', text: res.data.message || 'Successfully joined the event!' });
      setSelectedEventForJoin(null);
      fetchEvents();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to join event.' });
    } finally {
      setJoining('');
    }
  };

  // Filter events by tab and search
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name?.toLowerCase().includes(search.toLowerCase()) ||
      evt.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'UPCOMING') return evt.status === 'UPCOMING' || evt.status === 'REGISTRATION_OPEN';
    if (activeTab === 'ONGOING') return evt.status === 'ONGOING';
    if (activeTab === 'COMPLETED') return evt.status === 'COMPLETED';
    return true;
  });

  return (
    <DashboardLayout
      title="Events Discovery"
      subtitle="Explore upcoming campus hackathons, competitions, and technical symposiums"
      headerActions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-input" style={{ width: '220px' }}>
            <HiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      }
    >
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: '20px' }}>
        {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'ALL' ? 'All Events' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <h3>No Events Found</h3>
          <p>Try changing your search term or filter tab.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.map((evt, idx) => {
            const isRegOpen = evt.status === 'REGISTRATION_OPEN';
            const allowsTeam = evt.participationType === 'TEAM' || evt.participationType === 'BOTH';

            return (
              <div key={evt._id} className="event-row-card">
                <img
                  src={evt.image?.url || eventThumbnails[idx % eventThumbnails.length]}
                  alt={evt.name}
                  className="event-row-thumb"
                />

                <div className="event-row-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3>{evt.name}</h3>
                    <span className="badge badge-primary">{evt.category || 'General'}</span>
                    {allowsTeam && (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem' }}>
                        <HiUserGroup /> Team Allowed
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {evt.description || 'Join this exciting campus competition to showcase your technical and creative skills.'}
                  </p>

                  <div className="event-row-tags">
                    <span>
                      <HiCalendar style={{ color: 'var(--primary)' }} />{' '}
                      {new Date(evt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span>
                      <HiLocationMarker style={{ color: '#0EA5E9' }} /> {evt.location || 'Campus Hall'}
                    </span>
                    <span>👥 {evt.participantCount || 0} / {evt.maxParticipants} Registered</span>
                  </div>
                </div>

                <div className="event-row-action">
                  {evt.hasJoined ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.8 }}>
                      ✓ Joined
                    </button>
                  ) : isRegOpen ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenJoinModal(evt)}
                      disabled={joining === evt._id}
                    >
                      {joining === evt._id ? 'Joining...' : 'Join Event'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6 }}>
                      {evt.status ? evt.status.replace(/_/g, ' ') : 'Closed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team / Individual Join Modal */}
      {selectedEventForJoin && (
        <div className="modal-overlay" onClick={() => setSelectedEventForJoin(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <h2>🎟️ Register for Event</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedEventForJoin.name}
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedEventForJoin(null)}>
                <HiX />
              </button>
            </div>

            <form onSubmit={submitJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Participation Mode Selection (If event allows both) */}
              {selectedEventForJoin.participationType === 'BOTH' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    className={`btn ${joinType === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setJoinType('INDIVIDUAL')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <HiUser /> Individual Pass
                  </button>

                  <button
                    type="button"
                    className={`btn ${joinType === 'TEAM' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setJoinType('TEAM')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <HiUserGroup /> Team / Group
                  </button>
                </div>
              )}

              {/* Team Registration Form */}
              {joinType === 'TEAM' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Team Name *</label>
                    <input
                      className="form-control"
                      placeholder="e.g., Code Warriors, CyberKnights"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', marginBottom: 6, display: 'block' }}>
                      Add Teammates (by Student User ID or Email)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {teammateIds.map((idVal, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            className="form-control"
                            placeholder={`Teammate #${idx + 2} User ID (e.g. USR-102938)`}
                            value={idVal}
                            onChange={(e) => handleTeammateChange(idx, e.target.value)}
                          />
                          {teammateIds.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveTeammateField(idx)}
                              style={{ padding: '6px 10px' }}
                            >
                              <HiTrash />
                            </button>
                          )}
                        </div>
                      ))}

                      {teammateIds.length < 3 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAddTeammateField}
                          style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
                        >
                          <HiPlus /> Add Another Teammate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}>
                  <p>You are registering as a solo participant. Your individual attendance pass will be generated instantly upon confirmation.</p>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedEventForJoin(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={joining === selectedEventForJoin._id}>
                  {joining === selectedEventForJoin._id ? 'Submitting...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Events;
