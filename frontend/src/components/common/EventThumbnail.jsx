import React, { useState } from 'react';

const EVENT_CATEGORY_ICONS = {
  'Code Carnival 2.0': { emoji: '💻', gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#818CF8' },
  'UI/UX Design Challenge': { emoji: '🎨', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)', color: '#38BDF8' },
  'Poster Presentation': { emoji: '📊', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#34D399' },
  'Debate Competition': { emoji: '🎤', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FBBF24' },
  'Hackathon 2026': { emoji: '🚀', gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', color: '#F472B6' },
  'AI & Robotics Workshop': { emoji: '🤖', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#A78BFA' },
};

const EventThumbnail = ({ name = 'Campus Event', image, size = 44, borderRadius = 10 }) => {
  const [imgError, setImgError] = useState(false);

  const matched = EVENT_CATEGORY_ICONS[name] || {
    emoji: '🎪',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    color: '#818CF8',
  };

  const imageUrl = image?.url || (typeof image === 'string' && image.startsWith('http') ? image : null);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius,
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--border-color)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: matched.gradient,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: typeof size === 'number' ? `${Math.round(size * 0.48)}px` : '1.2rem',
        fontWeight: 900,
        boxShadow: `0 4px 14px ${matched.color}33`,
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
      title={name}
    >
      {matched.emoji}
    </div>
  );
};

export default EventThumbnail;
