import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/auth/me');
        if (res.data.success && res.data.user.employeeRef) {
          const emp = res.data.user.employeeRef;
          setProfile(emp);
          setPhone(emp.phone || '');
          if (emp.address) {
            setAddress({
              street: emp.address.street || '',
              city: emp.address.city || '',
              state: emp.address.state || '',
              zip: emp.address.zip || ''
            });
          }
        }
      } catch (err) {
        console.error('Error fetching employee profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      const res = await axios.put('/api/employees/me/profile', {
        phone,
        address
      });

      if (res.data.success) {
        setMsg('Personal contact information updated successfully.');
        setProfile(res.data.employee);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Personal Profile" subtitle="Maintain contact information and view corporate employee records" />

        <main className="page-body">
          {msg && <div className="alert-info">{msg}</div>}
          {error && <div className="alert-danger">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Read-Only Corporate Record */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Official Employment Record</span>
              </div>
              <div className="panel-body">
                {loading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading records...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee ID</div>
                      <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{profile?.employeeId || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Legal Name</div>
                      <div style={{ fontWeight: '600' }}>{profile?.firstName} {profile?.lastName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corporate Email</div>
                      <div>{profile?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Department</div>
                      <div>{profile?.department}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Official Position</div>
                      <div>{profile?.position}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reporting Manager</div>
                      <div>{profile?.managerName || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joining Date</div>
                      <div>{profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employment Status</div>
                      <span className={`badge badge-${profile?.status}`}>{profile?.status}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Contact Details */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Editable Personal Contact Details</span>
              </div>
              <div className="panel-body">
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="123 Corporate Way"
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
                      <label className="form-label">State / Province</label>
                      <input
                        type="text"
                        className="form-control"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal / Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Update Personal Details'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
