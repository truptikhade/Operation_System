import React from 'react';
import { useDispatch } from 'react-redux';
import { resolveAlert } from '../../store/slices/alertSlice';

const SEVERITY_COLORS = {
  critical: 'var(--red)', high: 'var(--red)',
  medium: 'var(--orange)', low: 'var(--accent)', info: 'var(--text3)'
};

export default function AlertFeed({ alerts = [] }) {
  const dispatch = useDispatch();

  if (!alerts.length) return <div className="empty-state">No alerts</div>;

  return (
    <div className="alert-feed">
      {alerts.map(alert => (
        <div key={alert.id} className="alert-item">
          <div className="alert-dot" style={{ background: SEVERITY_COLORS[alert.severity] }} />
          <div className="alert-body">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-meta">
              {alert.sector} &nbsp;|&nbsp; {alert.severity?.toUpperCase()} &nbsp;|&nbsp;
              {new Date(alert.created_at).toLocaleTimeString()}
            </div>
            {!alert.is_resolved && (
              <button className="btn btn-sm btn-outline" style={{ marginTop: 6 }}
                onClick={() => dispatch(resolveAlert(alert.id))}>
                RESOLVE
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
