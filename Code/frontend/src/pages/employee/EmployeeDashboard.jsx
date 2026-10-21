import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [todayAtt, setTodayAtt] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [attRes, leavesRes, trainRes] = await Promise.all([
          axios.get('/api/attendance/today'),
          axios.get('/api/leaves/my'),
          axios.get('/api/training/my')
        ]);

        if (attRes.data.success) setTodayAtt(attRes.data.attendance);
        if (leavesRes.data.success) {
          setLeaveBalance(leavesRes.data.leaveBalance);
          setMyLeaves(leavesRes.data.leaves);
        }
        if (trainRes.data.success) setTrainings(trainRes.data.trainings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalLeaveAvailable = leaveBalance ? (leaveBalance.casual + leaveBalance.sick + leaveBalance.annual) : 0;
  const progressPercent = todayAtt?.clockIn ? (todayAtt?.clockOut ? 100 : 75) : 15;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title={t('employeeDashboard')} subtitle="Personal workforce dashboard & attendance records" />

        <main className="page-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div
              onClick={() => navigate('/employee')}
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
                🏠
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Dashboard</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Overview</div>
            </div>

            <div
              onClick={() => navigate('/employee/attendance')}
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
                ⏱️
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Attendance</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Punch Shift</div>
            </div>

            <div
              onClick={() => navigate('/employee/leaves')}
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
                📅
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Leaves</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Request Time-off</div>
            </div>

            <div
              onClick={() => navigate('/employee/profile')}
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
                👤
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>Profile</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Settings & Avatar</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '24px' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E0E7FF',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                    Your Progress
                  </span>
                  <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                    Daily Shift ▾
                  </span>
                </div>

                <div style={{ fontSize: '38px', fontWeight: '900', color: '#1E1B4B', lineHeight: 1 }}>
                  {progressPercent}%
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', fontWeight: '500' }}>
                  {!todayAtt?.clockIn ? 'Shift not clocked in yet' : !todayAtt?.clockOut ? 'Active shift in progress' : 'Daily shift completed!'}
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
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #6366F1 0%, #818CF8 100%)',
                    borderRadius: '100px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}/>
                </div>
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
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Logged Hours</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E1B4B' }}>{todayAtt?.workHours || 0} hrs</div>
                </div>

                <Link
                  to="/employee/attendance"
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '100px', padding: '8px 18px' }}
                >
                  {!todayAtt?.clockIn ? 'Punch In Now →' : !todayAtt?.clockOut ? 'Clock Out →' : 'View Shift Log'}
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
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                  Recent Activity
                </span>
                <Link to="/employee/attendance" style={{ fontSize: '12px', color: '#6366F1', fontWeight: '700' }}>
                  See all
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  transition: 'background 0.15s ease'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#FCE7F3',
                    color: '#DB2777',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Leave Requests</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{myLeaves.length} applications logged</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '100px' }}>
                    {myLeaves.filter(l => l.status === 'pending').length} Pending
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  transition: 'background 0.15s ease'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: '#E0E7FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    🎯
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Training Enrolled</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{trainings.length} modules active</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#6366F1', background: '#EEF2FF', padding: '2px 8px', borderRadius: '100px' }}>
                    Active
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: '#F8F9FE',
                  transition: 'background 0.15s ease'
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
                    ✨
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E1B4B' }}>Available Balance</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Annual, sick & casual leave</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '100px' }}>
                    {totalLeaveAvailable} Days
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
                  {t('recentLeaveRequests')}
                </span>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  History of applied leaves and manager approvals
                </div>
              </div>
              <Link to="/employee/leaves" className="btn btn-secondary btn-sm" style={{ borderRadius: '100px' }}>
                {t('applyLeave')} +
              </Link>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('type')}</th>
                    <th>{t('workingDays')}</th>
                    <th>{t('period')}</th>
                    <th>{t('reason')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#9CA3AF' }}>
                        No leave applications recorded yet.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.slice(0, 5).map((l) => (
                      <tr key={l._id}>
                        <td style={{ textTransform: 'capitalize', fontWeight: '700', color: '#1E1B4B' }}>{l.leaveType}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalDays} day(s)</td>
                        <td style={{ fontSize: '12.5px' }}>
                          {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '12.5px', color: '#6B7280' }}>{l.reason}</td>
                        <td>
                          <span className={`badge badge-${l.status}`}>{l.status}</span>
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
