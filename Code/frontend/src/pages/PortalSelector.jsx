import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) { navigate(`/${user.role}`); return null; }

  const portals = [
    {
      id: 'hr',
      title: 'HR Administration',
      description: 'Manage employee records, approve leave requests, monitor attendance, and broadcast company-wide announcements.',
      path: '/login/hr',
      emoji: '🏢',
      gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
      lightBg: 'rgba(99,102,241,0.06)',
      features: ['Employee CRUD', 'Leave Approvals', 'Attendance Ledger', 'Announcements'],
    },
    {
      id: 'manager',
      title: 'Manager Operations',
      description: 'Oversee your team, manage leave approvals, assign training programs, and handle department-level performance.',
      path: '/login/manager',
      emoji: '👔',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      lightBg: 'rgba(139,92,246,0.06)',
      features: ['Team Overview', 'Leave Decisions', 'Training Programs', 'Team Comms'],
    },
    {
      id: 'employee',
      title: 'Employee Self-Service',
      description: 'Clock in and out, apply for leave, view your training schedule, and stay up to date with company news.',
      path: '/login/employee',
      emoji: '👤',
      gradient: 'linear-gradient(135deg, #06b6d4, #38bdf8)',
      lightBg: 'rgba(6,182,212,0.06)',
      features: ['Attendance Punch', 'Leave Requests', 'Training View', 'My Profile'],
    },
  ];

  return (
    <div className="portal-layout">
      <header className="portal-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="StaffSync" style={{ height: '36px', objectFit: 'contain' }} />
          <div>
            <div className="portal-brand">StaffSync</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-light)', lineHeight: 1 }}>Workforce Management</div>
          </div>
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary-mid)' }}>
          Select your portal to continue
        </div>
      </header>

      <main className="portal-hero">
        <h1 className="portal-heading">Welcome to StaffSync 👋</h1>
        <p className="portal-subheading">
          One platform, three powerful portals — designed around your role and responsibilities.
        </p>

        <div className="portal-roles-container">
          {portals.map((portal) => (
            <div key={portal.id} className="portal-role-card">
              <div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: portal.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', fontSize: '26px',
                  boxShadow: `0 6px 20px ${portal.lightBg.replace('0.06', '0.35')}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  {portal.emoji}
                </div>
                <h2 className="portal-role-name">{portal.title}</h2>
                <p className="portal-role-desc">{portal.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                  {portal.features.map(f => (
                    <span key={f} style={{
                      fontSize: '11px', fontWeight: '600', color: 'var(--primary)',
                      background: 'var(--primary-light)', border: '1px solid var(--primary-mid)',
                      padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate(portal.path)} className="btn btn-primary"
                style={{ width: '100%', padding: '12px 0', marginTop: '22px', borderRadius: '14px', background: portal.gradient, boxShadow: 'none' }}>
                Access Portal →
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '18px', borderTop: '1px solid var(--border)', color: 'var(--text-light)', fontSize: '12px' }}>
        StaffSync HRM · Role-Based Secure Access · MERN Stack
      </footer>
    </div>
  );
}
