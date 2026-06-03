export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const telHref = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;
export const waHref = (phone) => `https://wa.me/${String(phone || "").replace(/[^\d]/g, "")}`;
