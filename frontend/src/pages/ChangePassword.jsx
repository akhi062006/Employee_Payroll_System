import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to change password. Please verify current credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">Change Password</h2>
        <p className="text-muted mb-0">Update account credentials for security</p>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-4 pb-2 border-bottom border-secondary">Security Settings</h5>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-teal w-100 py-2" disabled={submitting}>
                {submitting ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Password Info Tips Card */}
        <div className="col-lg-6">
          <div className="glass-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="text-white fw-semibold mb-3">Security Guidelines</h5>
              <ul className="text-secondary small ps-3" style={{ lineHeight: '1.8' }}>
                <li className="mb-2">Ensure your new password contains at least 6 characters.</li>
                <li className="mb-2">Avoid using obvious personal info (names, dates, or sequences).</li>
                <li className="mb-2">Use a mix of letters, numbers, and symbols for high strength.</li>
                <li className="mb-2">Change your password periodically to guarantee data safety.</li>
              </ul>
            </div>
            <div className="alert alert-dark bg-primary text-secondary border border-secondary m-0 mt-4 d-flex align-items-center gap-3">
              <i className="bi bi-info-circle-fill text-gold-accent fs-4"></i>
              <div className="small">
                Updating your password here modifies the system database records immediately. Use the new credentials on your next login session.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
