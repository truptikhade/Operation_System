import React from 'react';

const STATUS_MAP = {
  active:    { label: 'ACTIVE',    cls: 'badge-active' },
  pending:   { label: 'PENDING',   cls: 'badge-pending' },
  draft:     { label: 'DRAFT',     cls: 'badge-closed' },
  closed:    { label: 'CLOSED',    cls: 'badge-closed' },
  cancelled: { label: 'CANCELLED', cls: 'badge-closed' },
  critical:  { label: 'CRITICAL',  cls: 'badge-alert' },
  high:      { label: 'HIGH',      cls: 'badge-alert' },
  medium:    { label: 'MEDIUM',    cls: 'badge-pending' },
  low:       { label: 'LOW',       cls: 'badge-closed' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status?.toUpperCase(), cls: 'badge-closed' };
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
