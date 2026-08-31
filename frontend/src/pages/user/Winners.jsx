import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiStar, HiTrophy } from 'react-icons/hi2';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/winners');
        setWinners(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getPositionBadge = (pos) => {
    if (pos === '1st Place') return { bg: '#FEF3C7', color: '#D97706', label: '🥇 1st Place' };
    if (pos === '2nd Place') return { bg: '#F1F5F9', color: '#475569', label: '🥈 2nd Place' };
    return { bg: '#FFEDD5', color: '#C2410C', label: '🥉 3rd Place' };
  };

  return (
    <DashboardLayout
      title="Event Winners"
      subtitle="Hall of fame — Celebrating top student performers & achievers"
    >
      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : winners.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No Winners Declared Yet</h3>
          <p>Winners will appear here once event evaluations and results are finalized.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {winners.map(w => {
            const badge = getPositionBadge(w.position);
            return (
              <div key={w._id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 9999, fontSize: '0.74rem', fontWeight: 700 }}>
                  {badge.label}
                </div>

                {w.userId?.profileImage?.url ? (
                  <img src={w.userId.profileImage.url} alt="" style={{ width: 75, height: 75, borderRadius: '50%', objectFit: 'cover', margin: '10px auto 14px' }} />
                ) : (
                  <div className="identity-hero-avatar-placeholder" style={{ width: 75, height: 75, margin: '10px auto 14px', fontSize: '1.6rem' }}>
                    {w.userId?.firstName ? w.userId.firstName[0] : 'W'}
                  </div>
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{w.userId?.firstName} {w.userId?.lastName}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{w.userId?.department} | Roll: {w.userId?.rollNumber}</p>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', marginTop: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFFFFF' }}>{w.eventId?.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, marginTop: 4 }}>
                    Final Score: {w.marks} / 100
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Winners;
