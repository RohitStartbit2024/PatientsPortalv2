import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import UploadReports from './pages/UploadReports/UploadReports';
import Reports from './pages/Reports/Reports';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Admin routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-reports"
            element={
              <ProtectedRoute role="Admin">
                <UploadReports />
              </ProtectedRoute>
            }
          />

          {/* Patient routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="Patient">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute role="Patient">
                <Reports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
