// submit-booking — the ONLY public write path for the trial booking modal.
// A booking is a hot lead, so it dedupes/links to a lead by phone (bookings.lead_id).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

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

async function notifyOwner(b: Record<string, unknown>) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;
  const text =
    `📅 New trial booking\n\nName: ${b.name}\nPhone: ${b.phone}\n` +
    `Program: ${b.preferred_program ?? "-"}\nSlot: ${b.preferred_slot ?? "-"}\nGoal: ${b.fitness_goal ?? "-"}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (_e) { /* never block on notify failure */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ error: "Too many requests. Please try again shortly." }, 429);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }

  if (str(body.company)) return json({ ok: true }); // honeypot

  const name = str(body.name, 120);
  const phone = normPhone(body.phone);
  if (!name || phone.length < 7) return json({ error: "Name and a valid phone are required." }, 400);

  const ageRaw = parseInt(String(body.age ?? ""), 10);
  const age = Number.isFinite(ageRaw) && ageRaw > 0 && ageRaw < 120 ? ageRaw : null;
  const fitness_goal = str(body.fitness_goal ?? body.goal, 500) || null;
  const preferred_program = str(body.preferred_program ?? body.program, 120) || null;
  const preferred_slot = str(body.preferred_slot ?? body.preferred_time, 120) || null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Dedupe/link to the lead funnel: reuse the most recent lead with this phone, else create one.
  let leadId: string | null = null;
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.id) {
    leadId = existing.id;
  } else {
    const { data: newLead } = await supabase
      .from("leads")
      .insert({ name, phone, age, fitness_goal, interested_program: preferred_program, status: "new", source: "trial_modal" })
      .select("id")
      .single();
    leadId = newLead?.id ?? null;
  }

  const record = {
    lead_id: leadId,
    name, phone, age, fitness_goal,
    preferred_program, preferred_slot,
    notes: str(body.notes, 1000) || null,
    status: "pending",
    source: "trial_modal",
  };
  const { data, error } = await supabase.from("bookings").insert(record).select("id").single();
  if (error) {
    console.error("submit-booking insert failed", error);
    return json({ error: "Could not save your booking. Please try again." }, 500);
  }

  await notifyOwner(record);
  return json({ ok: true, id: data.id });
});
