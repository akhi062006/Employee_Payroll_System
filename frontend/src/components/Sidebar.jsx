import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-logo">
        <i className="bi bi-wallet2"></i>
        <span>PAYROLL SYSTEM</span>
      </div>

      <div className="sidebar-menu">
        {user?.role === 'ADMIN' ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people"></i>
              <span>Employees</span>
            </NavLink>
            <NavLink to="/departments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-building"></i>
              <span>Departments</span>
            </NavLink>
            <NavLink to="/payroll" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-cash-stack"></i>
              <span>Payroll</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-file-earmark-bar-graph"></i>
              <span>Reports</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/payroll" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-cash-coin"></i>
              <span>My Salary Slips</span>
            </NavLink>
          </>
        )}

        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-circle"></i>
          <span>My Profile</span>
        </NavLink>
        <NavLink to="/change-password" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-shield-lock"></i>
          <span>Change Password</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user mb-2">
            <div className="sidebar-user-avatar">
              {getInitials(user.username)}
            </div>
            <div className="overflow-hidden">
              <div className="text-white fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                {user.username}
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-teal w-100 d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
