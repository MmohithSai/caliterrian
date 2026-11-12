import { waLink } from "@/data/site";

// Appends a form submission to the Google Sheet (Apps Script web app, see
// BACKEND_SETUP.md), then sends the visitor to WhatsApp in the same tab.
// The redirect happens even if the Sheet write fails: the WhatsApp message
// carries the same details, so the lead is never lost.
export async function submitAndOpenWhatsApp(source, fields, message) {
  const url = import.meta.env.VITE_SHEET_URL;
  try {
    // No Content-Type header → text/plain "simple" request, so no CORS preflight
    // (Apps Script can't answer one).
    if (url) await fetch(url, { method: "POST", body: JSON.stringify({ source, ...fields }), signal: AbortSignal.timeout(8000) });
  } catch { /* WhatsApp message still carries the details */ }
  window.location.href = waLink(message);
}
