import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function HRLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [department, setDepartment] = useState('All');

  // Review modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leaves/all', {
        params: { status, department }
      });
      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [status, department]);

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewNotes('');
    setError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await axios.put(`/api/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewNotes
      });

      if (res.data.success) {
        setSelectedLeave(null);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Company Leave Management" subtitle="Review, approve, or reject organization-wide workforce leave applications" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Leave Applications ({leaves.length})</span>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div style={{ width: '180px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div style={{ width: '220px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Department</label>
                <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Review Log</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading leave records...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No leave applications match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <strong>{l.employeeName}</strong>
                        </td>
                        <td>{l.department}</td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leaveType}</td>
                        <td style={{ fontSize: '12px' }}>
                          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalDays} day(s)</td>
                        <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--text-main)' }}>
                          {l.reason}
                        </td>
                        <td>
                          <span className={`badge badge-${l.status}`}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {l.reviewerName ? (
                            <>
                              <div>By: {l.reviewerName}</div>
                              {l.reviewNotes && <div>Note: {l.reviewNotes}</div>}
                            </>
                          ) : '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {l.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => handleOpenReview(l, 'approved')}
                                className="btn btn-success btn-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(l, 'rejected')}
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenReview(l, l.status === 'approved' ? 'rejected' : 'approved')}
                              className="btn btn-secondary btn-sm"
                            >
                              Re-evaluate
                            </button>
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

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={`Confirm ${reviewAction.toUpperCase()} for ${selectedLeave.employeeName}`}
          footer={
            <>
              <button onClick={() => setSelectedLeave(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                form="review-form"
                type="submit"
                className={`btn btn-${reviewAction === 'approved' ? 'primary' : 'danger'}`}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Submit ${reviewAction.toUpperCase()}`}
              </button>
            </>
          }
        >
          {error && <div className="alert-danger">{error}</div>}
          <form id="review-form" onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '14px', fontSize: '13px', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '3px' }}>
              <div><strong>Employee:</strong> {selectedLeave.employeeName} ({selectedLeave.department})</div>
              <div><strong>Period:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.totalDays} days)</div>
              <div><strong>Reason:</strong> {selectedLeave.reason}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Reviewer Notes (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter notes or conditions for approval/rejection..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
