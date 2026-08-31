import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiUserAdd, HiCheckCircle, HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', department: '', year: '', className: '',
    rollNumber: '', mobile: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.firstName || !form.lastName) return 'First and last name are required.';
    if (!form.department) return 'Please select a department.';
    if (!form.year) return 'Please select a year.';
    if (!form.className) return 'Please select a class.';
    if (!form.rollNumber) return 'Roll number is required.';
    if (!/^\d{10}$/.test(form.mobile)) return 'Mobile must be exactly 10 digits.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const res = await signup({
        ...form,
        year: parseInt(form.year),
      });
      setSuccess(res.message || 'Account created successfully! Please check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-app)' }}>
        <div className="card hover-card glow-border" style={{ maxWidth: '480px', width: '100%', padding: '40px 32px', textAlign: 'center', borderRadius: '24px' }}>
          <div style={{ fontSize: '3.5rem', color: '#10B981', marginBottom: 16 }}>
            <HiCheckCircle style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: 10 }}>Check Your Inbox</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.86rem', lineHeight: '1.6' }}>
            {success}
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Sign In <HiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: 'var(--bg-app)', position: 'relative', overflow: 'hidden' }}>
      <div
        className="card hover-card glow-border"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '36px 32px',
          borderRadius: '24px',
          backdropFilter: 'blur(24px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-primary)',
              margin: '0 auto 12px',
            }}
          >
            ⚡
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>Create Student Passport</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Register to receive your dynamic Campus Identity QR pass
          </p>
        </div>

        {error && <div className="alert alert-danger" style={{ fontSize: '0.8rem', marginBottom: '18px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>First Name *</label>
              <input name="firstName" className="form-control" placeholder="First name" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Last Name *</label>
              <input name="lastName" className="form-control" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department *</label>
              <select name="department" className="form-control" value={form.department} onChange={handleChange} required>
                <option value="">Select Dept</option>
                <option value="BCA">BCA</option>
                <option value="BSc CA & IT">BSc CA & IT</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Year *</label>
              <select name="year" className="form-control" value={form.year} onChange={handleChange} required>
                <option value="">Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Class *</label>
              <select name="className" className="form-control" value={form.className} onChange={handleChange} required>
                <option value="">Class</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Roll Number *</label>
              <input name="rollNumber" className="form-control" placeholder="e.g. 21BCA102" value={form.rollNumber} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Mobile Number *</label>
              <input name="mobile" className="form-control" placeholder="10 Digits" value={form.mobile} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Campus Email Address *</label>
            <input name="email" type="email" className="form-control" placeholder="john.doe@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password *</label>
              <input name="password" type="password" className="form-control" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Confirm Password *</label>
              <input name="confirmPassword" type="password" className="form-control" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={loading}
          >
            {loading ? 'Creating Passport...' : (
              <>Create Account <HiArrowRight /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
