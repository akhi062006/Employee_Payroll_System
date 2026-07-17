import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-teal-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center mt-5 text-muted">No profile found.</div>;

  const { username, role, employee } = profile;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">My Profile</h2>
        <p className="text-muted mb-0">View account status and profile credentials</p>
      </div>

      <div className="row">
        {/* Account Details Card */}
        <div className="col-lg-4 mb-4">
          <div className="glass-card text-center py-4">
            <div 
              className="mx-auto border border-secondary rounded-circle d-flex align-items-center justify-content-center overflow-hidden bg-primary mb-3 text-white fw-bold fs-1"
              style={{ width: '100px', height: '100px', backgroundColor: '#0d9488' }}
            >
              {username.substring(0, 2).toUpperCase()}
            </div>
            <h4 className="text-white fw-bold mb-1">{username}</h4>
            <span className="badge bg-dark text-teal border border-secondary px-3 py-2 mb-3">
              {role}
            </span>
            <div className="border-top border-secondary pt-3 mt-3 text-start small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Account Status:</span>
                <span className="text-success fw-bold">Active</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Portal Domain:</span>
                <span className="text-white">Internal Intranet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee File Card (For Employee Role) */}
        <div className="col-lg-8">
          {employee ? (
            <div className="glass-card">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
                <div 
                  className="border border-secondary rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-primary"
                  style={{ width: '70px', height: '70px' }}
                >
                  {employee.photoPath ? (
                    <img 
                      src={`http://localhost:8080${employee.photoPath}`} 
                      alt="Profile Avatar" 
                      className="w-100 h-100 object-fit-cover" 
                    />
                  ) : (
                    <i className="bi bi-person text-secondary" style={{ fontSize: '2.5rem' }}></i>
                  )}
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-1">{employee.firstName} {employee.lastName}</h4>
                  <p className="text-teal-primary mb-0 small fw-medium">{employee.designation} | {employee.department?.departmentName || 'N/A'}</p>
                </div>
              </div>

              <h5 className="text-white fw-semibold mb-3">Profile Data</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Employee Code</label>
                  <span className="text-white fw-bold">{employee.employeeCode}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Email Address</label>
                  <span className="text-white">{employee.email}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Phone Number</label>
                  <span className="text-white">{employee.phone || 'N/A'}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Gender</label>
                  <span className="text-white">{employee.gender || 'N/A'}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Date of Birth</label>
                  <span className="text-white">{employee.dob || 'N/A'}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Joining Date</label>
                  <span className="text-white">{employee.joiningDate || 'N/A'}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Basic Salary Bracket</label>
                  <span className="text-white">Rs. {employee.basicSalary?.toLocaleString('en-IN')}</span>
                </div>
                <div className="col-sm-6">
                  <label className="text-muted d-block small">Employment Status</label>
                  <span className="badge bg-success">{employee.status}</span>
                </div>
                <div className="col-12">
                  <label className="text-muted d-block small">Residential Address</label>
                  <span className="text-white" style={{ whiteSpace: 'pre-line' }}>{employee.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <h5 className="text-white fw-semibold mb-3 pb-2 border-bottom border-secondary">Administrative Account Info</h5>
              <p className="text-secondary small" style={{ lineHeight: '1.6' }}>
                You are currently logged into an administrative account. Administrative accounts have full CRUD authority across employees, departments, payroll entries, and system reports.
              </p>
              <div className="alert alert-dark bg-primary text-secondary border border-secondary mt-3 d-flex align-items-center gap-3">
                <i className="bi bi-shield-fill-check text-teal-primary fs-4"></i>
                <div>
                  <div className="text-white fw-bold">Admin Permissions Assigned</div>
                  <div className="small">This user account is not linked to any specific employee salary profiles.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
