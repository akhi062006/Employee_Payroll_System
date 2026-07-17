import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States (Add/Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (dept) => {
    setIsEditing(true);
    setEditingId(dept.id);
    setDepartmentName(dept.departmentName);
    setDescription(dept.description || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setDepartmentName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName) {
      toast.error('Department name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { departmentName, description };
      if (isEditing) {
        await api.put(`/departments/${editingId}`, payload);
        toast.success('Department updated successfully.');
      } else {
        await api.post('/departments', payload);
        toast.success('Department created successfully.');
      }
      handleCancel();
      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error occurred while saving department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" department?`)) {
      try {
        await api.delete(`/departments/${id}`);
        toast.success(`Department "${name}" deleted successfully.`);
        fetchDepartments();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Cannot delete department.');
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">Department Management</h2>
        <p className="text-muted mb-0">Create, view, edit, and delete company structural units</p>
      </div>

      <div className="row">
        {/* Department Entry Form Card */}
        <div className="col-lg-4 mb-4">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-3">
              {isEditing ? 'Modify Department' : 'Create Department'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sales"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Brief summary of department responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="d-flex gap-2">
                {isEditing && (
                  <button type="button" className="btn btn-secondary-custom w-50" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-teal w-100" disabled={submitting}>
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {isEditing ? 'Update Unit' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Departments List Table */}
        <div className="col-lg-8">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-3">Active Departments</h5>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-teal-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No departments defined. Use the input box to create one.
              </div>
            ) : (
              <div className="table-custom-container">
                <table className="table table-custom">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th style={{ width: '220px' }}>Department Name</th>
                      <th>Description</th>
                      <th className="text-center" style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id}>
                        <td className="fw-bold text-white">{dept.id}</td>
                        <td className="text-white fw-semibold">{dept.departmentName}</td>
                        <td className="text-truncate" style={{ maxWidth: '280px' }}>
                          {dept.description || 'No description provided.'}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => handleEditClick(dept)}
                              className="btn btn-sm btn-outline-warning"
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id, dept.departmentName)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;
