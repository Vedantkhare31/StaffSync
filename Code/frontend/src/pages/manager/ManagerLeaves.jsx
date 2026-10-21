import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function ManagerLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leaves/team', { params: { status } });
      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching team leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [status]);

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
        <Navbar
          title="Team Leave Approvals"
          subtitle={`Reviewing leave applications for ${user?.department || 'Department'} personnel`}
        />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Department Leave Applications ({leaves.length})</span>
            </div>

            <div className="filter-bar">
              <div style={{ width: '180px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Status Filter</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Review Log</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading leave requests...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No leave requests found for this status.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <strong>{l.employeeName}</strong>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leaveType}</td>
                        <td style={{ fontSize: '12px' }}>
                          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalDays} day(s)</td>
                        <td style={{ maxWidth: '240px', fontSize: '12px' }}>{l.reason}</td>
                        <td>
                          <span className={`badge badge-${l.status}`}>{l.status}</span>
                        </td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {l.reviewerName ? (
                            <>
                              <div>Reviewed by: {l.reviewerName}</div>
                              {l.reviewNotes && <div>Note: {l.reviewNotes}</div>}
                            </>
                          ) : 'Pending Review'}
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
                              Change Decision
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

      {/* Review Dialog */}
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
                form="manager-review-form"
                type="submit"
                className={`btn btn-${reviewAction === 'approved' ? 'primary' : 'danger'}`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : `Confirm ${reviewAction.toUpperCase()}`}
              </button>
            </>
          }
        >
          {error && <div className="alert-danger">{error}</div>}
          <form id="manager-review-form" onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '14px', fontSize: '13px', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '3px' }}>
              <div><strong>Applicant:</strong> {selectedLeave.employeeName}</div>
              <div><strong>Leave Period:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.totalDays} days)</div>
              <div><strong>Reason:</strong> {selectedLeave.reason}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Manager Review Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Optional notes or instructions for the employee..."
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
