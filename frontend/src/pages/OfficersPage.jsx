import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOfficers, fetchOfficerStats } from '../store/slices/officerSlice';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';

export default function OfficersPage() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector(state => state.officers);

  useEffect(() => {
    dispatch(fetchOfficers());
    dispatch(fetchOfficerStats());
  }, [dispatch]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">OFFICER MANAGEMENT</h1>
          <p className="page-sub">// PERSONNEL REGISTER &amp; DUTY STATUS</p>
        </div>
        <button className="btn btn-primary">+ ADD OFFICER</button>
      </div>
      <div className="grid-4 section">
        <StatCard label="On Duty"   value={stats?.on_duty  || 0} color="green"  />
        <StatCard label="Available" value={stats?.available|| 0} color="accent" />
        <StatCard label="On Leave"  value={stats?.on_leave || 0} color="orange" />
        <StatCard label="Sick"      value={stats?.sick     || 0} color="red"    />
      </div>
      <div className="panel">
        <div className="panel-header"><span className="panel-title">Officer Register</span></div>
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead><tr><th>Badge</th><th>Name</th><th>Rank</th><th>Role</th><th>Sector</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(officer => (
                <tr key={officer.id}>
                  <td className="mono accent">{officer.badge_number}</td>
                  <td>{officer.name}</td>
                  <td>{officer.rank}</td>
                  <td className="capitalize">{officer.role?.replace('_', ' ')}</td>
                  <td>{officer.sector}</td>
                  <td><StatusBadge status={officer.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
