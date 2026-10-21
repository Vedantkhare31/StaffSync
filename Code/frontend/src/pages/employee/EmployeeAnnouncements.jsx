import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

import Modal from '../../components/Modal';

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTarget, setNewTarget] = useState('hr');
  const [newPriority, setNewPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.post('/api/announcements', {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: 'Mail',
        targetRole: newTarget,
        priority: newPriority
      });
      if (res.data.success) {
        setSuccessMsg('Mail dispatched successfully to database and synced with HR and Managers.');
        setNewTitle('');
        setNewContent('');
        setTimeout(() => {
          setSuccessMsg('');
          setShowModal(false);
        }, 1500);
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch mail.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Company Bulletins & Mail" subtitle="Official notifications, holiday advisories, and workforce communications" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="panel-title">Active Notices &amp; Mails ({announcements.length})</span>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                + Send Note to HR / Leads
              </button>
            </div>

            <div className="panel-body">
              {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading bulletins...</div>
              ) : announcements.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No active announcements to display.</div>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="announcement-card">
                    <div className="announcement-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`badge ${a.priority === 'high' ? 'badge-rejected' : 'badge-neutral'}`}>
                            {a.priority} priority
                          </span>
                          <span className="badge badge-neutral">{a.category}</span>
                        </div>
                        <h3 className="announcement-title">{a.title}</h3>
                        <div className="announcement-meta">
                          Published by {a.authorName} ({a.authorRole}) on {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="announcement-content">{a.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Corporate Note / Mail"
      >
        {successMsg && <div className="alert-success" style={{ marginBottom: '14px' }}>{successMsg}</div>}

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="form-label">Send To</label>
              <select className="form-control" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}>
                <option value="hr">HR Personnel (Human Resources)</option>
                <option value="manager">Department Managers &amp; Leads</option>
                <option value="all">Everyone (All Staff)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-control" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="high">High / Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Subject / Purpose</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Leave Policy Inquiry / Payroll Verification..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Message Details</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Explain your inquiry, suggestion, or request..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Dispatching...' : 'Dispatch Mail to Database \u2192'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
