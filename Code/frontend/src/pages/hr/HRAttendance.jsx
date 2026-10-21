import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function HRAttendance() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/attendance/all', {
        params: { date, department, status }
      });
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, department, status]);

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const halfDayCount = records.filter(r => r.status === 'half-day').length;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Attendance Ledger" subtitle="Comprehensive workforce daily attendance and hours auditing" />

        <main className="page-body">
          {/* Daily Quick Summary */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Logs for {date}</div>
              <div className="stat-value">{records.length}</div>
              <div className="stat-subtext">Recorded punches</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">On-Time (Present)</div>
              <div className="stat-value" style={{ color: '#065F46' }}>{presentCount}</div>
              <div className="stat-subtext">Clocked in before 9:30 AM</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Late Arrivals</div>
              <div className="stat-value" style={{ color: '#C2410C' }}>{lateCount}</div>
              <div className="stat-subtext">Punched after standard threshold</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Half-Day Records</div>
              <div className="stat-value" style={{ color: '#B45309' }}>{halfDayCount}</div>
              <div className="stat-subtext">Under 4 hours logged</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Attendance Entries</span>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div style={{ width: '160px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div style={{ width: '200px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Department</label>
                <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div style={{ width: '160px' }}>
                <label className="form-label" style={{ marginBottom: '2px' }}>Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Daily Work Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading attendance ledger...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No attendance records logged for {date}.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.employeeName}</strong>
                        </td>
                        <td>{r.department}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.date}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                            <span style={{ color: '#2563EB', fontSize: '11px' }}>In Progress</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {r.workHours ? `${r.workHours} hrs` : '-'}
                        </td>
                        <td>
                          <span className={`badge badge-${r.status}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px' }}>
                          {r.workNotes || '-'}
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
