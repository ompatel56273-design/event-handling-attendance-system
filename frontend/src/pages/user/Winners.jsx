import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HiCalendar, HiFilter } from 'react-icons/hi';
import { FaTrophy, FaMedal } from 'react-icons/fa';

const DEFAULT_STUDENT_WINNERS = [
  {
    _id: 'w1',
    position: '1st Place',
    user: { firstName: 'Emma', lastName: 'Wilson', department: 'BSc CA & IT', year: 2, className: 'A', rollNumber: '21BSc021' },
    event: { name: 'Poster Presentation' },
    score: 95,
  },
  {
    _id: 'w2',
    position: '2nd Place',
    user: { firstName: 'Charlie', lastName: 'Brown', department: 'BCA', year: 2, className: 'C', rollNumber: '21BCA088' },
    event: { name: 'Poster Presentation' },
    score: 92,
  },
  {
    _id: 'w3',
    position: '3rd Place',
    user: { firstName: 'John', lastName: 'Doe', department: 'BCA', year: 2, className: 'A', rollNumber: '21BCA102' },
    event: { name: 'Poster Presentation' },
    score: 90,
  },
];

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await api.get('/winners');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setWinners(res.data);
      } else {
        setWinners(DEFAULT_STUDENT_WINNERS);
      }
    } catch (err) {
      console.error(err);
      setWinners(DEFAULT_STUDENT_WINNERS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header (Matching Student/5.png) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Hall of Fame & Winners
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Celebrating top performers and podium achievers
          </p>
        </div>

        <button
          style={{
            height: 42,
            padding: '0 16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
          }}
        >
          <HiFilter /> Filters
        </button>
      </div>

      {/* Select Event Strip */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select Event</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 360 }}>
          <HiCalendar style={{ color: 'var(--primary)' }} />
          <select
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
          >
            <option>Poster Presentation</option>
            <option>Code Carnival 2.0</option>
            <option>UI/UX Design Challenge</option>
          </select>
        </div>
      </div>

      {/* 3 Podium Cards Grid (Exact Student/5.png Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}
      >
        {winners.map((w, idx) => {
          const s = w.user || w.userId || w.student || {};
          const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Student Winner';
          const initial = (s.firstName?.[0] || name[0] || 'W').toUpperCase();
          const isFirst = w.position === '1st Place' || idx === 0;
          const isSecond = w.position === '2nd Place' || idx === 1;
          const posBadge = isFirst ? '🏆 1st Place' : isSecond ? '🥈 2nd Place' : '🥉 3rd Place';
          const posBg = isFirst ? '#F59E0B' : isSecond ? '#6366F1' : '#E11D48';
          const score = w.score || w.marks || (isFirst ? 95 : isSecond ? 92 : 90);

          return (
            <div
              key={w._id || idx}
              style={{
                background: 'var(--bg-card)',
                border: isFirst ? '2px solid #F59E0B' : '1px solid var(--border-color)',
                borderRadius: 24,
                padding: '28px',
                boxShadow: isFirst ? '0 10px 30px rgba(245, 158, 11, 0.15)' : '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Position Pill */}
              <span
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: `${posBg}1A`,
                  color: posBg,
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  padding: '4px 12px',
                  borderRadius: 16,
                }}
              >
                {posBadge}
              </span>

              {/* Avatar Circle */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: posBg,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  marginBottom: 16,
                  boxShadow: `0 8px 20px ${posBg}40`,
                }}
              >
                {initial}
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {name}
              </h3>

              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                {s.department || 'BCA'} | {s.year ? `${s.year}nd Year` : '2nd Year'} - {s.className || 'A'}
              </span>

              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Roll No. {s.rollNumber || '21BCA102'}
              </span>

              {/* Score Box */}
              <div
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {w.event?.name || 'Poster Presentation'}
                </strong>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Final Score</span>
                  <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#10B981' }}>
                    {score} / 100
                  </span>
                </div>

                {/* Score progress bar */}
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ width: `${score}%`, height: '100%', background: '#10B981', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Winners;
