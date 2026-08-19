import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
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
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/spaces" replace />} />
            <Route path="spaces" element={<AdminSpacesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
