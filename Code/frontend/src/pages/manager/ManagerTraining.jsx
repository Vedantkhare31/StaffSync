import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function ManagerTraining() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const initialForm = {
    title: '',
    description: '',
    department: user?.department || 'Engineering',
    instructor: user?.name || '',
    startDate: '',
    endDate: '',
    assignedEmployees: []
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainRes, empRes] = await Promise.all([
        axios.get('/api/training', { params: { department: user?.department } }),
        axios.get('/api/employees', { params: { department: user?.department } })
      ]);

      if (trainRes.data.success) setTrainings(trainRes.data.trainings);
      if (empRes.data.success) setTeamMembers(empRes.data.employees);
    } catch (err) {
      console.error('Error fetching manager training data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/training', {
        ...formData,
        department: user?.department || 'Engineering',
        instructor: formData.instructor || user?.name
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData(initialForm);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule training program');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/training/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title="Training & Development"
          subtitle={`Skill development and training tracks for the ${user?.department || ''} team`}
        />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Active Department Programs ({trainings.length})</span>
              <button
                onClick={() => {
                  setFormData({ ...initialForm, department: user?.department || 'Engineering', instructor: user?.name || '' });
                  setError('');
                  setShowModal(true);
                }}
                className="btn btn-primary"
              >
                + Schedule Training Track
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Track Title</th>
                    <th>Curriculum Outline</th>
                    <th>Instructor</th>
                    <th>Timeline</th>
                    <th>Enrolled Team Members</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading training programs...
                      </td>
                    </tr>
                  ) : trainings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No training programs active for your department.
                      </td>
                    </tr>
                  ) : (
                    trainings.map((t) => (
                      <tr key={t._id}>
                        <td><strong>{t.title}</strong></td>
                        <td style={{ maxWidth: '260px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {t.description}
                        </td>
                        <td>{t.instructor}</td>
                        <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(t.startDate).toLocaleDateString()} to {new Date(t.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          {t.assignedEmployees?.length > 0 ? (
                            <div style={{ fontSize: '12px' }}>
                              {t.assignedEmployees.map((e) => (
                                <span key={e._id} className="badge badge-neutral" style={{ marginRight: '4px', marginBottom: '4px' }}>
                                  {e.firstName} {e.lastName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>None assigned</span>
                          )}
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
                            onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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
        title="Schedule Team Training Module"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="mgr-training-form" type="submit" className="btn btn-primary">
              Assign & Schedule
            </button>
          </>
        }
      >
        {error && <div className="alert-danger">{error}</div>}
        <form id="mgr-training-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Program Title *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Microservices Architecture & Docker"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructor / Session Lead</label>
            <input
              type="text"
              className="form-control"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
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
            <label className="form-label">Description & Goals *</label>
            <textarea
              className="form-control"
              rows="3"
              required
              placeholder="Outline expectations and outcomes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Team Members</label>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-dark)', padding: '8px', borderRadius: '3px' }}>
              {teamMembers.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No team members found in this department.</div>
              ) : (
                teamMembers.map((emp) => (
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
                    <span>{emp.firstName} {emp.lastName} ({emp.position})</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
