import Link from "next/link";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireAdmin } from "@/lib/supabase/server";
import { gbp, ukDate } from "@/lib/content";
import { enquiryStatus } from "@/lib/labels";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const filters = [
  ["open", "Open"], ["new", "New"], ["call_booked", "Call booked"], ["proposal_sent", "Proposal sent"],
  ["accepted", "Accepted"], ["booked", "Booked"], ["completed", "Completed"], ["lost", "Closed"], ["all", "All"],
] as const;

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const f = sp.f ?? "open";
  const { sb } = await requireAdmin();

  let q = sb.from("enquiries").select("id, created_at, name, occasion, event_date, guests, budget_pence, town, status, call_booked_at").order("created_at", { ascending: false }).limit(200);
  if (f === "open") q = q.in("status", ["new", "call_booked", "proposal_sent", "accepted"]);
  else if (f !== "all") q = q.eq("status", f);

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: rows }, { data: all }, { data: paid }, { data: upcoming }] = await Promise.all([
    q,
    sb.from("enquiries").select("status"),
    sb.from("payments").select("amount_pence").eq("status", "paid"),
    sb.from("enquiries").select("id, name, occasion, event_date, guests, town").eq("status", "booked").gte("event_date", today).order("event_date").limit(20),
  ]);
  const count = (s: string) => (all ?? []).filter((r) => r.status === s).length;
  const taken = (paid ?? []).reduce((s, r) => s + r.amount_pence, 0);
  const dayCount: Record<string, number> = {};
  (upcoming ?? []).forEach((u) => { if (u.event_date) dayCount[u.event_date] = (dayCount[u.event_date] ?? 0) + 1; });
  const stale = (r: { status: string; created_at: string }) => r.status === "new" && Date.now() - new Date(r.created_at).getTime() > 24 * 3600 * 1000;

  return (
    <AppShell isAdmin active="admin">
      <div className="stack-lg">
        <h1>Enquiries and bookings</h1>
        <div className="stats">
          <div className="card"><p>New enquiries</p><p>{count("new")}</p></div>
          <div className="card"><p>Proposals out</p><p>{count("proposal_sent")}</p></div>
          <div className="card"><p>Booked</p><p>{count("booked")}</p></div>
          <div className="card"><p>Payments received</p><p>{gbp(taken)}</p></div>
        </div>

        {(upcoming ?? []).length > 0 && (
          <section className="card stack">
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>Coming up</h2>
            <div className="table-wrap"><table className="table"><tbody>
              {upcoming!.map((u) => (
                <tr key={u.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{ukDate(u.event_date)}{u.event_date && dayCount[u.event_date] > 1 && <> <span className="pill new">{dayCount[u.event_date]} that day</span></>}</td>
                  <td><Link href={`/admin/enquiries/${u.id}`}>{u.name}</Link></td><td>{u.occasion}</td><td>{u.town ?? ""}</td><td className="num">{u.guests ?? ""}</td>
                </tr>
              ))}
            </tbody></table></div>
          </section>
        )}

        <nav className="tabs" aria-label="Filter">
          {filters.map(([k, l]) => <Link key={k} href={`/admin?f=${k}`} aria-current={f === k ? "page" : undefined}>{l}</Link>)}
        </nav>

        <section className="card" style={{ padding: 0 }}>
          {!rows?.length ? <p className="muted" style={{ padding: 24 }}>No enquiries here. New enquiries from the website appear at the top.</p> : (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Received</th><th>Name</th><th>Occasion</th><th>Event date</th><th className="num">Guests</th><th className="num">Budget</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}</td>
                    <td><Link href={`/admin/enquiries/${r.id}`}>{r.name}</Link>{r.town && <div className="muted">{r.town}</div>}</td>
                    <td>{r.occasion}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{r.event_date ? ukDate(r.event_date, false) : "Flexible"}</td>
                    <td className="num">{r.guests ?? ""}</td>
                    <td className="num">{r.budget_pence ? gbp(r.budget_pence) : "Not sure"}</td>
                    <td><span className={`pill ${r.status}`}>{enquiryStatus[r.status]}</span>{stale(r) && <> <span className="pill lost">Follow up</span></>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
