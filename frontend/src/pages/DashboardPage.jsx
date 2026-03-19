import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOperations } from '../store/slices/operationSlice';
import { fetchAlerts } from '../store/slices/alertSlice';
import { fetchOfficerStats } from '../store/slices/officerSlice';
import StatCard from '../components/dashboard/StatCard';
import OperationsTable from '../components/operations/OperationsTable';
import AlertFeed from '../components/alerts/AlertFeed';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { list: operations } = useSelector(state => state.operations);
  const { list: alerts } = useSelector(state => state.alerts);
  const { stats } = useSelector(state => state.officers);

  useEffect(() => {
    dispatch(fetchOperations({ status: 'active' }));
    dispatch(fetchAlerts({ is_resolved: false }));
    dispatch(fetchOfficerStats());
  }, [dispatch]);

  const activeOps = operations.filter(op => op.status === 'active');
  const pendingOps = operations.filter(op => op.status === 'pending');
  const criticalAlerts = alerts.filter(a => ['critical', 'high'].includes(a.severity));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">OPERATIONS DASHBOARD</h1>
          <p className="page-sub">// REAL-TIME OVERVIEW — PUNE DISTRICT</p>
        </div>
        <button className="btn btn-primary" onClick={() => { dispatch(fetchOperations()); dispatch(fetchAlerts()); }}>
          ⟳ REFRESH
        </button>
      </div>

      <div className="grid-4 section">
        <StatCard label="Active Operations" value={activeOps.length} color="accent" />
        <StatCard label="Officers on Duty" value={stats?.on_duty || 0} color="green" meta={`${stats?.total || 0} total`} />
        <StatCard label="Pending Assignments" value={pendingOps.length} color="orange" />
        <StatCard label="Active Alerts" value={criticalAlerts.length} color="red" />
      </div>

      <div className="grid-2 section">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Active Operations</span>
          </div>
          <OperationsTable operations={activeOps.slice(0, 5)} compact />
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Alert Feed</span>
            <span className="badge badge-alert">{criticalAlerts.length} NEW</span>
          </div>
          <AlertFeed alerts={alerts.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
