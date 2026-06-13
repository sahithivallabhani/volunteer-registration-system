import React from 'react';

export default function StatCard({ title, value, icon: Icon, glowType = 'primary' }) {
  const glowClass = `stat-card-glow-${glowType}`;
  
  return (
    <div className={`glass-panel stat-card ${glowClass}`} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0.85rem', 
          borderRadius: '12px',
          background: glowType === 'primary' ? 'rgba(139, 92, 246, 0.15)' : 
                      glowType === 'secondary' ? 'rgba(6, 182, 212, 0.15)' : 
                      'rgba(16, 185, 129, 0.15)',
          color: glowType === 'primary' ? 'var(--primary)' : 
                 glowType === 'secondary' ? 'var(--secondary)' : 
                 'var(--success)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: '1.2' }}>
          {value}
        </h3>
      </div>
    </div>
  );
}
