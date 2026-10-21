import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setLoading(true);
        const [empRes, leavesRes, trainRes] = await Promise.all([
          axios.get('/api/employees', { params: { department: user?.department } }),
          axios.get('/api/leaves/team', { params: { status: 'pending' } }),
          axios.get('/api/training', { params: { department: user?.department } })
        ]);

        if (empRes.data.success) setTeamMembers(empRes.data.employees);
        if (leavesRes.data.success) setPendingLeaves(leavesRes.data.leaves);
        if (trainRes.data.success) setTrainings(trainRes.data.trainings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [user]);

  const activeEmployees = teamMembers.filter((m) => m.status === 'active').length;
  const teamCapacityPercent = teamMembers.length > 0 ? Math.round((activeEmployees / teamMembers.length) * 100) : 80;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar
          title={t('managerDashboard')}
          subtitle={`Departmental oversight for ${user?.department || 'Department'}`}
        />

        <main className="page-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div
              onClick={() => navigate('/manager')}
              style={{
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                👔
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Dashboard</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Team Overview</div>
            </div>

            <div
              onClick={() => navigate('/manager/team')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E0E7FF',
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#6366F1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E0E7FF'; }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#EEF2FF',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                👥
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Team Roster</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{teamMembers.length} Members</div>
            </div>

            <div
              onClick={() => navigate('/manager/leaves')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E0E7FF',
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#6366F1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E0E7FF'; }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                📋
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Leave Approvals</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{pendingLeaves.length} Pending</div>
            </div>

            <div
              onClick={() => navigate('/manager/training')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E0E7FF',
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#6366F1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E0E7FF'; }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#EDE9FE',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                🚀
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Training</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{trainings.length} Curricula</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '24px' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E0E7FF',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                  Team Available Capacity
                </span>
                <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                  {user?.department} ▾
                </span>
              </div>

              <div style={{ fontSize: '38px', fontWeight: '900', color: '#1E1B4B', lineHeight: 1 }}>
                {teamCapacityPercent}%
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                {activeEmployees} active of {teamMembers.length} team members currently on-duty
              </div>

              <div style={{
                height: '14px',
                background: '#EEF2FF',
                borderRadius: '100px',
                overflow: 'hidden',
                marginTop: '18px',
                border: '1px solid #E0E7FF'
              }}>
                <div style={{
                  height: '100%',
                  width: `${teamCapacityPercent}%`,
                  background: 'linear-gradient(90deg, #6366F1 0%, #818CF8 100%)',
                  borderRadius: '100px'
                }}/>
              </div>

              <div style={{
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Review Leaves</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E1B4B' }}>{pendingLeaves.length} Applications</div>
                </div>

                <Link to="/manager/leaves" className="btn btn-primary btn-sm" style={{ borderRadius: '100px', padding: '8px 18px' }}>
                  Open Approvals →
                </Link>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E0E7FF',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                  Team Overview
                </span>
                <Link to="/manager/team" style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#D1FAE5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    👥
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Roster Count</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{teamMembers.length} Employees assigned to your team</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '100px' }}>
                    Active
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    ⏳
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Pending Leave Queue</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Applications requiring your review</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '100px' }}>
                    {pendingLeaves.length} Requests
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#EDE9FE',
                    color: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    🎓
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Active Programs</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Skill tracks created for this unit</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#8B5CF6', background: '#EDE9FE', padding: '2px 8px', borderRadius: '100px' }}>
                    {trainings.length} Programs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E0E7FF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                  {t('pendingLeaveRequests')}
                </span>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  Requests from members in your department
                </div>
              </div>
              <Link to="/manager/leaves" className="btn btn-secondary btn-sm" style={{ borderRadius: '100px' }}>
                {t('reviewAll')} ({pendingLeaves.length})
              </Link>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('staff')}</th>
                    <th>{t('type')}</th>
                    <th>{t('workingDays')}</th>
                    <th>{t('period')}</th>
                    <th>{t('reason')}</th>
                    <th style={{ textAlign: 'right' }}>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#9CA3AF' }}>
                        No pending leave requests for your team.
                      </td>
                    </tr>
                  ) : (
                    pendingLeaves.map((l) => (
                      <tr key={l._id}>
                        <td><strong style={{ color: '#1E1B4B' }}>{l.employeeName}</strong></td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leaveType}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalDays} day(s)</td>
                        <td style={{ fontSize: '12.5px' }}>
                          {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '12.5px', color: '#6B7280' }}>{l.reason}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to="/manager/leaves" className="btn btn-primary btn-sm" style={{ borderRadius: '100px' }}>
                            {t('review')} →
                          </Link>
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
    </div>
  );
}
