import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Phone, ChevronLeft, ChevronRight, Loader2, Inbox } from "lucide-react";
import { WhatsAppIcon as WhatsApp } from "@/components/icons";
import { toast } from "sonner";
import StatusBadge from "./StatusBadge";
import StatusSelect from "./StatusSelect";
import DetailDrawer from "./DetailDrawer";
import { PAGE_SIZE } from "@/admin/constants";
import { fmtDate, telHref, waHref } from "@/admin/utils";

export default function RecordsPage({ title, statuses, api, columns, detailFields }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(0);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const firstLoad = useRef(true);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page whenever filters change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [debounced, status]);

  // Keep ?status= in the URL so dashboard deep-links + refresh persist.
  useEffect(() => {
    setSearchParams(status === "all" ? {} : { status }, { replace: true });
  }, [status, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = page * PAGE_SIZE;
    const { data, count: total, error: err } = await api.list({ search: debounced, status, from, to: from + PAGE_SIZE - 1 });
    if (err) { setError(err.message || "Failed to load"); setRows([]); }
    else { setRows(data || []); setCount(total || 0); }
    setLoading(false);
    firstLoad.current = false;
  }, [api, debounced, status, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // Optimistic status update with revert on failure.
  const changeStatus = async (id, next) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: next } : x)));
    setSelected((s) => (s?.id === id ? { ...s, status: next } : s));
    const { error: err } = await api.updateStatus(id, next);
    if (err) { setRows(prev); toast.error("Could not update status"); }
    else toast.success("Status updated");
  };

  const saveNotes = async (id, notes) => {
    const { error: err } = await api.updateNotes(id, notes);
    if (!err) setRows((r) => r.map((x) => (x.id === id ? { ...x, admin_notes: notes } : x)));
    return !err;
  };

  const archive = async (id) => {
    const { error: err } = await api.archive(id);
    if (!err) { setRows((r) => r.filter((x) => x.id !== id)); setCount((c) => Math.max(0, c - 1)); }
    return !err;
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  // Show the full-page spinner only on the very first load (not on filter refetches).
  // eslint-disable-next-line react-hooks/refs
  const isFirstLoad = firstLoad.current;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl text-white">{title}</h1>
          <p className="text-zinc-500 text-sm mt-1">{count} {count === 1 ? "record" : "records"}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full bg-[#141414] border border-white/10 focus:border-[#2EC4B6] text-white pl-9 pr-4 py-2.5 text-sm outline-none rounded-sm placeholder-zinc-600"
          />
        </div>
        <select
          value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-[#141414] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-2.5 text-sm outline-none rounded-sm cursor-pointer"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* States */}
      {error && (
        <div className="border border-red-500/30 bg-red-500/5 text-red-300 text-sm p-4 rounded-sm">
          {error} <button onClick={load} className="underline ml-2">Retry</button>
        </div>
      )}

      {loading && isFirstLoad ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : !error && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Inbox className="w-8 h-8 mb-3 opacity-50" />
          <p className="text-sm">No {title.toLowerCase()} {debounced || status !== "all" ? "match your filters" : "yet"}.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-white/10 rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#141414] text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  {columns.map((c) => <th key={c.label} className="text-left font-semibold px-4 py-3">{c.label}</th>)}
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-right font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => setSelected(row)}
                    className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors">
                    {columns.map((c) => (
                      <td key={c.label} className="px-4 py-3 text-zinc-200">{c.render ? c.render(row) : (row[c.key] || "—")}</td>
                    ))}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect value={row.status} options={statuses} onChange={(s) => changeStatus(row.id, s)} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <a href={telHref(row.phone)} title="Call" className="p-1.5 text-[#2EC4B6] hover:bg-[#2EC4B6]/10 rounded-sm"><Phone className="w-4 h-4" /></a>
                        <a href={waHref(row.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-sm"><WhatsApp className="w-4 h-4" /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {rows.map((row) => (
              <div key={row.id} onClick={() => setSelected(row)}
                className="border border-white/10 bg-[#121212] rounded-sm p-4 active:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-white font-bold truncate">{row.name}</p>
                    <p className="text-zinc-500 text-xs">{row.phone} · {fmtDate(row.created_at)}</p>
                  </div>
                  <StatusBadge value={row.status} options={statuses} />
                </div>
                {columns.filter((c) => c.mobile).map((c) => (
                  <p key={c.label} className="text-zinc-400 text-xs">{c.label}: <span className="text-zinc-200">{c.render ? c.render(row) : (row[c.key] || "—")}</span></p>
                ))}
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <a href={telHref(row.phone)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#2EC4B6]/15 text-[#2EC4B6] text-sm font-semibold py-2 rounded-sm"><Phone className="w-4 h-4" /> Call</a>
                  <a href={waHref(row.phone)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/15 text-[#25D366] text-sm font-semibold py-2 rounded-sm"><WhatsApp className="w-4 h-4" /> WhatsApp</a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 text-sm">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-zinc-500">Page {page + 1} of {totalPages}</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <DetailDrawer
        record={selected} fields={detailFields} statuses={statuses}
        onClose={() => setSelected(null)}
        onStatusChange={changeStatus} onSaveNotes={saveNotes} onArchive={archive}
      />
    </div>
  );
}
