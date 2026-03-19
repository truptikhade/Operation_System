// AlertsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts, raiseAlert } from '../store/slices/alertSlice';
import AlertFeed from '../components/alerts/AlertFeed';

export function AlertsPage() {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.alerts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'high', location: '', sector: '' });

  useEffect(() => { dispatch(fetchAlerts()); }, [dispatch]);

  async function handleRaise(e) {
    e.preventDefault();
    await dispatch(raiseAlert(form));
    setShowForm(false);
    setForm({ title: '', description: '', severity: 'high', location: '', sector: '' });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">ALERTS &amp; INCIDENTS</h1>
          <p className="page-sub">// REAL-TIME INCIDENT MONITORING</p>
        </div>
        <button className="btn btn-danger" onClick={() => setShowForm(!showForm)}>⚠ RAISE ALERT</button>
      </div>
      {showForm && (
        <div className="panel section">
          <div className="panel-header"><span className="panel-title">New Alert</span></div>
          <div className="panel-body">
            <form onSubmit={handleRaise}>
              <div className="form-row">
                <div className="form-group"><label>Title</label><input value={form.title} required onChange={e => setForm(p => ({...p, title: e.target.value}))} /></div>
                <div className="form-group"><label>Severity</label>
                  <select value={form.severity} onChange={e => setForm(p => ({...p, severity: e.target.value}))}>
                    <option value="critical">CRITICAL</option><option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option><option value="low">LOW</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} /></div>
                <div className="form-group"><label>Sector</label><input value={form.sector} onChange={e => setForm(p => ({...p, sector: e.target.value}))} /></div>
              </div>
              <div className="form-row"><div className="form-group full"><label>Description</label>
                <textarea value={form.description} rows={3} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></div></div>
              <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>CANCEL</button>
                <button type="submit" className="btn btn-danger">SUBMIT ALERT</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid-2 section">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Unresolved Alerts</span></div>
          <div className="panel-body"><AlertFeed alerts={list.filter(a => !a.is_resolved)} /></div>
        </div>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Resolved Alerts</span></div>
          <div className="panel-body"><AlertFeed alerts={list.filter(a => a.is_resolved)} /></div>
        </div>
      </div>
    </div>
  );
}
export default AlertsPage;
