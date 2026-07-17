import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-teal-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center mt-5 text-muted">No stats found.</div>;

  // Chart 1: Department-wise Employee Doughnut Chart
  const deptData = {
    labels: stats.departmentWiseEmployees.map((d) => d.name),
    datasets: [
      {
        data: stats.departmentWiseEmployees.map((d) => d.count),
        backgroundColor: ['#0d9488', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  // Chart 2: Salary Distribution Bar Chart
  const salaryKeys = Object.keys(stats.salaryDistribution);
  const salaryData = {
    labels: salaryKeys,
    datasets: [
      {
        label: 'Employees Count',
        data: salaryKeys.map((k) => stats.salaryDistribution[k]),
        backgroundColor: 'rgba(13, 148, 136, 0.7)',
        borderColor: '#0d9488',
        borderWidth: 1.5,
      },
    ],
  };

  // Chart 3: Monthly Payroll Expense Trend Line Chart
  const trendData = {
    labels: stats.monthlyPayrollTrend.map((t) => t.month),
    datasets: [
      {
        label: 'Monthly Net Expenditures (Rs.)',
        data: stats.monthlyPayrollTrend.map((t) => t.expense),
        fill: true,
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        borderColor: '#0d9488',
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#1e293b',
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f8fafc',
          font: { family: 'Outfit' },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
      },
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#f8fafc',
          font: { family: 'Outfit' },
        },
      },
    },
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Overview of organization health and metrics</p>
        </div>
        <button onClick={fetchStats} className="btn btn-teal d-flex align-items-center gap-2">
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="row">
        <div className="col-md-3 col-sm-6">
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h6>Total Employees</h6>
              <h3>{stats.totalEmployees}</h3>
            </div>
            <div className="metric-icon-box metric-icon-teal">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h6>Active Status</h6>
              <h3>{stats.activeEmployees}</h3>
            </div>
            <div className="metric-icon-box metric-icon-teal">
              <i className="bi bi-person-check-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h6>Departments</h6>
              <h3>{stats.totalDepartments}</h3>
            </div>
            <div className="metric-icon-box metric-icon-gold">
              <i className="bi bi-building"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h6>Total Salaries Paid</h6>
              <h3 style={{ fontSize: '1.45rem' }}>Rs. {stats.totalSalaryPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="metric-icon-box metric-icon-gold">
              <i className="bi bi-currency-rupee"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row">
        {/* Monthly Payroll Line Chart */}
        <div className="col-lg-8">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-4">Monthly Payroll Expenses</h5>
            <div style={{ height: '320px' }}>
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Department-wise Employees Doughnut Chart */}
        <div className="col-lg-4">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-4">Department-wise Headcount</h5>
            <div style={{ height: '320px' }}>
              <Doughnut data={deptData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Salary Distribution Bar Chart */}
        <div className="col-lg-6">
          <div className="glass-card">
            <h5 className="text-white fw-semibold mb-4">Salary Distribution (Basic)</h5>
            <div style={{ height: '300px' }}>
              <Bar data={salaryData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="col-lg-6">
          <div className="glass-card d-flex flex-column justify-content-between" style={{ minHeight: '348px' }}>
            <div>
              <h5 className="text-white fw-semibold mb-3">Executive Summary</h5>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                The payroll system is currently managing <strong>{stats.totalEmployees} employees</strong> allocated across <strong>{stats.totalDepartments} departments</strong>. 
                Out of these, <strong>{stats.activeEmployees}</strong> are actively receiving salaries.
              </p>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                The total historical payout represents <strong>Rs. {stats.totalSalaryPaid.toLocaleString('en-IN')}</strong>. 
                The current monthly commitment is estimated at <strong>Rs. {stats.monthlyPayroll.toLocaleString('en-IN')}</strong>.
              </p>
            </div>
            <div className="border-top border-secondary pt-3 mt-3 d-flex align-items-center justify-content-between">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Status: Fully Balanced</span>
              <span className="badge bg-success text-white">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
