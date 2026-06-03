export default function StatusBadge({ value, options }) {
  const opt = options.find((o) => o.value === value) || { label: value, color: "#71717a" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-sm"
      style={{ color: opt.color, backgroundColor: `${opt.color}1a`, border: `1px solid ${opt.color}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: opt.color }} />
      {opt.label}
    </span>
  );
}
