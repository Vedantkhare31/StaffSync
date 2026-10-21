import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function ManagerAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const initialForm = {
    title: '',
    content: '',
    category: 'General',
    targetRole: 'employee',
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

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Company & Team Bulletins" subtitle="View executive announcements and post team updates" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Notices ({announcements.length})</span>
              <button
                onClick={() => { setFormData(initialForm); setError(''); setShowModal(true); }}
                className="btn btn-primary"
              >
                + Post Notice to Team
              </button>
            </div>

            <div className="panel-body">
              {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading notices...</div>
              ) : announcements.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No active notices found.</div>
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
        title="Post Notice / Bulletin"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button form="mgr-announcement-form" type="submit" className="btn btn-primary">
              Publish
            </button>
          </>
        }
      >
        {error && <div className="alert-danger">{error}</div>}
        <form id="mgr-announcement-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title / Topic *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Sprint Review Reminder"
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
                <option value="Event">Event</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              >
                <option value="employee">Employees & Team</option>
                <option value="all">Entire Company</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content *</label>
            <textarea
              className="form-control"
              rows="4"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
