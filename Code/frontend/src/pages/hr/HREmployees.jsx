import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [modalError, setModalError] = useState('');

  // Add form state
  const initialForm = {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    salary: '',
    managerName: '',
    status: 'active',
    createAccount: true,
    accountPassword: 'password123',
    accountRole: 'employee'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/employees', {
        params: { search, department, status }
      });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await axios.post('/api/employees', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData(initialForm);
        fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create employee record');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await axios.put(`/api/employees/${selectedEmp._id}`, selectedEmp);
      if (res.data.success) {
        setShowEditModal(false);
        setSelectedEmp(null);
        fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDelete = async (emp) => {
    if (window.confirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName} (${emp.employeeId})? This will also remove any linked user login.`)) {
      try {
        await axios.delete(`/api/employees/${emp._id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmp({ ...emp });
    setModalError('');
    setShowEditModal(true);
  };

  const departmentsList = [
    'All',
    'Engineering',
    'Human Resources',
    'Sales',
    'Marketing',
    'Finance',
    'Operations',
    'Customer Support'
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Directory" subtitle="Organization personnel database and role assignment" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Employee Records ({employees.length})</span>
              <button onClick={() => { setFormData(initialForm); setModalError(''); setShowAddModal(true); }} className="btn btn-primary">
                + Register New Employee
              </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div style={{ flex: '1', minWidth: '220px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, ID, position, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ width: '180px' }}>
                <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: '140px' }}>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Email / Phone</th>
                    <th>Status</th>
                    <th>Salary</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading employee records...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No employee records found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{emp.employeeId}</td>
                        <td>
                          <strong>{emp.firstName} {emp.lastName}</strong>
                          {emp.managerName && emp.managerName !== 'Unassigned' && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mgr: {emp.managerName}</div>
                          )}
                        </td>
                        <td>{emp.department}</td>
                        <td>{emp.position}</td>
                        <td>
                          <div>{emp.email}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.phone || '-'}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${emp.status}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          ${emp.salary ? Number(emp.salary).toLocaleString() : '0'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openEditModal(emp)} className="btn btn-secondary btn-sm" style={{ marginRight: '6px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(emp)} className="btn btn-danger btn-sm">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Employee"
        footer={
          <>
            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="add-employee-form" type="submit" className="btn btn-primary">
              Save Employee Record
            </button>
          </>
        }
      >
        {modalError && <div className="alert-danger">{modalError}</div>}
        <form id="add-employee-form" onSubmit={handleAddSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="EMP-1006"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departmentsList.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Position / Job Title *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Software Engineer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="form-control"
                placeholder="75000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned Manager</label>
              <input
                type="text"
                className="form-control"
                placeholder="Marcus Sterling"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={formData.createAccount}
                onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
              />
              Generate User Account Login Credentials
            </label>

            {formData.createAccount && (
              <div className="form-row" style={{ marginTop: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select
                    className="form-select"
                    value={formData.accountRole}
                    onChange={(e) => setFormData({ ...formData, accountRole: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Personnel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.accountPassword}
                    onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      {selectedEmp && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Employee Record: ${selectedEmp.employeeId}`}
          footer={
            <>
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button form="edit-employee-form" type="submit" className="btn btn-primary">
                Update Record
              </button>
            </>
          }
        >
          {modalError && <div className="alert-danger">{modalError}</div>}
          <form id="edit-employee-form" onSubmit={handleEditSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={selectedEmp.firstName}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={selectedEmp.lastName}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={selectedEmp.department}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, department: e.target.value })}
                >
                  {departmentsList.filter((d) => d !== 'All').map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Position</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={selectedEmp.position}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, position: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Salary ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedEmp.salary}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, salary: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedEmp.status}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedEmp.phone || ''}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reporting Manager</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedEmp.managerName || ''}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, managerName: e.target.value })}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
