import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PayrollList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payout Generation Inputs
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  // Table Filter
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payroll');
      setPayrolls(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payroll history.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.post(`/payroll/generate`, null, {
        params: {
          month: genMonth,
          year: genYear,
        },
      });
      toast.success('Payroll generated successfully for all active employees!');
      setShowGenModal(false);
      fetchPayrolls();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id, empCode, month, year) => {
    if (window.confirm(`Are you sure you want to delete payroll record for ${empCode} (${getMonthName(month)} ${year})?`)) {
      try {
        await api.delete(`/payroll/${id}`);
        toast.success('Payroll record deleted successfully.');
        fetchPayrolls();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete payroll record.');
      }
    }
  };

  const handleDownloadPdf = async (id, empCode, month, year) => {
    try {
      const response = await api.get(`/payroll/slip/${id}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `salary_slip_${empCode}_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF salary slip.');
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // Filter computations
  const filteredPayrolls = payrolls.filter((p) => {
    if (filterMonth && p.month !== Number(filterMonth)) return false;
    if (filterYear && p.year !== Number(filterYear)) return false;
    return true;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">
            {isAdmin ? 'Payroll History' : 'My Salary Slips'}
          </h2>
          <p className="text-muted mb-0">
            {isAdmin 
              ? 'Calculate organization payouts, verify gross salaries, and view historical slips' 
              : 'Browse details and download official printable salary slips'}
          </p>
        </div>
        {isAdmin && (
          <button 
            className="btn btn-teal d-flex align-items-center gap-2"
            onClick={() => setShowGenModal(true)}
          >
            <i className="bi bi-gear-fill"></i> Generate Monthly Payroll
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="glass-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Filter Month</label>
            <select 
              className="form-select"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Filter Year</label>
            <input 
              type="number"
              className="form-control"
              placeholder="e.g. 2026"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-secondary-custom w-100"
              onClick={() => { setFilterMonth(''); setFilterYear(''); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="glass-card">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-teal-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-wallet2 text-secondary fs-2 d-block mb-2"></i>
            No payroll records match the filters.
          </div>
        ) : (
          <div className="table-custom-container">
            <table className="table table-custom">
              <thead>
                <tr>
                  {isAdmin && <th>Emp Code</th>}
                  {isAdmin && <th>Employee Name</th>}
                  <th>Period</th>
                  <th className="text-end">Basic Salary</th>
                  <th className="text-end">Gross Payout</th>
                  <th className="text-end">Deductions</th>
                  <th className="text-end">Net Pay</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((p) => {
                  const deductions = p.pf + p.tax + p.insurance;
                  return (
                    <tr key={p.id}>
                      {isAdmin && <td className="fw-bold text-white">{p.employee.employeeCode}</td>}
                      {isAdmin && <td>{p.employee.firstName} {p.employee.lastName}</td>}
                      <td className="text-white fw-medium">{getMonthName(p.month)} {p.year}</td>
                      <td className="text-end">Rs. {p.basicSalary.toLocaleString('en-IN')}</td>
                      <td className="text-end text-success">Rs. {p.grossSalary.toLocaleString('en-IN')}</td>
                      <td className="text-end text-danger">Rs. {deductions.toLocaleString('en-IN')}</td>
                      <td className="text-end text-white fw-bold">Rs. {p.netSalary.toLocaleString('en-IN')}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            onClick={() => handleDownloadPdf(p.id, p.employee.employeeCode, p.month, p.year)}
                            className="btn btn-sm btn-outline-teal"
                            title="Download PDF"
                          >
                            <i className="bi bi-file-earmark-pdf-fill"></i> Download
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(p.id, p.employee.employeeCode, p.month, p.year)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Record"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payout Modal */}
      {showGenModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-secondary text-white border border-secondary shadow-lg">
              <div className="modal-header border-bottom border-dark">
                <h5 className="modal-title fw-bold text-teal-primary">Generate Monthly Payroll</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGenModal(false)}></button>
              </div>
              <form onSubmit={handleGeneratePayroll}>
                <div className="modal-body">
                  <p className="small text-muted mb-4">
                    This wizard processes and calculates the standard HRA, DA, tax deductions, and net salary payouts for all Active employees in the system. Existing records for the matching period will be updated.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Month</label>
                    <select 
                      className="form-select bg-primary border-secondary text-white"
                      value={genMonth}
                      onChange={(e) => setGenMonth(Number(e.target.value))}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Year</label>
                    <input 
                      type="number"
                      className="form-control bg-primary border-secondary text-white"
                      value={genYear}
                      onChange={(e) => setGenYear(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top border-dark">
                  <button type="button" className="btn btn-secondary-custom" onClick={() => setShowGenModal(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-teal" disabled={generating}>
                    {generating ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Run Computations
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollList;
