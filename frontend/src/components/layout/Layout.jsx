import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useClock } from '../../hooks/useClock';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { officer } = useSelector(state => state.auth);
  const { unresolved } = useSelector(state => ({
    unresolved: state.alerts.list.filter(a => !a.is_resolved).length
  }));
  const time = useClock();

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', group: 'Overview' },
    { to: '/alerts', label: 'Alerts', badge: unresolved || null, group: 'Overview' },
    { to: '/operations', label: 'Active Ops', group: 'Operations' },
    { to: '/operations/new', label: 'Plan Operation', group: 'Operations', roles: ['senior_planner'] },
    { to: '/bandobast', label: 'Bandobast', group: 'Operations' },
    { to: '/patrolling', label: 'Patrolling', group: 'Operations' },
    { to: '/officers', label: 'Officers', group: 'Management' },
    { to: '/reports', label: 'Reports', group: 'Management' },
  ];

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.includes(officer?.role)
  );

  const groups = [...new Set(visibleItems.map(i => i.group))];

  return (
    <div className="layout">
      {/* Topbar */}
      <header className="topbar">
        <div className="logo">
          <div className="logo-badge">⬡</div>
          <div>
            <div className="logo-text">POLOPS</div>
            <div className="logo-sub">POLICE OPERATIONS SYSTEM</div>
          </div>
        </div>
        <div className="topbar-status">
          <span className="live-dot" />
          SYSTEM ONLINE &nbsp;|&nbsp; PUNE DISTRICT HQ
        </div>
        <div className="topbar-right">
          <span className="clock">{time}</span>
          <div className="user-badge">
            <div className="user-avatar">{officer?.name?.charAt(0)}</div>
            <div>
              <div className="user-name">{officer?.name}</div>
              <div className="user-role">{officer?.role?.replace('_', ' ').toUpperCase()}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">⏻</button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        {groups.map(group => (
          <div key={group} className="nav-group">
            <div className="nav-label">{group}</div>
            {visibleItems.filter(i => i.group === group).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/operations'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.label}
                {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
