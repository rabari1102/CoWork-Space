import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import Footer from './components/Footer.jsx';
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
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Keying on the path replays the entry animation on every navigation,
          which is what makes route changes feel like transitions rather than
          instant swaps. */}
      <main key={location.pathname} className="flex-1 animate-fade-up">
        <Routes location={location}>
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

      <Footer />
    </div>
  );
}
