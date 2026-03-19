import React from 'react';
import { useDispatch } from 'react-redux';
import { updateOperationStatus } from '../../store/slices/operationSlice';
import StatusBadge from '../common/StatusBadge';

export default function OperationsTable({ operations = [], compact = false }) {
  const dispatch = useDispatch();

  function handleStatusChange(id, status) {
    dispatch(updateOperationStatus({ id, status }));
  }

  if (!operations.length) {
    return <div className="empty-state">No operations found</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Op ID</th>
          <th>Name</th>
          <th>Type</th>
          {!compact && <th>Location</th>}
          <th>Officers</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {operations.map(op => (
          <tr key={op.id}>
            <td className="mono accent">{op.op_code}</td>
            <td>{op.name}</td>
            <td className="capitalize">{op.type}</td>
            {!compact && <td>{op.location}</td>}
            <td>{op.assigned_officers || 0} / {op.officers_required}</td>
            <td><StatusBadge status={op.status} /></td>
            <td>
              {op.status === 'pending' && (
                <button className="btn btn-sm btn-primary"
                  onClick={() => handleStatusChange(op.id, 'active')}>
                  ACTIVATE
                </button>
              )}
              {op.status === 'active' && (
                <button className="btn btn-sm btn-outline"
                  onClick={() => handleStatusChange(op.id, 'closed')}>
                  CLOSE
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
