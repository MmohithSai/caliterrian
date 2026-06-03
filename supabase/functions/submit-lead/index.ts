// submit-lead — the ONLY public write path for the contact form.
// Validates + normalizes input, forces server-side defaults, inserts via
// service-role (bypasses RLS), then fires an owner notification.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Best-effort per-IP rate limit (per warm instance). Real protection is the
// honeypot + validation; this just blunts trivial floods.
const HITS = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60_000;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  HITS.set(ip, hits);
  return hits.length > LIMIT;
}

const str = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const normPhone = (v: unknown) => str(v, 20).replace(/[^\d+]/g, "");

async function notifyOwner(lead: Record<string, unknown>) {
  // Telegram-ready hook: stays a no-op until TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID are set.
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;
  const text =
    `🆕 New lead\n\nName: ${lead.name}\nPhone: ${lead.phone}\n` +
    `Program: ${lead.interested_program ?? "-"}\nGoal: ${lead.fitness_goal ?? "-"}\n` +
    `Message: ${lead.message ?? "-"}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (_e) { /* never block the submission on a notify failure */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ error: "Too many requests. Please try again shortly." }, 429);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (str(body.company)) return json({ ok: true });

  const name = str(body.name, 120);
  const phone = normPhone(body.phone);
  if (!name || phone.length < 7) return json({ error: "Name and a valid phone are required." }, 400);

  const ageRaw = parseInt(String(body.age ?? ""), 10);
  const record = {
    name,
    phone,
    age: Number.isFinite(ageRaw) && ageRaw > 0 && ageRaw < 120 ? ageRaw : null,
    fitness_goal: str(body.fitness_goal, 500) || null,
    interested_program: str(body.interested_program, 120) || null,
    message: str(body.message, 2000) || null,
    status: "new",
    source: "contact_form",
  };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase.from("leads").insert(record).select("id").single();
  if (error) {
    console.error("submit-lead insert failed", error);
    return json({ error: "Could not save your message. Please try again." }, 500);
  }

  await notifyOwner(record);
  return json({ ok: true, id: data.id });
});
