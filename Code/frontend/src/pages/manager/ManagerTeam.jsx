import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function ManagerTeam() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/employees', {
          params: { department: user?.department }
        });
        if (res.data.success) {
          setTeamMembers(res.data.employees);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title="Department Personnel"
          subtitle={`Active roster for ${user?.department || 'Department'}`}
        />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Team Roster ({teamMembers.length})</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Full Name</th>
                    <th>Position</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Leave Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading team members...
                      </td>
                    </tr>
                  ) : teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No team members registered in this department.
                      </td>
                    </tr>
                  ) : (
                    teamMembers.map((m) => (
                      <tr key={m._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{m.employeeId}</td>
                        <td>
                          <strong>{m.firstName} {m.lastName}</strong>
                        </td>
                        <td>{m.position}</td>
                        <td>{m.email}</td>
                        <td>{m.phone || '-'}</td>
                        <td style={{ fontSize: '11px' }}>
                          Casual: {m.leaveBalance?.casual || 0} | Sick: {m.leaveBalance?.sick || 0} | Annual: {m.leaveBalance?.annual || 0}
                        </td>
                        <td>
                          <span className={`badge badge-${m.status}`}>{m.status}</span>
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
