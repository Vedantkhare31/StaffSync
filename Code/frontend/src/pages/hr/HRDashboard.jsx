import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function HRDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('Today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, leavesRes] = await Promise.all([
          axios.get('/api/employees/hr/stats'),
          axios.get('/api/leaves/all')
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (leavesRes.data.success) setLeaves(leavesRes.data.leaves);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredLeaves = leaves.filter((l) => {
    if (activeTab === 'Today') return l.status === 'pending';
    if (activeTab === 'Coming') return new Date(l.startDate) > new Date();
    if (activeTab === 'Completed') return l.status === 'approved' || l.status === 'rejected';
    return true;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title={t('hrDashboard')} subtitle="Human Resources administration, personnel & attendance" />

        <main className="page-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div
              onClick={() => navigate('/hr')}
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
                📊
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Dashboard</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Organization Overview</div>
            </div>

            <div
              onClick={() => navigate('/hr/employees')}
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
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Employees</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Workforce Directory</div>
            </div>

            <div
              onClick={() => navigate('/hr/leaves')}
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
                📝
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Leave Requests</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Approvals & Audits</div>
            </div>

            <div
              onClick={() => navigate('/hr/announcements')}
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
                background: '#FCE7F3',
                color: '#DB2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '20px'
              }}>
                📢
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Announcements</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Company Bulletins</div>
            </div>
          </div>

          <div className="metrics-row-card">
            <div className="metric-column">
              <div className="metric-header-title">{t('payrollPeriod')}</div>
              <div className="metric-big-value">
                {stats ? stats.calendarDays : 30}
                <span className="metric-fraction-denom">Days</span>
              </div>
              <div className="metric-subtitle">Monthly cycle</div>
            </div>

            <div className="metric-column">
              <div className="metric-header-title">{t('totalEmployees')}</div>
              <div className="metric-big-value">
                {stats ? stats.totalEmployees : 0}
                <span className="metric-badge-green">+{stats ? stats.newThisMonth : 1} Active</span>
              </div>
              <div className="metric-subtitle">Active headcount</div>
            </div>

            <div className="metric-column">
              <div className="metric-header-title">{t('workingDays')}</div>
              <div className="metric-big-value">
                {stats ? stats.workingDays : 22}
                <span className="metric-fraction-denom">Days</span>
              </div>
              <div className="metric-subtitle">Standard schedule</div>
            </div>

            <div className="metric-column">
              <div className="metric-header-title">{t('payrollProcessed')}</div>
              <div className="metric-big-value">
                {stats ? stats.payrollProcessed : 0}
                <span className="metric-fraction-denom">/ {stats ? stats.totalEmployees : 0}</span>
              </div>
              <div className="metric-subtitle">Disbursed</div>
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
                  Workforce Attendance
                </span>
                <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                  Today's Rate ▾
                </span>
              </div>

              <div style={{ fontSize: '38px', fontWeight: '900', color: '#1E1B4B', lineHeight: 1 }}>
                {stats && stats.totalEmployees > 0 ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 85}%
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                {stats ? stats.todayAttendance : 0} out of {stats ? stats.totalEmployees : 0} employees checked in today
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
                  width: `${stats && stats.totalEmployees > 0 ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 85}%`,
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
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Pending Leaves</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E1B4B' }}>{stats ? stats.pendingLeaves : 0} Requests</div>
                </div>

                <Link to="/hr/attendance" className="btn btn-primary btn-sm" style={{ borderRadius: '100px', padding: '8px 18px' }}>
                  View Attendance Ledger →
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
                  HR Quick Operations
                </span>
                <Link to="/hr/employees" style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                  Manage
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/hr/employees" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#EEF2FF',
                    color: '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    ➕
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Add New Employee</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Onboard workforce member to database</div>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6366F1' }}>→</span>
                </Link>

                <Link to="/hr/leaves" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    📋
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Review Pending Leaves</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Company-wide absence approval queue</div>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6366F1' }}>→</span>
                </Link>

                <Link to="/hr/training" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease'
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
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Skill & Training Tracks</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Assign programs across departments</div>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6366F1' }}>→</span>
                </Link>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '15.5px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                  Leave & Attendance Requests
                </span>
                <Link to="/hr/leaves" style={{ fontSize: '12.5px', color: '#6366F1', fontWeight: '700' }}>
                  Manage All →
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['Today', 'Coming', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? '#6366F1' : '#F5F6FF',
                      color: activeTab === tab ? '#FFFFFF' : '#6B7280',
                      border: 'none',
                      borderRadius: '100px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                        No records found for {activeTab}.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.slice(0, 6).map((item) => (
                      <tr key={item._id}>
                        <td><strong style={{ color: '#1E1B4B' }}>{item.employeeName}</strong></td>
                        <td>{item.department}</td>
                        <td style={{ textTransform: 'capitalize' }}>{item.leaveType}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{item.totalDays} day(s)</td>
                        <td style={{ fontSize: '12px' }}>
                          {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge badge-${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to="/hr/leaves" className="btn btn-secondary btn-sm" style={{ borderRadius: '100px' }}>
                            Review →
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
