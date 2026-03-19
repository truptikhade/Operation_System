import React from 'react';

export default function StatCard({ label, value, color = 'accent', meta }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  );
}
