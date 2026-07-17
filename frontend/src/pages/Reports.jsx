import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [empFormat, setEmpFormat] = useState('excel');
  const [payFormat, setPayFormat] = useState('excel');
  
  const [downloadingEmp, setDownloadingEmp] = useState(false);
  const [downloadingPay, setDownloadingPay] = useState(false);

  const handleDownloadEmployees = async () => {
    setDownloadingEmp(true);
    try {
      const extension = empFormat === 'excel' ? 'xlsx' : 'csv';
      const response = await api.get(`/reports/employees/${empFormat}`, {
        responseType: 'blob',
      });
      
      const file = new Blob([response.data], { 
        type: empFormat === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });

      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `employees_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Employee report downloaded successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download employee report.');
    } finally {
      setDownloadingEmp(false);
    }
  };

  const handleDownloadPayroll = async () => {
    setDownloadingPay(true);
    try {
      const extension = payFormat === 'excel' ? 'xlsx' : 'csv';
      const response = await api.get(`/reports/payroll/${payFormat}`, {
        responseType: 'blob',
      });
      
      const file = new Blob([response.data], { 
        type: payFormat === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });

      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `payroll_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Payroll report downloaded successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download payroll report.');
    } finally {
      setDownloadingPay(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">Reports & Exports</h2>
        <p className="text-muted mb-0">Download directories and monthly spreadsheets in Excel or CSV formats</p>
      </div>

      <div className="row g-4">
        {/* Employee Report Card */}
        <div className="col-md-6">
          <div className="glass-card d-flex flex-column justify-content-between h-100">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="metric-icon-box metric-icon-teal" style={{ width: '48px', height: '48px', borderRadius: '8px' }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <h5 className="text-white fw-semibold mb-0">Employee Directory Report</h5>
              </div>
              <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                Generates a master sheet containing all registered employee data (Code, Full Name, Contact Details, Designation, Department, Base Salary, Status, and Date of Joining).
              </p>
              
              <div className="mb-4">
                <label className="form-label">Export Format</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="empFormat" 
                      id="empExcel" 
                      value="excel"
                      checked={empFormat === 'excel'}
                      onChange={() => setEmpFormat('excel')}
                    />
                    <label className="form-check-label text-white small" htmlFor="empExcel">
                      Microsoft Excel (.xlsx)
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="empFormat" 
                      id="empCsv" 
                      value="csv"
                      checked={empFormat === 'csv'}
                      onChange={() => setEmpFormat('csv')}
                    />
                    <label className="form-check-label text-white small" htmlFor="empCsv">
                      Comma Separated Values (.csv)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDownloadEmployees}
              className="btn btn-teal w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={downloadingEmp}
            >
              {downloadingEmp ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-download"></i>
              )}
              Download Sheet
            </button>
          </div>
        </div>

        {/* Payroll Report Card */}
        <div className="col-md-6">
          <div className="glass-card d-flex flex-column justify-content-between h-100">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="metric-icon-box metric-icon-gold" style={{ width: '48px', height: '48px', borderRadius: '8px' }}>
                  <i className="bi bi-cash-stack"></i>
                </div>
                <h5 className="text-white fw-semibold mb-0">Payroll Expenditures Report</h5>
              </div>
              <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                Generates a sheet of compiled historical salary computations (Base Salary, HRA, DA, PF contributions, insurance deductions, professional taxes, and computed gross and net payouts).
              </p>
              
              <div className="mb-4">
                <label className="form-label">Export Format</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="payFormat" 
                      id="payExcel" 
                      value="excel"
                      checked={payFormat === 'excel'}
                      onChange={() => setPayFormat('excel')}
                    />
                    <label className="form-check-label text-white small" htmlFor="payExcel">
                      Microsoft Excel (.xlsx)
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="payFormat" 
                      id="payCsv" 
                      value="csv"
                      checked={payFormat === 'csv'}
                      onChange={() => setPayFormat('csv')}
                    />
                    <label className="form-check-label text-white small" htmlFor="payCsv">
                      Comma Separated Values (.csv)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDownloadPayroll}
              className="btn btn-teal w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={downloadingPay}
            >
              {downloadingPay ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-download"></i>
              )}
              Download Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
