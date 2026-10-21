import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('employee');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('Engineering');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
    setRegDept(role === 'hr' ? 'Human Resources' : 'Engineering');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const user = await login(signInEmail, signInPassword, selectedRole);
      if (user) navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name: regName, email: regEmail, password: regPassword, role: selectedRole, department: regDept });
      if (res.data.success) {
        const user = await login(regEmail, regPassword, selectedRole);
        navigate(`/${user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail, role: selectedRole, newPassword: forgotNewPassword });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setSignInEmail(forgotEmail);
        setSignInPassword('');
        setTimeout(() => setActiveTab('signin'), 1400);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  const roleData = [
    { id: 'employee', label: 'Employee', emoji: '👤', desc: 'Self-service' },
    { id: 'manager', label: 'Manager', emoji: '👔', desc: 'Team oversight' },
    { id: 'hr', label: 'HR', emoji: '🏢', desc: 'Administration' },
  ];

  return (
    <div className="auth-page-container">
      <div style={{ position: 'absolute', top: 80, left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 80, right: '12%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(167,139,250,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="StaffSync" style={{ width: '58px', height: '58px', objectFit: 'contain', margin: '0 auto 10px', display: 'block', position: 'relative', zIndex: 1 }} />
          <div className="auth-brand-logo">StaffSync</div>
          <div className="auth-header-sub">Human Resource Management</div>
        </div>

        <div className="auth-tabs-row">
          {[['signin', 'Sign In'], ['register', 'Create Account'], ['forgot', 'Reset Password']].map(([id, label]) => (
            <button key={id} type="button" className={`auth-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => { setActiveTab(id); setError(''); setSuccessMsg(''); }}>
              {label}
            </button>
          ))}
        </div>

        <div className="auth-body">
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              I am a...
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {roleData.map(({ id, label, emoji, desc }) => (
                <button key={id} type="button" onClick={() => handleRoleChange(id)} style={{
                  padding: '12px 8px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer',
                  fontFamily: 'var(--font)', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  border: selectedRole === id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: selectedRole === id ? 'var(--primary-light)' : 'var(--surface-2)',
                  boxShadow: selectedRole === id ? '0 4px 16px rgba(99,102,241,0.2)' : 'none',
                  transform: selectedRole === id ? 'scale(1.03)' : 'scale(1)',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{emoji}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: selectedRole === id ? 'var(--primary)' : 'var(--text)' }}>{label}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '1px' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert-danger">{error}</div>}
          {successMsg && <div className="alert-success">{successMsg}</div>}

          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" required placeholder="you@staffsync.com" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button type="button" onClick={() => { setActiveTab('forgot'); setForgotEmail(signInEmail); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)', transition: 'color 0.12s ease' }}>
                    Forgot Password?
                  </button>
                </div>
                <input type="password" className="form-control" required placeholder="••••••••" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: '6px', borderRadius: '14px' }} disabled={loading}>
                {loading ? 'Signing in...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                No account?{' '}
                <button type="button" onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>
                  Create one now
                </button>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" required placeholder="e.g. Priya Sharma" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input type="email" className="form-control" required placeholder="name@staffsync.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password (min 6 characters)</label>
                <input type="password" className="form-control" required minLength={6} placeholder="Create a secure password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={regDept} onChange={e => setRegDept(e.target.value)}>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: '6px', borderRadius: '14px' }} disabled={loading}>
                {loading ? 'Creating Account...' : `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`}
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <button type="button" onClick={() => { setActiveTab('signin'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>
                  Sign in
                </button>
              </div>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', padding: '12px 14px', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary-mid)' }}>
                Resetting password for your <strong style={{ color: 'var(--primary)' }}>{selectedRole.toUpperCase()}</strong> account.
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" required placeholder="name@staffsync.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input type="password" className="form-control" required minLength={6} placeholder="Enter new password" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: '6px', borderRadius: '14px' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button type="button" onClick={() => { setActiveTab('signin'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)', transition: 'color 0.12s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
