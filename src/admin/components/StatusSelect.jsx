import { useState } from "react";

// Inline status updater. Optimistic via the parent's onChange; reverts on error.
export default function StatusSelect({ value, options, onChange }) {
  const [busy, setBusy] = useState(false);
  const opt = options.find((o) => o.value === value) || options[0];

  const handle = async (e) => {
    const next = e.target.value;
    if (next === value) return;
    setBusy(true);
    await onChange(next);
    setBusy(false);
  };

  return (
    <select
      value={value}
      onChange={handle}
      disabled={busy}
      onClick={(e) => e.stopPropagation()}
      className="bg-[#1A1A1A] border text-xs font-semibold uppercase tracking-wide px-2 py-1.5 rounded-sm outline-none cursor-pointer disabled:opacity-50"
      style={{ color: opt?.color, borderColor: `${opt?.color}55` }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#1A1A1A] text-white">
          {o.label}
        </option>
      ))}
    </select>
  );
}
