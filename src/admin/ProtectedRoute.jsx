import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/admin/context/AuthContext";

// Gate: a live session AND profiles.is_admin === true. This is UX only —
// Supabase RLS enforces the same on the server, so a forged client reads nothing.
export default function ProtectedRoute({ children }) {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="w-6 h-6 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-center px-6">
        <h1 className="font-heading text-2xl text-white mb-2">Not authorized</h1>
        <p className="text-zinc-400 text-sm max-w-sm">
          This account isn't an admin. Ask the owner to enable admin access, then sign in again.
        </p>
      </div>
    );
  }

  return children;
}
