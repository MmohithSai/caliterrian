// UI label <-> DB value mapping for status enums (single source of truth).
export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "#2EC4B6" },
  { value: "contacted", label: "Contacted", color: "#f59e0b" },
  { value: "converted", label: "Converted", color: "#22c55e" },
  { value: "lost", label: "Lost", color: "#71717a" },
];

export const BOOKING_STATUSES = [
  { value: "pending", label: "Pending", color: "#f59e0b" },
  { value: "confirmed", label: "Confirmed", color: "#2EC4B6" },
  { value: "attended", label: "Attended", color: "#22c55e" },
  { value: "no_show", label: "No Show", color: "#ef4444" },
];

export const PAGE_SIZE = 25;
