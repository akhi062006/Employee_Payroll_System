import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetails from './pages/EmployeeDetails';
import DepartmentList from './pages/DepartmentList';
import PayrollList from './pages/PayrollList';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

// Bootstrap CSS & Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 404 Page Component
const NotFound = () => (
  <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-dark text-white">
    <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
    <h1 className="display-4 fw-bold mt-2">404 - Page Not Found</h1>
    <p className="text-secondary">The requested page does not exist or you lack permission to view it.</p>
    <a href="/" className="btn btn-teal mt-3">Return to Home</a>
  </div>
);

// Main Grid Layout wrapping Side + Nav + Content
const Layout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content d-flex flex-column">
        <Navbar />
        <div className="flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Layout Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/employees" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><EmployeeList /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/employees/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><EmployeeForm /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/employees/edit/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><EmployeeForm /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/employees/details/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <Layout><EmployeeDetails /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/departments" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><DepartmentList /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/payroll" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <Layout><PayrollList /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/change-password" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <Layout><ChangePassword /></Layout>
        </ProtectedRoute>
      } />

      {/* Redirect base / path to dashboard or payroll list depending on roles */}
      <Route path="/" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/dashboard" replace /> : <Navigate to="/payroll" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
