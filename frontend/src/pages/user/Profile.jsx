import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
        setForm({ firstName: res.data.firstName, lastName: res.data.lastName, mobile: res.data.mobile });
      } catch (err) { console.error(err); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put('/users/me', form);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      setMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setMsg({ type: 'error', text: 'Only JPG, PNG, WEBP allowed.' }); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: 'error', text: 'Image must be under 5 MB.' }); return; }

    const formData = new FormData();
    formData.append('profileImage', file);
    setUploading(true);
    try {
      const res = await api.post('/users/me/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(prev => ({ ...prev, profileImage: res.data.profileImage }));
      updateUser({ profileImage: res.data.profileImage });
      setMsg({ type: 'success', text: 'Image uploaded!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <DashboardLayout><div className="loading-center"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {profile.profileImage?.url ? (
              <img src={profile.profileImage.url} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{profile.firstName[0]}{profile.lastName[0]}</div>
            )}
            <label className="profile-avatar-upload" title="Upload photo">
              📷
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
          </div>
          <div className="profile-info">
            <h2>{profile.firstName} {profile.lastName}</h2>
            <p>{profile.department} — Year {profile.year} — Class {profile.className}</p>
            <p className="user-id">{profile.userId}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Personal Information</h3>
          {editing ? (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input className="form-control" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="form-control" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input className="form-control" value={form.mobile || ''} onChange={(e) => setForm({ ...form, mobile: e.target.value })} maxLength={10} />
              </div>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </>
          ) : (
            <>
              <div className="e-card-detail-row"><span className="label">Email</span><span className="value">{profile.email}</span></div>
              <div className="e-card-detail-row"><span className="label">Mobile</span><span className="value">{profile.mobile}</span></div>
              <div className="e-card-detail-row"><span className="label">Roll No.</span><span className="value">{profile.rollNumber}</span></div>
            </>
          )}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Academic Information</h3>
          <div className="e-card-detail-row"><span className="label">Department</span><span className="value">{profile.department}</span></div>
          <div className="e-card-detail-row"><span className="label">Year</span><span className="value">{profile.year}</span></div>
          <div className="e-card-detail-row"><span className="label">Class</span><span className="value">{profile.className}</span></div>
          <div className="e-card-detail-row"><span className="label">Status</span><span className="value"><span className="badge badge-success">{profile.accountStatus}</span></span></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
