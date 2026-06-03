import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarCheck, Flame, Clock, Loader2, ArrowRight } from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/admin/api";
import { fmtDateTime } from "@/admin/utils";
import StatusBadge from "@/admin/components/StatusBadge";
import { LEAD_STATUSES, BOOKING_STATUSES } from "@/admin/constants";

function StatCard({ icon: Icon, label, value, to, accent = "#2EC4B6", loading }) {
  const body = (
    <div className="border border-white/10 bg-[#121212] rounded-sm p-5 h-full hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="w-9 h-9 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${accent}1a`, color: accent }}>
          <Icon className="w-4 h-4" />
        </span>
        {to && <ArrowRight className="w-4 h-4 text-zinc-600" />}
      </div>
      <p className="text-3xl font-heading text-white">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}</p>
      <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([getDashboardStats(), getRecentActivity(8)]);
        setStats(s); setActivity(a);
      } catch (e) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-3xl text-white mb-1">Dashboard</h1>
      <p className="text-zinc-500 text-sm mb-6">Operational overview — leads & trial bookings.</p>

      {error && <div className="border border-red-500/30 bg-red-500/5 text-red-300 text-sm p-4 rounded-sm mb-6">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Flame} label="Uncontacted leads" value={stats?.uncontactedLeads ?? 0} to="/admin/leads?status=new" accent="#f59e0b" loading={loading} />
        <StatCard icon={Clock} label="Pending bookings" value={stats?.pendingBookings ?? 0} to="/admin/bookings?status=pending" accent="#2EC4B6" loading={loading} />
        <StatCard icon={Users} label="Total leads" value={stats?.totalLeads ?? 0} to="/admin/leads" loading={loading} />
        <StatCard icon={CalendarCheck} label="Total bookings" value={stats?.totalBookings ?? 0} to="/admin/bookings" loading={loading} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={Users} label="New leads this week" value={stats?.newLeadsThisWeek ?? 0} loading={loading} />
        <StatCard icon={CalendarCheck} label="New bookings this week" value={stats?.newBookingsThisWeek ?? 0} loading={loading} />
      </div>

      {/* Recent activity */}
      <div className="border border-white/10 bg-[#121212] rounded-sm">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-heading text-lg text-white">Recent activity</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : activity.length === 0 ? (
          <p className="text-zinc-500 text-sm px-5 py-10 text-center">No activity yet. Submissions will appear here.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {activity.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link to={item.kind === "lead" ? "/admin/leads" : "/admin/bookings"}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.name} <span className="text-zinc-600 font-normal">· {item.kind === "lead" ? "Lead" : "Booking"}</span>
                    </p>
                    <p className="text-zinc-500 text-xs">{item.phone} · {fmtDateTime(item.created_at)}</p>
                  </div>
                  <StatusBadge value={item.status} options={item.kind === "lead" ? LEAD_STATUSES : BOOKING_STATUSES} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
