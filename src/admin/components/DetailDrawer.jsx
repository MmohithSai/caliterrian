import { useEffect, useState } from "react";
import { X, Phone, Save, Archive } from "lucide-react";
import { WhatsAppIcon as WhatsApp } from "@/components/icons";
import { toast } from "sonner";
import StatusSelect from "./StatusSelect";
import { fmtDateTime, telHref, waHref } from "@/admin/utils";

// Generic record detail drawer. `fields` describes what to show; notes + status are editable.
export default function DetailDrawer({ record, fields, statuses, onClose, onStatusChange, onSaveNotes, onArchive }) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => { setNotes(record?.admin_notes || ""); }, [record]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!record) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [record, onClose]);

  if (!record) return null;

  const saveNotes = async () => {
    setSavingNotes(true);
    const ok = await onSaveNotes(record.id, notes);
    setSavingNotes(false);
    toast[ok ? "success" : "error"](ok ? "Notes saved" : "Could not save notes");
  };

  const archive = async () => {
    if (!confirm("Archive this record? It will be hidden from the list.")) return;
    const ok = await onArchive(record.id);
    if (ok) { toast.success("Archived"); onClose(); }
    else toast.error("Could not archive");
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true" aria-label="Record details">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#0D0D0D] border-l border-white/10 overflow-y-auto">
        <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl text-white leading-tight">{record.name}</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Added {fmtDateTime(record.created_at)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <a href={telHref(record.phone)} className="flex items-center justify-center gap-2 bg-[#2EC4B6] text-black font-bold text-sm py-2.5 rounded-sm">
              <Phone className="w-4 h-4" /> Call
            </a>
            <a href={waHref(record.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold text-sm py-2.5 rounded-sm">
              <WhatsApp className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Status</p>
            <StatusSelect value={record.status} options={statuses} onChange={(s) => onStatusChange(record.id, s)} />
          </div>

          {/* Fields */}
          <dl className="space-y-3">
            {fields.map((f) => {
              const val = f.render ? f.render(record) : record[f.key];
              if (val === null || val === undefined || val === "") return null;
              return (
                <div key={f.label}>
                  <dt className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-0.5">{f.label}</dt>
                  <dd className="text-sm text-zinc-200 whitespace-pre-wrap break-words">{val}</dd>
                </div>
              );
            })}
          </dl>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Private Notes</p>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Follow-up notes (only you can see these)..."
              className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-3 py-2 text-sm outline-none resize-none rounded-sm"
            />
            <button onClick={saveNotes} disabled={savingNotes} className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#2EC4B6] hover:text-white disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingNotes ? "Saving..." : "Save notes"}
            </button>
          </div>

          <button onClick={archive} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 pt-2">
            <Archive className="w-4 h-4" /> Archive (hide from list)
          </button>
        </div>
      </div>
    </div>
  );
}
