import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  const getTodayDateString = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary mb-4 px-4 py-2 border-bottom border-secondary rounded-3">
      <div className="container-fluid p-0">
        <span className="navbar-brand text-muted fs-6 d-none d-md-inline">
          <i className="bi bi-calendar3 me-2"></i>
          {getTodayDateString()}
        </span>

        <div className="d-flex align-items-center ms-auto">
          {user && (
            <div className="text-end me-3">
              <span className="text-light fw-bold d-block" style={{ fontSize: '0.9rem' }}>
                Welcome, {user.username}
              </span>
              <span className="badge bg-dark text-teal border border-secondary" style={{ fontSize: '0.75rem' }}>
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
