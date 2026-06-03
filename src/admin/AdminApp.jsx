import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/admin/context/AuthContext";
import ProtectedRoute from "@/admin/ProtectedRoute";
import AdminLayout from "@/admin/AdminLayout";
import LoginPage from "@/admin/pages/LoginPage";
import DashboardPage from "@/admin/pages/DashboardPage";
import LeadsPage from "@/admin/pages/LeadsPage";
import BookingsPage from "@/admin/pages/BookingsPage";

// Mounted at /admin/* from the top-level router (lazy-loaded → code-split out of the public bundle).
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
