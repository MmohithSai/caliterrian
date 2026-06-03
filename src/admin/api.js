import { supabase } from "@/lib/supabase";

// ---- Auth ---------------------------------------------------------------
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();
export const getSession = () => supabase.auth.getSession();
export const resetPassword = (email) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/login` });

export async function isAdmin(userId) {
  if (!userId) return false;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
}

// PostgREST `or` is built from a raw string, so user input MUST be escaped or it
// becomes a filter-injection bug. Strip chars with meaning in the filter grammar.
const safe = (s) => s.replace(/[,()*\\%]/g, " ").trim();

// Generic list builder shared by leads + bookings (same shape, different table).
function listRecords(table) {
  return async function ({ search = "", status = "all", from = 0, to = 24 }) {
    let q = supabase
      .from(table)
      .select("*", { count: "exact" })
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status !== "all") q = q.eq("status", status); // enum → no injection surface
    if (search) {
      const s = safe(search);
      if (s) q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%`);
    }
    return q; // -> { data, count, error }
  };
}

const updateRow = (table) => (id, patch) =>
  supabase.from(table).update(patch).eq("id", id).select().single();

// ---- Leads --------------------------------------------------------------
export const getLeads = listRecords("leads");
export const updateLeadStatus = (id, status) => updateRow("leads")(id, { status });
export const updateLeadNotes = (id, admin_notes) => updateRow("leads")(id, { admin_notes });
export const archiveLead = (id) => updateRow("leads")(id, { archived: true });

// ---- Bookings -----------------------------------------------------------
export const getBookings = listRecords("bookings");
export const updateBookingStatus = (id, status) => updateRow("bookings")(id, { status });
export const updateBookingNotes = (id, admin_notes) => updateRow("bookings")(id, { admin_notes });
export const archiveBooking = (id) => updateRow("bookings")(id, { archived: true });

// ---- Dashboard ----------------------------------------------------------
export async function getDashboardStats() {
  const { data, error } = await supabase.rpc("get_admin_stats");
  if (error) throw error;
  return data;
}

export async function getRecentActivity(limit = 6) {
  const [leads, bookings] = await Promise.all([
    supabase.from("leads").select("id,name,phone,status,created_at").eq("archived", false).order("created_at", { ascending: false }).limit(limit),
    supabase.from("bookings").select("id,name,phone,status,created_at").eq("archived", false).order("created_at", { ascending: false }).limit(limit),
  ]);
  const items = [
    ...(leads.data || []).map((r) => ({ ...r, kind: "lead" })),
    ...(bookings.data || []).map((r) => ({ ...r, kind: "booking" })),
  ];
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items.slice(0, limit);
}
