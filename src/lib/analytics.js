// Lightweight GA4 wrapper. `track` is a no-op until the gtag snippet in
// index.html initializes (in dev, or before a real Measurement ID is set), so
// call sites never need to guard for it.
//
// PRIVACY: only ever pass non-PII context (a location label, a form name).
// Never send a visitor's name, phone or email through these events.
export function track(event, props = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, props);
}

// Named CTA helpers keep event names consistent across every call site.
export const trackBookTrial = (location) => track("book_trial_click", { location });
export const trackWhatsApp = (location) => track("whatsapp_click", { location });
export const trackCall = (location) => track("call_click", { location });
export const trackFormSubmit = (form) => track("form_submit", { form });
