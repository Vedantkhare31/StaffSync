import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function EmployeeAttendance() {
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [workNotes, setWorkNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, histRes] = await Promise.all([
        axios.get('/api/attendance/today'),
        axios.get('/api/attendance/my')
      ]);

      if (todayRes.data.success) {
        setTodayStatus(todayRes.data.attendance);
        if (todayRes.data.attendance?.workNotes) {
          setWorkNotes(todayRes.data.attendance.workNotes);
        }
      }
      if (histRes.data.success) {
        setHistory(histRes.data.records);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/attendance/clock-in');
      if (res.data.success) {
        setMessage('Successfully clocked in for today.');
        fetchAttendanceData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error clocking in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/attendance/clock-out', { workNotes });
      if (res.data.success) {
        setMessage('Successfully clocked out. Shift completed.');
        fetchAttendanceData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error clocking out.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Daily Attendance" subtitle="Clock in, log daily work notes, and review attendance history" />

        <main className="page-body">
          {message && <div className="alert-info">{message}</div>}
          {error && <div className="alert-danger">{error}</div>}

          {/* Clock In / Out Control Box */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Today's Shift Punch Terminal</span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {new Date().toDateString()}
              </span>
            </div>

            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Shift Status
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>
                    {!todayStatus?.clockIn ? (
                      <span style={{ color: '#B45309' }}>Shift Not Started</span>
                    ) : !todayStatus?.clockOut ? (
                      <span style={{ color: '#2563EB' }}>Active (Working)</span>
                    ) : (
                      <span style={{ color: '#065F46' }}>Shift Completed</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standard shift starts: 09:00 AM (Late arrival threshold: 09:30 AM)
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clock In Time:</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                    {todayStatus?.clockIn ? new Date(todayStatus.clockIn).toLocaleTimeString() : 'Not recorded'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Clock Out Time:</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                    {todayStatus?.clockOut ? new Date(todayStatus.clockOut).toLocaleTimeString() : 'Not recorded'}
                  </div>
                </div>

                <div>
                  {!todayStatus?.clockIn ? (
                    <button
                      onClick={handleClockIn}
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '14px', width: '100%' }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Recording Punch...' : 'Record Clock In'}
                    </button>
                  ) : !todayStatus?.clockOut ? (
                    <div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label">End of Day Work Summary / Notes</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Brief summary of tasks completed today..."
                          value={workNotes}
                          onChange={(e) => setWorkNotes(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleClockOut}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px', width: '100%' }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Completing Shift...' : 'Record Clock Out'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '3px', color: 'var(--success-text)', fontWeight: '600' }}>
                      Shift Logged: {todayStatus.workHours} hours recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Log */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Recent Attendance Records</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Total Logged</th>
                    <th>Status</th>
                    <th>Work Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading personal attendance history...
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No attendance history on record.
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{h.date}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {h.clockIn ? new Date(h.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {h.clockOut ? new Date(h.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {h.workHours ? `${h.workHours} hrs` : '-'}
                        </td>
                        <td>
                          <span className={`badge badge-${h.status}`}>{h.status}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                          {h.workNotes || '-'}
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
