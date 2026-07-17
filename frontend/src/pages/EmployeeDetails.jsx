import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeAndPayroll();
  }, [id]);

  const fetchEmployeeAndPayroll = async () => {
    setLoading(true);
    try {
      // Fetch employee profile details
      const empRes = await api.get(`/employees/${id}`);
      setEmployee(empRes.data);

      // Fetch employee's payroll history list
      const payRes = await api.get(`/payroll/employee/${id}`);
      setPayrolls(payRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employee file.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  const handleDownloadPdf = async (payrollId, month, year) => {
    try {
      const response = await api.get(`/payroll/slip/${payrollId}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `salary_slip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download salary slip PDF.');
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

  if (!employee) return <div className="text-center mt-5 text-muted">Employee profile not found.</div>;

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link to="/employees" className="btn btn-secondary-custom me-3 py-2">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
        <div>
          <h2 className="text-white fw-bold mb-1">Employee Profile</h2>
          <p className="text-muted mb-0">Detailed file for employee {employee.employeeCode}</p>
        </div>
      </div>

      <div className="row">
        {/* Profile Card Summary */}
        <div className="col-lg-4 mb-4">
          <div className="glass-card text-center py-4">
            <div 
              className="mx-auto border border-secondary rounded-circle d-flex align-items-center justify-content-center overflow-hidden bg-primary mb-3"
              style={{ width: '130px', height: '130px' }}
            >
              {employee.photoPath ? (
                <img 
                  src={`http://localhost:8080${employee.photoPath}`} 
                  alt="Avatar" 
                  className="w-100 h-100 object-fit-cover" 
                />
              ) : (
                <i className="bi bi-person text-secondary" style={{ fontSize: '4rem' }}></i>
              )}
            </div>
            <h4 className="text-white fw-bold mb-1">{employee.firstName} {employee.lastName}</h4>
            <p className="text-teal-primary fw-medium mb-2">{employee.designation}</p>
            <span className={employee.status === 'ACTIVE' ? 'badge-active mb-3 d-inline-block' : 'badge-inactive mb-3 d-inline-block'}>
              {employee.status}
            </span>

            <div className="border-top border-secondary pt-3 mt-3 text-start px-2">
              <div className="row g-2 small mb-2">
                <div className="col-5 text-muted">Department:</div>
                <div className="col-7 text-white fw-medium">{employee.department?.departmentName || 'N/A'}</div>
              </div>
              <div className="row g-2 small mb-2">
                <div className="col-5 text-muted">Employee Code:</div>
                <div className="col-7 text-white fw-bold">{employee.employeeCode}</div>
              </div>
              <div className="row g-2 small mb-2">
                <div className="col-5 text-muted">Joining Date:</div>
                <div className="col-7 text-white fw-medium">{employee.joiningDate || 'N/A'}</div>
              </div>
              <div className="row g-2 small">
                <div className="col-5 text-muted">Basic Salary:</div>
                <div className="col-7 text-white fw-medium">Rs. {employee.basicSalary?.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="mt-4">
              <Link to={`/employees/edit/${employee.id}`} className="btn btn-teal w-100">
                <i className="bi bi-pencil me-2"></i> Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Details & Payroll History Tabs */}
        <div className="col-lg-8">
          {/* Detailed Info Card */}
          <div className="glass-card mb-4">
            <h5 className="text-white fw-semibold mb-3 border-bottom border-secondary pb-2">Personal Information</h5>
            <div className="row g-3">
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
              <div className="col-12">
                <label className="text-muted d-block small">Residential Address</label>
                <span className="text-white" style={{ whiteSpace: 'pre-line' }}>{employee.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payroll History Card */}
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-3 border-bottom border-secondary pb-2">Salary Slip History</h5>
            {payrolls.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-cash-stack text-secondary fs-3 d-block mb-2"></i>
                No payroll logs generated for this employee yet.
              </div>
            ) : (
              <div className="table-custom-container">
                <table className="table table-custom table-sm">
                  <thead>
                    <tr>
                      <th>Month/Year</th>
                      <th className="text-end">Gross Salary</th>
                      <th className="text-end">Deductions</th>
                      <th className="text-end">Net Pay</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((p) => {
                      const totalDeductions = p.pf + p.tax + p.insurance;
                      return (
                        <tr key={p.id}>
                          <td className="fw-medium text-white">{getMonthName(p.month)} {p.year}</td>
                          <td className="text-end text-success">Rs. {p.grossSalary.toLocaleString('en-IN')}</td>
                          <td className="text-end text-danger">Rs. {totalDeductions.toLocaleString('en-IN')}</td>
                          <td className="text-end text-white fw-bold">Rs. {p.netSalary.toLocaleString('en-IN')}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDownloadPdf(p.id, p.month, p.year)}
                              className="btn btn-sm btn-outline-teal py-0 px-2"
                              title="Download PDF Salary Slip"
                            >
                              <i className="bi bi-file-earmark-pdf"></i> PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

export default EmployeeDetails;
