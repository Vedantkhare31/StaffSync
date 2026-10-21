import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function HRTraining() {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const initialForm = {
    title: '',
    description: '',
    department: 'General',
    instructor: '',
    startDate: '',
    endDate: '',
    assignedEmployees: []
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainRes, empRes] = await Promise.all([
        axios.get('/api/training', { params: { status } }),
        axios.get('/api/employees')
      ]);

      if (trainRes.data.success) setTrainings(trainRes.data.trainings);
      if (empRes.data.success) setEmployees(empRes.data.employees);
    } catch (err) {
      console.error('Error fetching training data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/training', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData(initialForm);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create training program');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/api/training/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training program?')) {
      try {
        await axios.delete(`/api/training/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete training');
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Training & Development Catalog" subtitle="Organization-wide skill development, certifications, and compliance" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Training Modules ({trainings.length})</span>
              <button onClick={() => { setFormData(initialForm); setError(''); setShowModal(true); }} className="btn btn-primary">
                + Schedule Training Program
              </button>
            </div>

            <div className="filter-bar">
              <div style={{ width: '200px' }}>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title & Description</th>
                    <th>Department</th>
                    <th>Instructor</th>
                    <th>Timeline</th>
                    <th>Enrolled</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading training catalog...
                      </td>
                    </tr>
                  ) : trainings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No training programs found.
                      </td>
                    </tr>
                  ) : (
                    trainings.map((t) => (
                      <tr key={t._id}>
                        <td style={{ maxWidth: '320px' }}>
                          <strong>{t.title}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {t.description}
                          </div>
                        </td>
                        <td>{t.department}</td>
                        <td>{t.instructor}</td>
                        <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(t.startDate).toLocaleDateString()} to {new Date(t.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <strong>{t.assignedEmployees?.length || 0}</strong> staff
                        </td>
                        <td>
                          <span className={`badge badge-${t.status === 'completed' ? 'approved' : t.status === 'in-progress' ? 'pending' : 'neutral'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <select
                            className="form-select"
                            style={{ width: '130px', display: 'inline-block', fontSize: '11px', padding: '4px' }}
                            value={t.status}
                            onChange={(e) => handleStatusUpdate(t._id, e.target.value)}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="btn btn-danger btn-sm"
                            style={{ marginLeft: '6px' }}
                          >
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

      {/* Schedule Training Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule New Training Program"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="training-form" type="submit" className="btn btn-primary">
              Save Program
            </button>
          </>
        }
      >
        {error && <div className="alert-danger">{error}</div>}
        <form id="training-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Program Title *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. AWS Solutions Architect Preparation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="General">General / All</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lead Instructor</label>
              <input
                type="text"
                className="form-control"
                placeholder="Instructor Name"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Curriculum / Program Description *</label>
            <textarea
              className="form-control"
              rows="3"
              required
              placeholder="Outline objectives, modules, and completion criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Personnel (Select Multiple)</label>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-dark)', padding: '8px', borderRadius: '3px' }}>
              {employees.map((emp) => (
                <label key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.assignedEmployees.includes(emp._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assignedEmployees: [...formData.assignedEmployees, emp._id] });
                      } else {
                        setFormData({
                          ...formData,
                          assignedEmployees: formData.assignedEmployees.filter((id) => id !== emp._id)
                        });
                      }
                    }}
                  />
                  <span><strong>{emp.firstName} {emp.lastName}</strong> ({emp.department} - {emp.employeeId})</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
