import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function EmployeeTraining() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/training/my');
        if (res.data.success) {
          setTrainings(res.data.trainings);
        }
      } catch (err) {
        console.error('Error fetching employee trainings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Training & Development" subtitle="Assigned corporate curricula, certifications, and compliance programs" />

        <main className="page-body">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Assigned Programs ({trainings.length})</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program Title</th>
                    <th>Curriculum Description</th>
                    <th>Lead Instructor</th>
                    <th>Schedule</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Loading assigned trainings...
                      </td>
                    </tr>
                  ) : trainings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        You currently have no training programs assigned.
                      </td>
                    </tr>
                  ) : (
                    trainings.map((t) => (
                      <tr key={t._id}>
                        <td><strong>{t.title}</strong></td>
                        <td style={{ maxWidth: '300px', fontSize: '12px', color: 'var(--text-main)' }}>
                          {t.description}
                        </td>
                        <td>{t.instructor}</td>
                        <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(t.startDate).toLocaleDateString()} to {new Date(t.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge badge-${t.status === 'completed' ? 'approved' : t.status === 'in-progress' ? 'pending' : 'neutral'}`}>
                            {t.status}
                          </span>
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
