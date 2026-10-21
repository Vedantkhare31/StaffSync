import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const initialForm = {
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leaves/my');
      if (res.data.success) {
        setLeaves(res.data.leaves);
        setBalance(res.data.leaveBalance);
      }
    } catch (err) {
      console.error('Error fetching employee leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    if (e < s) return 0;
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/leaves', formData);
      if (res.data.success) {
        setSuccessMsg('Leave request submitted successfully. Awaiting manager approval.');
        setShowApplyModal(false);
        setFormData(initialForm);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leave Management" subtitle="Submit vacation, sick, and personal leave applications" />

        <main className="page-body">
          {successMsg && <div className="alert-info">{successMsg}</div>}

          {/* Leave Balances Card */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Casual Leave Balance</div>
              <div className="stat-value">{balance?.casual ?? '-'}</div>
              <div className="stat-subtext">Days available</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Sick Leave Balance</div>
              <div className="stat-value">{balance?.sick ?? '-'}</div>
              <div className="stat-subtext">Medical and wellness quota</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Annual Leave Balance</div>
              <div className="stat-value">{balance?.annual ?? '-'}</div>
              <div className="stat-subtext">Paid annual vacation allotment</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Leave History ({leaves.length})</span>
              <button
                onClick={() => { setFormData(initialForm); setError(''); setShowApplyModal(true); }}
                className="btn btn-primary"
              >
                + Apply for Leave
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Date Period</th>
                    <th>Duration</th>
                    <th>Application Reason</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Manager / HR Response</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading leave applications...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        You have not submitted any leave applications yet.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id}>
                        <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{l.leaveType}</td>
                        <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalDays} day(s)</td>
                        <td style={{ maxWidth: '240px', fontSize: '12px' }}>{l.reason}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(l.appliedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge badge-${l.status}`}>{l.status}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {l.reviewerName ? (
                            <>
                              <div><strong>{l.reviewerName}</strong> ({new Date(l.reviewedAt).toLocaleDateString()})</div>
                              {l.reviewNotes && <div style={{ color: 'var(--text-main)' }}>"{l.reviewNotes}"</div>}
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-light)' }}>Under Review</span>
                          )}
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

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Submit Leave Application"
        footer={
          <>
            <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="apply-leave-form" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send Application'}
            </button>
          </>
        }
      >
        {error && <div className="alert-danger">{error}</div>}
        <form id="apply-leave-form" onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label">Category / Leave Type *</label>
            <select
              className="form-select"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <option value="casual">Casual Leave (Remaining: {balance?.casual ?? 0})</option>
              <option value="sick">Sick Leave (Remaining: {balance?.sick ?? 0})</option>
              <option value="annual">Annual Leave (Remaining: {balance?.annual ?? 0})</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
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

          <div style={{ marginBottom: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Total Duration: <strong>{calculateDays()}</strong> calendar day(s)
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave *</label>
            <textarea
              className="form-control"
              rows="3"
              required
              placeholder="State clear purpose of leave..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
