import { useState } from 'react';
import api from '../../services/api';
import { HiStar, HiX, HiCheckCircle } from 'react-icons/hi';

const FeedbackModal = ({ event, onClose, onSubmitted }) => {
  const [overallRating, setOverallRating] = useState(5);
  const [organizationRating, setOrganizationRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await api.post('/feedback', {
        eventId: event._id,
        overallRating,
        organizationRating,
        contentRating,
        comment,
        isAnonymous,
      });

      setMsg({ type: 'success', text: 'Thank you! Your feedback has been submitted.' });
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (currentVal, setter) => (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setter(star)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.6rem',
            cursor: 'pointer',
            color: star <= currentVal ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)',
            transition: 'transform 150ms ease',
            padding: 0,
          }}
          title={`${star} Star${star > 1 ? 's' : ''}`}
        >
          <HiStar />
        </button>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '92%',
          background: '#0B0D15',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="modal-header">
          <div>
            <h2>⭐ Event Feedback & Rating</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {event.name}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <HiX />
          </button>
        </div>

        {msg.text ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#00D27A', marginBottom: 12 }}>
              <HiCheckCircle />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: 6 }}>{msg.text}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Your rating helps improve future campus events and hackathons!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Overall Rating */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                Overall Experience Rating
              </label>
              {renderStarSelector(overallRating, setOverallRating)}
              <span style={{ fontSize: '0.74rem', color: '#F59E0B', fontWeight: 700 }}>
                {overallRating === 5 ? '🌟 Exceptional!' : overallRating === 4 ? '👍 Very Good' : overallRating === 3 ? '👌 Good' : overallRating === 2 ? '😐 Fair' : '👎 Needs Improvement'}
              </span>
            </div>

            {/* Sub-criteria Ratings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.76rem' }}>Event Organization</label>
                {renderStarSelector(organizationRating, setOrganizationRating)}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.76rem' }}>Content & Challenge</label>
                {renderStarSelector(contentRating, setContentRating)}
              </div>
            </div>

            {/* Written Comments */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Your Feedback & Suggestions</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="What did you enjoy most? How can we make future competitions even better?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Anonymous Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="anonCheck"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="anonCheck" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 0 }}>
                Submit anonymously (Hide my student name from public reviews)
              </label>
            </div>

            <div className="modal-footer" style={{ padding: '12px 0 0 0' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
