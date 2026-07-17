import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Field States
  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchDepartments();
    if (isEditMode) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load departments list.');
    }
  };

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/employees/${id}`);
      const emp = response.data;
      
      setEmployeeCode(emp.employeeCode || '');
      setFirstName(emp.firstName || '');
      setLastName(emp.lastName || '');
      setGender(emp.gender || 'Male');
      setDob(emp.dob || '');
      setEmail(emp.email || '');
      setPhone(emp.phone || '');
      setAddress(emp.address || '');
      setDepartmentId(emp.department?.id || '');
      setDesignation(emp.designation || '');
      setJoiningDate(emp.joiningDate || '');
      setBasicSalary(emp.basicSalary || '');
      setStatus(emp.status || 'ACTIVE');
      
      if (emp.photoPath) {
        setPhotoPreview(`http://localhost:8080${emp.photoPath}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employee details.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation checks
    if (!employeeCode || !firstName || !lastName || !email || !joiningDate || !basicSalary) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    const employeeData = {
      employeeCode,
      firstName,
      lastName,
      gender,
      dob: dob || null,
      email,
      phone,
      address,
      department: departmentId ? { id: Number(departmentId) } : null,
      designation,
      joiningDate: joiningDate || null,
      basicSalary: Number(basicSalary),
      status,
    };

    const formData = new FormData();
    formData.append('employee', JSON.stringify(employeeData));
    if (photo) {
      formData.append('photo', photo);
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/employees/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Employee profile updated successfully.');
      } else {
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Employee profile created successfully.');
      }
      navigate('/employees');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error occurred while saving profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link to="/employees" className="btn btn-secondary-custom me-3 py-2">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
        <div>
          <h2 className="text-white fw-bold mb-1">{isEditMode ? 'Edit Employee' : 'Add Employee'}</h2>
          <p className="text-muted mb-0">{isEditMode ? 'Modify employee information and status' : 'Register a new employee in the organization'}</p>
        </div>
      </div>

      <div className="glass-card">
        {loading && isEditMode ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-teal-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Photo Preview Panel */}
              <div className="col-md-3 mb-4 text-center border-end border-secondary">
                <div className="mb-3">
                  <label className="form-label d-block text-center">Profile Photo</label>
                  <div 
                    className="mx-auto border border-secondary rounded-circle d-flex align-items-center justify-content-center overflow-hidden bg-primary"
                    style={{ width: '150px', height: '150px', position: 'relative' }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Avatar Preview" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <i className="bi bi-person text-secondary" style={{ fontSize: '4.5rem' }}></i>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  id="photoUpload"
                  className="d-none"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="photoUpload" className="btn btn-sm btn-teal mt-2">
                  <i className="bi bi-upload me-2"></i> Select File
                </label>
              </div>

              {/* Form Input Fields */}
              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Employee Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. EMP001"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      required
                      disabled={isEditMode}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Lead Developer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Joining Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Basic Salary (Rs.) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 50000"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Employment Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Residential Address</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-secondary">
                  <Link to="/employees" className="btn btn-secondary-custom">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-teal px-4" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Save Employee
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;
