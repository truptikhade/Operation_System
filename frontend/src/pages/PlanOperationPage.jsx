import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOperation } from '../store/slices/operationSlice';
import { fetchOfficers } from '../store/slices/officerSlice';

const INITIAL = {
  name: '', type: 'bandobast', priority: 'medium',
  location: '', sector: '', zone: '', brief: '',
  start_time: '', end_time: '',
  officers_required: 10, vehicles_required: 2,
  radio_channel: 'CH-4 Operations', commanding_officer_id: '',
};

export default function PlanOperationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: officers } = useSelector(state => state.officers);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');

  useEffect(() => { dispatch(fetchOfficers({ role: 'field_officer' })); }, [dispatch]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const result = await dispatch(createOperation(form));
    if (createOperation.fulfilled.match(result)) {
      navigate('/operations');
    } else {
      setError(result.payload || 'Failed to create operation');
    }
  }

  const piOfficers = officers.filter(o => ['PI', 'PSI', 'SP', 'DCP'].some(r => o.rank?.includes(r)));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">PLAN NEW OPERATION</h1>
          <p className="page-sub">// OPERATION PLANNING INTERFACE</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2 section">
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Operation Details</span></div>
            <div className="panel-body">
              {error && <div className="error-banner">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Operation Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Ganesh Utsav Security" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="bandobast">Bandobast</option>
                    <option value="patrolling">Patrolling</option>
                    <option value="vip_escort">VIP Escort</option>
                    <option value="anti_crime">Anti-Crime</option>
                    <option value="traffic">Traffic Management</option>
                    <option value="naka_checking">Naka Checking</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date &amp; Time</label>
                  <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Date &amp; Time</label>
                  <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sector</label>
                  <select name="sector" value={form.sector} onChange={handleChange}>
                    <option value="">Select sector</option>
                    <option value="Sector 1">Sector 1 — Shivajinagar</option>
                    <option value="Sector 2">Sector 2 — Swargate</option>
                    <option value="Sector 3">Sector 3 — Hadapsar</option>
                    <option value="Sector 4">Sector 4 — Kothrud</option>
                    <option value="Sector 5">Sector 5 — Pimpri</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange}>
                    <option value="critical">CRITICAL — VIP / Emergency</option>
                    <option value="high">HIGH — Major Event</option>
                    <option value="medium">MEDIUM — Routine Event</option>
                    <option value="low">LOW — Regular Patrol</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full">
                  <label>Location / Area</label>
                  <input name="location" value={form.location} onChange={handleChange} required placeholder="Specific address or landmark" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full">
                  <label>Operation Brief</label>
                  <textarea name="brief" value={form.brief} onChange={handleChange} rows={4}
                    placeholder="Describe objectives, known threats, SOP references..." />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="panel section">
              <div className="panel-header"><span className="panel-title">Resource Allocation</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Officers Required</label>
                    <input type="number" name="officers_required" value={form.officers_required} onChange={handleChange} min="1" />
                  </div>
                  <div className="form-group">
                    <label>Vehicles</label>
                    <input type="number" name="vehicles_required" value={form.vehicles_required} onChange={handleChange} min="0" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Commanding Officer</label>
                    <select name="commanding_officer_id" value={form.commanding_officer_id} onChange={handleChange}>
                      <option value="">Select officer</option>
                      {piOfficers.map(o => (
                        <option key={o.id} value={o.id}>{o.rank} {o.name} — {o.badge_number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Radio Channel</label>
                    <select name="radio_channel" value={form.radio_channel} onChange={handleChange}>
                      <option>CH-4 Operations</option>
                      <option>CH-2 Command</option>
                      <option>CH-7 Emergency</option>
                      <option>CH-9 Special Duty</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/operations')}>CANCEL</button>
              <button type="submit" className="btn btn-primary">SUBMIT FOR APPROVAL</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
