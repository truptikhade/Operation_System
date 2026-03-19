// BandobastPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOperations } from '../store/slices/operationSlice';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';

export function BandobastPage() {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.operations);
  useEffect(() => { dispatch(fetchOperations({ type: 'bandobast' })); }, [dispatch]);
  const bandobast = list.filter(op => op.type === 'bandobast');

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">BANDOBAST OPERATIONS</h1><p className="page-sub">// CROWD &amp; EVENT MANAGEMENT</p></div>
      </div>
      <div className="grid-3 section">
        <StatCard label="Active Bandobast" value={bandobast.filter(b=>b.status==='active').length} color="accent" />
        <StatCard label="Officers Deployed" value={bandobast.reduce((s,b)=>s+(+b.assigned_officers||0),0)} color="green" />
        <StatCard label="Upcoming (48h)" value={bandobast.filter(b=>b.status==='pending').length} color="orange" />
      </div>
      <div className="panel">
        <div className="panel-header"><span className="panel-title">Bandobast Register</span></div>
        <table className="table">
          <thead><tr><th>Op Code</th><th>Event</th><th>Location</th><th>Officers</th><th>Status</th></tr></thead>
          <tbody>
            {bandobast.map(b => (
              <tr key={b.id}>
                <td className="mono accent">{b.op_code}</td>
                <td>{b.name}</td>
                <td>{b.location}</td>
                <td>{b.assigned_officers || 0} / {b.officers_required}</td>
                <td><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default BandobastPage;
