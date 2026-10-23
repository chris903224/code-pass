import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// ============================================================
// PAGES & COMPONENTS
// ============================================================
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminDepartments from './components/admin/AdminDepartments';
import AdminStudents from './components/admin/AdminStudents';
import AdminReports from './components/admin/AdminReports';

// Unified Portals
import DepartmentPortal from './components/department/DepartmentPortal';
import StudentPortal from './components/student/StudentPortal'; // <-- Pinalitan ang tatlong imports

// ============================================================
// PROTECTED ROUTE COMPONENT
// ============================================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'department' | 'student')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// ============================================================
// ROLE-BASED DASHBOARD ROUTER
// ============================================================
const DashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.userType) {
    case 'admin':
      return <AdminDashboard />;
    case 'department':
      return <DepartmentPortal />; 
    case 'student':
      return <StudentPortal />; // <-- Pinalitan din dito
    default:
      return <Navigate to="/login" replace />;
  }
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ===== LOGIN ===== */}
          <Route path="/login" element={<LoginPage />} />

          {/* ===== ROOT ===== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* ===== COMMON ROUTES ===== */}
          <Route path="/:userType/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/:userType/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/:userType/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/:userType/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

          {/* ======================================================== */}
          {/* UNIFIED PORTALS (Internal State Navigation)              */}
          {/* ======================================================== */}
          <Route 
            path="/department/*" 
            element={
              <ProtectedRoute allowedRoles={['department']}>
                <DepartmentPortal />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPortal /> 
              </ProtectedRoute>
            } 
          />

          {/* ===== 404 ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;