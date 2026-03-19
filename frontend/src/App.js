import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OperationsPage from './pages/OperationsPage';
import PlanOperationPage from './pages/PlanOperationPage';
import BandobastPage from './pages/BandobastPage';
import PatrollingPage from './pages/PatrollingPage';
import OfficersPage from './pages/OfficersPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';

function PrivateRoute({ children }) {
  const { token } = useSelector(state => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="operations/new" element={<PlanOperationPage />} />
          <Route path="bandobast" element={<BandobastPage />} />
          <Route path="patrolling" element={<PatrollingPage />} />
          <Route path="officers" element={<OfficersPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
