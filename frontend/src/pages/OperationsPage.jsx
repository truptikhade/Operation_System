// OperationsPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOperations } from '../store/slices/operationSlice';
import OperationsTable from '../components/operations/OperationsTable';

export default function OperationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector(state => state.operations);

  useEffect(() => { dispatch(fetchOperations()); }, [dispatch]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">ACTIVE OPERATIONS</h1>
          <p className="page-sub">// STATUS MONITORING</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/operations/new')}>+ NEW OPERATION</button>
      </div>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">All Operations</span>
          <span className="badge badge-active">{list.filter(op => op.status === 'active').length} ACTIVE</span>
        </div>
        {loading ? <div className="loading">Loading...</div> : <OperationsTable operations={list} />}
      </div>
    </div>
  );
}
