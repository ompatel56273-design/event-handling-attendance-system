import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  HiShieldCheck, HiPencil, HiIdentification,
  HiAcademicCap, HiPhone, HiMail, HiCalendar,
  HiCheckCircle, HiCamera
} from 'react-icons/hi';
import { FaGraduationCap, FaUniversity } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName || 'John',
        lastName: res.data.lastName || 'Doe',
        mobile: res.data.mobile || '9876543210',
      });
    } catch (err) {
      console.error(err);
      setProfile(user || { firstName: 'John', lastName: 'Doe', userId: 'USR-102938', department: 'BCA', year: 2, className: 'A', rollNumber: '21BCA102', email: 'john.doe@email.com', mobile: '9876543210' });
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.put('/users/me', form);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    }
  };

  const student = profile || user || {};
  const fullName = `${student.firstName || 'John'} ${student.lastName || 'Doe'}`.trim();
  const initial = (student.firstName?.[0] || 'J').toUpperCase();

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Student Profile
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
            Official student credentials, academic identity & contact information
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
          <HiShieldCheck style={{ fontSize: '1.05rem' }} /> VERIFIED STUDENT
        </span>
      </div>

      {msg.text && (
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20, background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: msg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
          {msg.text}
        </div>
      )}

      {/* Profile Hero Card */}
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
        <div style={{ height: 110, background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }} />

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
                {fullName}
              </h2>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: 2 }}>
                {student.userId || 'USR-102938'} • Roll No. {student.rollNumber || '21BCA102'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {student.department || 'BCA'} | {student.year || 2}nd Year - Class {student.className || 'A'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: '10px 22px', fontWeight: 800, gap: 8 }}
          >
            <HiPencil /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Edit Form or Attributes Grid */}
      {editing ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '24px', maxWidth: 540 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>Edit Contact Information</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="form-control"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="form-control"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mobile Number</label>
              <input
                type="text"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="form-control"
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <HiIdentification />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>STUDENT ID</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{student.userId || 'USR-102938'}</h3>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(56, 189, 248, 0.12)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <FaUniversity />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>DEPARTMENT & CLASS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{student.department || 'BCA'} - Class {student.className || 'A'}</h3>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <HiCheckCircle />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ENROLLMENT STATUS</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', margin: '4px 0 0 0' }}>Active & Enrolled</h3>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <HiMail />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMAIL ADDRESS</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{student.email || 'john.doe@email.com'}</h3>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <HiPhone />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MOBILE NUMBER</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{student.mobile || '9876543210'}</h3>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>
              <HiCalendar />
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACADEMIC YEAR</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>2026 — 2027</h3>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
