import Link from "next/link";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/supabase/server";
import { gbp, ukDate, whatsappLink } from "@/lib/content";
import { enquiryStatus, proposalStatus } from "@/lib/labels";

export const metadata: Metadata = { title: "My celebrations", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Portal({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { sb, user } = await requireUser("/portal");
  const [{ data: profile }, { data: enquiries }] = await Promise.all([
    sb.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    sb.from("enquiries")
      .select("id, occasion, event_date, guests, status, created_at, proposals(id, title, status, total_pence, expires_at)")
      .eq("email", (user.email ?? "").toLowerCase())
      .order("created_at", { ascending: false }),
  ]);
  const isAdmin = profile?.role === "admin";
  const wa = whatsappLink("Hi, I have a question about my celebration.");

  return (
    <AppShell isAdmin={isAdmin} active="portal">
      <div className="stack-lg">
        <div className="spread">
          <div>
            <h1>My celebrations</h1>
            <p className="muted small">Signed in as {user.email}</p>
          </div>
          <Link href="/plan" className="btn btn-ink btn-small">Plan another celebration</Link>
        </div>
        {sp.notice === "admin-only" && <p className="notice">That page is for the Occasions Perfected team only.</p>}

        {!enquiries?.length && (
          <div className="card stack">
            <h2 style={{ fontSize: "var(--step-2)" }}>Nothing here yet</h2>
            <p className="muted">Enquiries made with {user.email} appear here. If you used a different email, sign out and sign in with that one.</p>
            <div className="row"><Link href="/plan" className="btn btn-gold">Plan my celebration</Link></div>
          </div>
        )}

        {enquiries?.map((e) => {
          const props = (e.proposals ?? []).filter((p) => p.status !== "draft");
          return (
            <section key={e.id} className="card stack">
              <div className="spread">
                <div>
                  <h2 style={{ fontSize: "var(--step-2)" }}>{e.occasion}</h2>
                  <p className="muted small">{ukDate(e.event_date)}{e.guests ? `, about ${e.guests} guests` : ""}</p>
                </div>
                <span className={`pill ${e.status}`}>{enquiryStatus[e.status] ?? e.status}</span>
              </div>
              {props.length === 0 ? (
                <p className="muted small">
                  {e.status === "new" || e.status === "call_booked"
                    ? "Your concierge is preparing your proposal. It will appear here within 48 hours of your call."
                    : "No proposal yet."}
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>Proposal</th><th>Status</th><th className="num">Total</th></tr></thead>
                    <tbody>
                      {props.map((p) => (
                        <tr key={p.id}>
                          <td><Link href={`/portal/proposal/${p.id}`}>{p.title}</Link></td>
                          <td><span className={`pill ${p.status}`}>{proposalStatus[p.status] ?? p.status}</span></td>
                          <td className="num">{gbp(p.total_pence)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
        {wa && <p className="small muted">Questions? <a className="textlink" href={wa}>WhatsApp your concierge</a></p>}
      </div>
    </AppShell>
  );
}
