import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/admin/context/AuthContext";
import { resetPassword } from "@/admin/api";

export default function LoginPage() {
  const { session, isAdmin, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && session && isAdmin) {
    return <Navigate to={location.state?.from?.pathname || "/admin"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error.message || "Sign in failed");
  };

  const handleReset = async () => {
    if (!email) { toast.error("Enter your email first, then tap reset"); return; }
    const { error } = await resetPassword(email);
    toast[error ? "error" : "success"](error ? error.message : "Password reset email sent (if the account exists).");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#051220] px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Lock className="w-5 h-5 text-[#8DB6D7]" />
          <span className="font-heading text-xl text-white tracking-wide">CALI TERRAIN ADMIN</span>
        </div>
        <form onSubmit={handleSubmit} className="border border-white/10 bg-[#0A1D31] rounded-sm p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#5A7896] mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
              className="w-full bg-[#0E2740] border border-white/10 focus:border-[#8DB6D7] text-white px-4 py-3 text-sm outline-none rounded-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#5A7896] mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              className="w-full bg-[#0E2740] border border-white/10 focus:border-[#8DB6D7] text-white px-4 py-3 text-sm outline-none rounded-sm" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary text-sm w-full justify-center">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
          <button type="button" onClick={handleReset} className="w-full text-center text-xs text-[#5A7896] hover:text-[#8DB6D7]">
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
