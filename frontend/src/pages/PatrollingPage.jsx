import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOperations } from '../store/slices/operationSlice';
import StatusBadge from '../components/common/StatusBadge';

export default function PatrollingPage() {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.operations);
  useEffect(() => { dispatch(fetchOperations({ type: 'patrolling' })); }, [dispatch]);
  const patrols = list.filter(op => op.type === 'patrolling');

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">PATROLLING OPERATIONS</h1><p className="page-sub">// BEAT &amp; ZONE PATROL MANAGEMENT</p></div>
        <button className="btn btn-primary">+ ASSIGN PATROL</button>
      </div>
      <div className="panel">
        <div className="panel-header"><span className="panel-title">Active Patrol Beats</span></div>
        <table className="table">
          <thead><tr><th>Op Code</th><th>Name</th><th>Sector</th><th>Officers</th><th>Status</th></tr></thead>
          <tbody>
            {patrols.map(p => (
              <tr key={p.id}>
                <td className="mono accent">{p.op_code}</td>
                <td>{p.name}</td>
                <td>{p.sector}</td>
                <td>{p.assigned_officers || 0}</td>
                <td><StatusBadge status={p.status} /></td>
              </tr>
            ))}
            {!patrols.length && <tr><td colSpan={5} className="empty-state">No active patrols</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
