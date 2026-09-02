import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiShieldCheck, HiPencil, HiIdentification,
  HiAcademicCap, HiPhone, HiCalendar, HiKey,
  HiCheckCircle, HiMail
} from 'react-icons/hi';
import { FaUserShield, FaUniversity } from 'react-icons/fa';

const MemberProfile = () => {
  const { user } = useAuth();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'Mike Johnson';
  const initial = (displayName[0] || 'M').toUpperCase();

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Member Profile
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Your coordinator identity and system access details
          </p>
        </div>

        <span
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '6px 16px',
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <HiShieldCheck style={{ fontSize: '1.05rem' }} /> MEMBER ACCESS GRANTED
        </span>
      </div>

      {/* Profile Hero Card (Matching Memebers/4.png) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 26,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        {/* Banner */}
        <div style={{ height: 110, background: 'linear-gradient(135deg, #6366F1 0%, #38BDF8 100%)' }} />

        {/* Content */}
        <div style={{ padding: '0 32px 28px', marginTop: -45, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                border: '4px solid var(--bg-card)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 900,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              {initial}
            </div>

            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {displayName}
              </h2>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: 2 }}>
                Event Coordinator & Volunteer
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {user?.email || 'member@eventhandling.com'}
              </span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: '10px 22px', fontWeight: 800, gap: 8 }}
          >
            <HiPencil /> Edit Profile
          </button>
        </div>
      </div>

      {/* 6 Attributes Grid (Exact Memebers/4.png Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          marginBottom: 26,
        }}
      >
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <HiIdentification />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>COORDINATOR ID</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>MEM-002</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(56, 189, 248, 0.12)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <FaUserShield />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNED ROLES</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>Scanner & Evaluator</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <HiCheckCircle />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', margin: '4px 0 0 0' }}>Active & Verified</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <FaUniversity />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>DEPARTMENT</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>Computer Applications</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <HiPhone />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHONE</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>+91 98765 43210</h3>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
            <HiCalendar />
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MEMBER SINCE</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>August 2026</h3>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberProfile;
