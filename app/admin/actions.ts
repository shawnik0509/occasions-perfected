"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";

const toPence = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[£,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function updateEnquiry(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = str(fd.get("id"));
  const status = str(fd.get("status"));
  const patch: Record<string, unknown> = { status, admin_notes: str(fd.get("admin_notes")) || null };
  if (status === "call_booked") patch.call_booked_at = new Date().toISOString();
  const { error } = await sb.from("enquiries").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/enquiries/${id}`); revalidatePath("/admin");
}

export async function createProposal(fd: FormData) {
  const { sb } = await requireAdmin();
  const enquiryId = str(fd.get("enquiry_id"));
  const { data: e } = await sb.from("enquiries").select("name, occasion").eq("id", enquiryId).single();
  const first = (e?.name ?? "").split(" ")[0];
  const { data, error } = await sb.from("proposals")
    .insert({ enquiry_id: enquiryId, title: `${e?.occasion ?? "Celebration"}${first ? ` for ${first}` : ""}` })
    .select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/admin/proposals/${data.id}`);
}

export async function saveProposal(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = str(fd.get("id"));
  await sb.from("proposals").update({ title: str(fd.get("title")) || "Your celebration", intro: str(fd.get("intro")) || null, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/proposals/${id}`);
}

export async function addItem(fd: FormData) {
  const { sb } = await requireAdmin();
  const pid = str(fd.get("proposal_id"));
  const label = str(fd.get("label"));
  if (!label) return;
  const { count } = await sb.from("proposal_items").select("id", { count: "exact", head: true }).eq("proposal_id", pid);
  await sb.from("proposal_items").insert({ proposal_id: pid, label, description: str(fd.get("description")) || null, amount_pence: toPence(fd.get("amount")), sort: (count ?? 0) + 1 });
  revalidatePath(`/admin/proposals/${pid}`);
}

export async function updateItem(fd: FormData) {
  const { sb } = await requireAdmin();
  const pid = str(fd.get("proposal_id"));
  const id = str(fd.get("id"));
  if (fd.get("_delete")) await sb.from("proposal_items").delete().eq("id", id);
  else await sb.from("proposal_items").update({ label: str(fd.get("label")), description: str(fd.get("description")) || null, amount_pence: toPence(fd.get("amount")) }).eq("id", id);
  revalidatePath(`/admin/proposals/${pid}`);
}

export async function sendProposal(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = str(fd.get("id"));
  const { error } = await sb.rpc("send_proposal", { p_id: id });
  if (error) redirect(`/admin/proposals/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/proposals/${id}`); revalidatePath("/admin");
  redirect(`/admin/proposals/${id}?sent=1`);
}

export async function setProposalStatus(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = str(fd.get("id"));
  const status = str(fd.get("status"));
  if (!["declined", "cancelled", "draft"].includes(status)) return;
  await sb.from("proposals").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/proposals/${id}`);
}

// For bank transfers / Open Banking taken outside Stripe
export async function recordPayment(fd: FormData) {
  const { sb } = await requireAdmin();
  const pid = str(fd.get("proposal_id"));
  const amount = toPence(fd.get("amount"));
  const kind = str(fd.get("kind")) === "balance" ? "balance" : "deposit";
  if (amount <= 0) return;
  const { data } = await sb.from("payments").insert({ proposal_id: pid, kind, amount_pence: amount, status: "pending" }).select("id").single();
  // inserting then marking paid fires the "deposit paid → booked" rule
  if (data) await sb.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", data.id);
  revalidatePath(`/admin/proposals/${pid}`); revalidatePath("/admin");
}

// ---------- Calendar ----------
export async function saveHours(fd: FormData) {
  const { sb } = await requireAdmin();
  const rows = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    weekday: d,
    is_open: fd.get(`open_${d}`) === "on",
    start_time: str(fd.get(`start_${d}`)) || "10:00",
    end_time: str(fd.get(`end_${d}`)) || "18:00",
  }));
  const bad = rows.find((r) => r.end_time <= r.start_time);
  if (bad) redirect(`/admin/calendar?error=${encodeURIComponent("Each day's closing time must be after its opening time.")}`);
  const { error } = await sb.from("availability_rules").upsert(rows);
  if (error) redirect(`/admin/calendar?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar?saved=hours");
}

export async function saveCallSettings(fd: FormData) {
  const { sb } = await requireAdmin();
  const n = (k: string) => Number(str(fd.get(k)));
  const { error } = await sb.from("call_settings").update({
    slot_minutes: n("slot_minutes"), min_notice_hours: n("min_notice_hours"), horizon_days: n("horizon_days"),
  }).eq("id", 1);
  if (error) redirect(`/admin/calendar?error=${encodeURIComponent("Those settings aren't allowed. Calls must be 10–120 minutes, notice 0–168 hours, and booking 1–90 days ahead.")}`);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar?saved=settings");
}

export async function addBlock(fd: FormData) {
  const { sb } = await requireAdmin();
  const allDay = fd.get("all_day") === "on";
  const { error } = await sb.rpc("admin_add_block", {
    p_date: str(fd.get("date")),
    p_end_date: str(fd.get("end_date")) || null,
    p_start: allDay ? null : str(fd.get("start")) || null,
    p_end: allDay ? null : str(fd.get("end")) || null,
    p_reason: str(fd.get("reason")) || null,
  });
  if (error) redirect(`/admin/calendar?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar?saved=block");
}

export async function removeBlock(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from("availability_blocks").delete().eq("id", str(fd.get("id")));
  revalidatePath("/admin/calendar");
}

export async function cancelCall(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = str(fd.get("id"));
  const { data } = await sb.from("call_bookings").update({ status: "cancelled" }).eq("id", id).select("enquiry_id").single();
  if (data) await sb.from("enquiries").update({ status: "new" }).eq("id", data.enquiry_id).eq("status", "call_booked");
  revalidatePath("/admin/calendar"); revalidatePath("/admin");
}

export async function completeCall(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from("call_bookings").update({ status: "completed" }).eq("id", str(fd.get("id")));
  revalidatePath("/admin/calendar");
}
