import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleLoginPage() {
  const { portalRole } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const validRoles = ['hr', 'manager', 'employee'];
  const currentRole = portalRole?.toLowerCase();

  if (!validRoles.includes(currentRole)) { navigate('/'); return null; }

  const roleConfigs = {
    hr: { title: 'HR Administration', subtitle: 'Restricted to Human Resources personnel', redirectPath: '/hr' },
    manager: { title: 'Manager Operations', subtitle: 'Restricted to Department Heads and Team Leads', redirectPath: '/manager' },
    employee: { title: 'Employee Self-Service', subtitle: 'Standard access for attendance, leaves and personal records', redirectPath: '/employee' }
  };

  const config = roleConfigs[currentRole];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, currentRole);
      navigate(config.redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-layout">
      <header className="portal-topbar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="StaffSync" style={{ height: '32px', objectFit: 'contain' }} />
          <div className="portal-brand">StaffSync</div>
        </Link>
        <Link to="/" style={{ fontSize: '12.5px', color: 'var(--gray-500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.12s ease' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-900)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}>
          ← All Portals
        </Link>
      </header>

      <main className="portal-hero">
        <div className="portal-login-box">
          <div className="portal-login-header">
            <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: '700', color: 'var(--gray-500)', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>
              {currentRole.toUpperCase()}
            </span>
            <h2 className="portal-login-title">{config.title}</h2>
            <p className="portal-login-desc">{config.subtitle}</p>
          </div>

          {error && <div className="alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@staffsync.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px 0', marginTop: '8px' }} disabled={submitting}>
              {submitting ? 'Verifying...' : `Log In to ${currentRole.toUpperCase()} Portal`}
            </button>
          </form>

          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/auth" style={{ fontSize: '12px', color: 'var(--gray-500)', transition: 'color 0.12s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-900)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}>
              Forgot Password?
            </Link>
            <Link to="/auth" style={{ fontSize: '12px', color: 'var(--gray-500)', transition: 'color 0.12s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-900)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}>
              Create Account →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
