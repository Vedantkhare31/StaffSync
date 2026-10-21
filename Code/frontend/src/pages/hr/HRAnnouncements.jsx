import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function HRAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const initialForm = {
    title: '',
    content: '',
    category: 'General',
    targetRole: 'all',
    priority: 'normal'
  };
  const [formData, setFormData] = useState(initialForm);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/announcements', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData(initialForm);
        fetchAnnouncements();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Company Announcements" subtitle="Publish organization updates, policies, and bulletins" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Active Notice Board</span>
              <button onClick={() => { setFormData(initialForm); setError(''); setShowModal(true); }} className="btn btn-primary">
                + Draft Announcement
              </button>
            </div>

            <div className="panel-body">
              {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading notices...</div>
              ) : announcements.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No active company announcements.</div>
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
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {a.targetRole}</span>
                        </div>
                        <h3 className="announcement-title">{a.title}</h3>
                        <div className="announcement-meta">
                          Published by {a.authorName} ({a.authorRole}) on {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <button onClick={() => handleDelete(a._id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>

                    <div className="announcement-content">{a.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Draft Announcement Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Publish Organization Announcement"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="announcement-form" type="submit" className="btn btn-primary">
              Publish Notice
            </button>
          </>
        }
      >
        {error && <div className="alert-danger">{error}</div>}
        <form id="announcement-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject / Title *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Q4 Performance Reviews or Holiday Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Policy">Policy</option>
                <option value="Urgent">Urgent</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              >
                <option value="all">Entire Organization</option>
                <option value="employee">Employees Only</option>
                <option value="manager">Managers Only</option>
                <option value="hr">HR Personnel Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">High (Urgent)</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Body / Message *</label>
            <textarea
              className="form-control"
              rows="5"
              required
              placeholder="Enter full announcement details here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
