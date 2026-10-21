import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setDepartment(user.department || '');
      if (user.employeeRef) {
        setPhone(user.employeeRef.phone || '');
        if (user.employeeRef.address) {
          setAddress({
            street: user.employeeRef.address.street || '',
            city: user.employeeRef.address.city || '',
            state: user.employeeRef.address.state || '',
            zip: user.employeeRef.address.zip || ''
          });
        }
      }
    }
  }, [user, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Please choose an image under 8MB in size.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.put('/api/auth/profile', {
        name,
        avatar,
        phone,
        department,
        address
      });

      if (res.data.success) {
        setSuccess('Profile and photo updated successfully.');
        updateUser(res.data.user);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Account Settings"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button form="profile-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {error && <div className="alert-danger">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <form id="profile-form" onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 10px auto' }}>
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0038FF&color=fff&size=120`}
              alt="Profile Avatar"
              style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #E2E8F0' }}
            />
          </div>

          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            Upload Profile Picture
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </label>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
            JPG, PNG or GIF up to 8MB
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className="form-control"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Corporate Email (Read Only)</label>
            <input
              type="email"
              className="form-control"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#F8FAFC', color: '#718096' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">System Role</label>
            <input
              type="text"
              className="form-control"
              value={(user?.role || '').toUpperCase()}
              disabled
              style={{ backgroundColor: '#F8FAFC', color: '#718096', fontWeight: '600' }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            className="form-control"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              className="form-control"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
