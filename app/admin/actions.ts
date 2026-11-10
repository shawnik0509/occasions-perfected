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
