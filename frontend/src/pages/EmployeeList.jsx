import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  
  // Pagination & Sorting States
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('employeeCode');
  const [direction, setDirection] = useState('asc');
  
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentId, status, page, size, sortBy, direction]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees', {
        params: {
          search: search || undefined,
          departmentId: departmentId || undefined,
          status: status || undefined,
          page,
          size,
          sortBy,
          direction,
        },
      });
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete employee ${code}? This action cannot be undone.`)) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success(`Employee ${code} deleted successfully.`);
        fetchEmployees();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to delete employee profile.');
      }
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setDirection('asc');
    }
    setPage(0); // reset to first page on sort change
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted ms-1" style={{ fontSize: '0.8rem' }}></i>;
    return direction === 'asc' 
      ? <i className="bi bi-sort-up text-teal-primary ms-1"></i>
      : <i className="bi bi-sort-down text-teal-primary ms-1"></i>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Employee Management</h2>
          <p className="text-muted mb-0">Create, edit, search, and view employee profiles</p>
        </div>
        <Link to="/employees/add" className="btn btn-teal d-flex align-items-center gap-2">
          <i className="bi bi-person-plus-fill"></i> Add Employee
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card mb-4">
        <div className="row g-3">
          <div className="col-lg-4 col-md-6">
            <label className="form-label">Search Employees</label>
            <div className="input-group">
              <span className="input-group-text bg-primary border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, code, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          <div className="col-lg-3 col-md-3">
            <label className="form-label">Filter Department</label>
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(0); }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
              ))}
            </select>
          </div>

          <div className="col-lg-3 col-md-3">
            <label className="form-label">Filter Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="col-lg-2 col-md-12 d-flex align-items-end">
            <button
              className="btn btn-secondary-custom w-100"
              onClick={() => { setSearch(''); setDepartmentId(''); setStatus(''); setPage(0); }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="glass-card">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-teal-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people text-secondary" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No employees found</h5>
            <p className="small">Try adjusting search query or filter tags</p>
          </div>
        ) : (
          <>
            <div className="table-custom-container">
              <table className="table table-custom">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('employeeCode')} style={{ cursor: 'pointer' }}>
                      Code {renderSortIcon('employeeCode')}
                    </th>
                    <th onClick={() => toggleSort('firstName')} style={{ cursor: 'pointer' }}>
                      Full Name {renderSortIcon('firstName')}
                    </th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th onClick={() => toggleSort('basicSalary')} style={{ cursor: 'pointer' }} className="text-end">
                      Basic Salary {renderSortIcon('basicSalary')}
                    </th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="fw-bold text-white">{emp.employeeCode}</td>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department ? emp.department.departmentName : 'N/A'}</td>
                      <td>{emp.designation}</td>
                      <td className="text-end">Rs. {emp.basicSalary ? emp.basicSalary.toLocaleString('en-IN') : '0.00'}</td>
                      <td>
                        <span className={emp.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Link to={`/employees/details/${emp.id}`} className="btn btn-sm btn-outline-info" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/employees/edit/${emp.id}`} className="btn btn-sm btn-outline-warning" title="Edit Profile">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button onClick={() => handleDelete(emp.id, emp.employeeCode)} className="btn btn-sm btn-outline-danger" title="Delete Profile">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
              <div className="text-muted small">
                Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
              </div>

              <div className="d-flex align-items-center gap-3">
                {/* Size Selector */}
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Show:</span>
                  <select
                    className="form-select form-select-sm bg-primary border-secondary text-white"
                    style={{ width: '70px' }}
                    value={size}
                    onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>

                {/* Page Nav */}
                <nav aria-label="Page navigation">
                  <ul className="pagination pagination-sm m-0">
                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                      <button className="page-link bg-secondary border-secondary text-white" onClick={() => setPage(page - 1)}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                        <button 
                          className={`page-link border-secondary ${page === i ? 'bg-teal-primary text-white border-teal-primary' : 'bg-secondary text-white'}`} 
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages - 1 || totalPages === 0 ? 'disabled' : ''}`}>
                      <button className="page-link bg-secondary border-secondary text-white" onClick={() => setPage(page + 1)}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
