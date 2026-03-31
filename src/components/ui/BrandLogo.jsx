import React from 'react';

export default function BrandLogo({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size,
      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
      borderRadius: Math.round(size * 0.26) + 'px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#000', flexShrink: 0,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </div>
  );
}
