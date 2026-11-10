import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireAdmin } from "@/lib/supabase/server";
import { gbp, ukDate } from "@/lib/content";
import { enquiryStatus, adminProposalStatus } from "@/lib/labels";
import { updateEnquiry, createProposal } from "../../actions";

export const metadata: Metadata = { title: "Enquiry", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EnquiryAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin(`/admin/enquiries/${id}`);
  const { data: e } = await sb.from("enquiries").select("*, proposals(id, title, status, total_pence, sent_at)").eq("id", id).maybeSingle();
  if (!e) notFound();
  const phoneDigits = (e.phone ?? "").replace(/[^\d+]/g, "");
  const waDigits = phoneDigits.replace(/^\+/, "").replace(/^0/, "44");

  return (
    <AppShell isAdmin active="admin">
      <div className="stack-lg">
        <p className="crumbs"><Link href="/admin">Enquiries</Link> / {e.name}</p>
        <div className="spread">
          <div><h1>{e.name}</h1><p className="muted">{e.occasion}, received {new Date(e.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</p></div>
          <span className={`pill ${e.status}`}>{enquiryStatus[e.status]}</span>
        </div>

        <div className="grid-2" style={{ alignItems: "start" }}>
          <section className="card stack">
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>Details</h2>
            <dl className="kv">
              <dt>Email</dt><dd><a className="textlink" href={`mailto:${e.email}`}>{e.email}</a></dd>
              <dt>Phone</dt><dd>{e.phone ? <><a className="textlink" href={`tel:${phoneDigits}`}>{e.phone}</a>{e.whatsapp_ok && <> or <a className="textlink" href={`https://wa.me/${waDigits}`}>WhatsApp</a></>}</> : "Not given"}</dd>
              <dt>Event date</dt><dd>{e.event_date ? ukDate(e.event_date) : "Flexible"}</dd>
              <dt>Guests</dt><dd>{e.guests ?? "Not given"}</dd>
              <dt>Budget</dt><dd>{e.budget_pence ? `About ${gbp(e.budget_pence)}` : "Not sure yet"}</dd>
              <dt>Where</dt><dd>{e.town ?? "Not given"}</dd>
              <dt>Package</dt><dd>{e.package_slug ?? "None chosen"}</dd>
              <dt>Marketing</dt><dd>{e.marketing_opt_in ? "Opted in" : "Not opted in"}</dd>
            </dl>
            {e.notes && <><h3 className="small muted" style={{ fontWeight: 500 }}>Their notes</h3><p style={{ whiteSpace: "pre-line" }}>{e.notes}</p></>}
          </section>

          <section className="card">
            <form action={updateEnquiry} className="stack">
              <input type="hidden" name="id" value={e.id} />
              <label className="field"><span>Status</span>
                <select className="select" name="status" defaultValue={e.status}>
                  {Object.entries(enquiryStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="field"><span>Private notes</span>
                <textarea className="textarea" name="admin_notes" defaultValue={e.admin_notes ?? ""} placeholder="Call notes, ideas, supplier thoughts…" />
              </label>
              <div><button className="btn btn-ink btn-small">Save</button></div>
            </form>
          </section>
        </div>

        <section className="card stack">
          <div className="spread">
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>Proposals</h2>
            <form action={createProposal}><input type="hidden" name="enquiry_id" value={e.id} /><button className="btn btn-gold btn-small">New proposal</button></form>
          </div>
          {!e.proposals?.length ? <p className="muted small">No proposals yet. Aim to send one within 48 hours of the call.</p> : (
            <table className="table"><tbody>
              {e.proposals.map((p: { id: string; title: string; status: string; total_pence: number }) => (
                <tr key={p.id}><td><Link href={`/admin/proposals/${p.id}`}>{p.title}</Link></td><td><span className={`pill ${p.status}`}>{adminProposalStatus[p.status]}</span></td><td className="num">{gbp(p.total_pence)}</td></tr>
              ))}
            </tbody></table>
          )}
        </section>
      </div>
    </AppShell>
  );
}
