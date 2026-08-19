import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminBookingsPage from './pages/AdminBookingsPage.jsx';
import AdminSpacesPage from './pages/AdminSpacesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MemberDashboard from './pages/MemberDashboard.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SpaceDetailPage from './pages/SpaceDetailPage.jsx';
import SpacesPage from './pages/SpacesPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<SpacesPage />} />
          <Route path="/spaces/:id" element={<SpaceDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="member">
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/spaces"
            element={
              <ProtectedRoute role="admin">
                <AdminSpacesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute role="admin">
                <AdminBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
