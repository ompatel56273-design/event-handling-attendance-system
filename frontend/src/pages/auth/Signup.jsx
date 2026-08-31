import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: 16 }}>✉️</div>
          <h2 style={{ marginBottom: 12 }}>Check Your Email</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: '1.6' }}>
            {success}
          </p>
          <Link to="/login" className="btn btn-primary btn-full">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="logo">
          <h1>🎓 Event System</h1>
          <p>Create your student account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" className="form-control" placeholder="First name" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" className="form-control" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select name="department" className="form-control" value={form.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                <option value="BCA">BCA</option>
                <option value="BSc CA & IT">BSc CA & IT</option>
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select name="year" className="form-control" value={form.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Class</label>
              <select name="className" className="form-control" value={form.className} onChange={handleChange} required>
                <option value="">Select Class</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input name="rollNumber" className="form-control" placeholder="Roll number" value={form.rollNumber} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input name="mobile" className="form-control" placeholder="10-digit mobile" value={form.mobile} onChange={handleChange} maxLength={10} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" className="form-control" placeholder="Email address" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" className="form-control" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
