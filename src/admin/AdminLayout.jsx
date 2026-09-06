import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, CalendarCheck, LogOut } from "lucide-react";
import { useAuth } from "@/admin/context/AuthContext";

const NAV = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
];

function NavItems({ onNavigate }) {
  return NAV.map(({ to, end, label, icon: Icon }) => (
    <NavLink
      key={to} to={to} end={end} onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
          isActive ? "bg-[#2EC4B6]/15 text-[#2EC4B6]" : "text-zinc-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <Icon className="w-4 h-4" /> {label}
    </NavLink>
  ));
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-60 flex-col border-r border-white/10 bg-[#0D0D0D] p-4 sticky top-0 h-screen">
        <div className="font-heading text-lg tracking-wide mb-8 px-2">
          CALI<span className="text-[#2EC4B6]">TERRAIN</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1"><NavItems /></nav>
        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-zinc-600 text-xs px-3 mb-2 truncate" title={user?.email}>{user?.email}</p>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-zinc-400 hover:text-red-400 hover:bg-white/5 w-full transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0D0D0D] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-base tracking-wide">CALI<span className="text-[#2EC4B6]">TERRAIN</span></span>
          <button onClick={signOut} className="text-zinc-400 hover:text-red-400" aria-label="Sign out"><LogOut className="w-5 h-5" /></button>
        </div>
        <nav className="flex gap-1 px-2 pb-2 overflow-x-auto"><NavItems /></nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
