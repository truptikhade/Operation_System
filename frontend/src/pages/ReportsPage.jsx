import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, submitReport } from '../store/slices/reportSlice';
import { fetchOperations } from '../store/slices/operationSlice';

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.reports);
  const { list: operations } = useSelector(state => state.operations);
  const [form, setForm] = useState({ operation_id: '', outcome: 'successful', arrests_made: 0, incidents_count: 0, officer_injuries: 0, commanding_officer_remarks: '' });

  useEffect(() => {
    dispatch(fetchReports());
    dispatch(fetchOperations({ status: 'active' }));
  }, [dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    await dispatch(submitReport(form));
    setForm({ operation_id: '', outcome: 'successful', arrests_made: 0, incidents_count: 0, officer_injuries: 0, commanding_officer_remarks: '' });
  }

  const activeOps = operations.filter(op => op.status === 'active');

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">CLOSING REPORTS</h1><p className="page-sub">// OPERATION COMPLETION DOCUMENTATION</p></div>
      </div>
      <div className="grid-2 section">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Generate Closing Report</span></div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group full"><label>Select Operation</label>
                  <select value={form.operation_id} onChange={e => setForm(p=>({...p,operation_id:e.target.value}))} required>
                    <option value="">-- Select active operation --</option>
                    {activeOps.map(op => <option key={op.id} value={op.id}>{op.op_code} — {op.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Outcome</label>
                  <select value={form.outcome} onChange={e => setForm(p=>({...p,outcome:e.target.value}))}>
                    <option value="successful">✓ Successful</option>
                    <option value="partial">⚠ Partial Success</option>
                    <option value="unsuccessful">✗ Unsuccessful</option>
                  </select>
                </div>
                <div className="form-group"><label>Arrests Made</label>
                  <input type="number" value={form.arrests_made} min="0" onChange={e => setForm(p=>({...p,arrests_made:+e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Incidents Reported</label>
                  <input type="number" value={form.incidents_count} min="0" onChange={e => setForm(p=>({...p,incidents_count:+e.target.value}))} />
                </div>
                <div className="form-group"><label>Officer Injuries</label>
                  <input type="number" value={form.officer_injuries} min="0" onChange={e => setForm(p=>({...p,officer_injuries:+e.target.value}))} />
                </div>
              </div>
              <div className="form-row"><div className="form-group full"><label>Remarks</label>
                <textarea rows={4} value={form.commanding_officer_remarks} onChange={e => setForm(p=>({...p,commanding_officer_remarks:e.target.value}))} placeholder="Commanding officer observations and recommendations..." />
              </div></div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button type="submit" className="btn btn-primary">SUBMIT REPORT</button>
              </div>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Closed Operations Archive</span></div>
          <table className="table">
            <thead><tr><th>Op Code</th><th>Name</th><th>Outcome</th><th>Arrests</th><th>Date</th></tr></thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id}>
                  <td className="mono accent">{r.op_code}</td>
                  <td>{r.operation_name}</td>
                  <td className="capitalize">{r.outcome}</td>
                  <td>{r.arrests_made}</td>
                  <td className="mono" style={{fontSize:'11px'}}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
