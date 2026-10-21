import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Portal & Login Pages
import AuthPage from './pages/AuthPage';
import PortalSelector from './pages/PortalSelector';
import RoleLoginPage from './pages/RoleLoginPage';

// HR Interface Pages
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRLeaves from './pages/hr/HRLeaves';
import HRAttendance from './pages/hr/HRAttendance';
import HRAnnouncements from './pages/hr/HRAnnouncements';
import HRTraining from './pages/hr/HRTraining';

// Manager Interface Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerLeaves from './pages/manager/ManagerLeaves';
import ManagerTraining from './pages/manager/ManagerTraining';
import ManagerTeam from './pages/manager/ManagerTeam';
import ManagerAnnouncements from './pages/manager/ManagerAnnouncements';

// Employee Interface Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeTraining from './pages/employee/EmployeeTraining';
import EmployeeAnnouncements from './pages/employee/EmployeeAnnouncements';

import { LanguageProvider } from './context/LanguageContext';

function RootRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (token && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
          {/* Public Access & Authentication */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/portals" element={<PortalSelector />} />
          <Route path="/login/:portalRole" element={<RoleLoginPage />} />

          {/* HR Interface Routes */}
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['hr']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['hr']}><HREmployees /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute allowedRoles={['hr']}><HRLeaves /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['hr']}><HRAttendance /></ProtectedRoute>} />
          <Route path="/hr/announcements" element={<ProtectedRoute allowedRoles={['hr']}><HRAnnouncements /></ProtectedRoute>} />
          <Route path="/hr/training" element={<ProtectedRoute allowedRoles={['hr']}><HRTraining /></ProtectedRoute>} />

          {/* Manager Interface Routes */}
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/leaves" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLeaves /></ProtectedRoute>} />
          <Route path="/manager/training" element={<ProtectedRoute allowedRoles={['manager']}><ManagerTraining /></ProtectedRoute>} />
          <Route path="/manager/team" element={<ProtectedRoute allowedRoles={['manager']}><ManagerTeam /></ProtectedRoute>} />
          <Route path="/manager/announcements" element={<ProtectedRoute allowedRoles={['manager']}><ManagerAnnouncements /></ProtectedRoute>} />

          {/* Employee Interface Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/employee/leaves" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLeaves /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/employee/training" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTraining /></ProtectedRoute>} />
          <Route path="/employee/announcements" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAnnouncements /></ProtectedRoute>} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
