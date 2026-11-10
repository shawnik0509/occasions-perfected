import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireAdmin } from "@/lib/supabase/server";
import { gbp, ukDate, site } from "@/lib/content";
import { adminProposalStatus, paymentStatus } from "@/lib/labels";
import { saveProposal, addItem, updateItem, sendProposal, setProposalStatus, recordPayment } from "../../actions";

export const metadata: Metadata = { title: "Proposal", robots: { index: false } };
export const dynamic = "force-dynamic";

const h2 = { fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" } as const;

export default async function ProposalAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb } = await requireAdmin(`/admin/proposals/${id}`);
  const { data: p } = await sb.from("proposals")
    .select("*, enquiries(id, name, email, occasion, event_date), proposal_items(id, label, description, amount_pence, sort), payments(id, kind, amount_pence, status, paid_at, created_at, stripe_session_id)")
    .eq("id", id).maybeSingle();
  if (!p) notFound();

  const enq = p.enquiries as { id: string; name: string; email: string; occasion: string; event_date: string | null };
  const items = [...(p.proposal_items ?? [])].sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort);
  const payments = [...(p.payments ?? [])].sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at));
  const paidTotal = payments.filter((x: { status: string }) => x.status === "paid").reduce((s: number, x: { amount_pence: number }) => s + x.amount_pence, 0);
  const editable = p.status === "draft" || p.status === "sent" || p.status === "expired";
  const portalLink = `${site.url.replace(/\/$/, "")}/portal/proposal/${p.id}`;

  return (
    <AppShell isAdmin active="admin">
      <div className="stack-lg" style={{ maxWidth: 940 }}>
        <p className="crumbs"><Link href="/admin">Enquiries</Link> / <Link href={`/admin/enquiries/${enq.id}`}>{enq.name}</Link> / Proposal</p>
        <div className="spread">
          <h1>{p.title}</h1>
          <span className={`pill ${p.status}`}>{adminProposalStatus[p.status]}</span>
        </div>
        {sp.sent && <p className="notice ok" role="status">Sent. {enq.name} can now see it in their portal. Email them the link below so they know it&rsquo;s ready.</p>}
        {sp.error && <p className="notice danger" role="alert">{sp.error}</p>}
        {!editable && <p className="notice">This proposal has been {p.status}. Line items are locked so the agreed price can&rsquo;t change by accident.</p>}

        <section className="card stack">
          <form action={saveProposal} className="stack">
            <input type="hidden" name="id" value={p.id} />
            <label className="field"><span>Title the client sees</span><input className="input" name="title" defaultValue={p.title} disabled={!editable} /></label>
            <label className="field"><span>Personal introduction</span>
              <textarea className="textarea" name="intro" defaultValue={p.intro ?? ""} disabled={!editable} placeholder={`Hi ${enq.name.split(" ")[0]}, it was lovely to talk about…`} />
            </label>
            {editable && <div><button className="btn btn-line btn-small">Save wording</button></div>}
          </form>
        </section>

        <section className="card stack">
          <h2 style={h2}>What&rsquo;s included</h2>
          <p className="small muted">The client sees each line and its price, and one total. Only include what you&rsquo;re happy for them to see; supplier names are never shown unless you type them.</p>
          <div className="items-edit">
            {items.map((i: { id: string; label: string; description: string | null; amount_pence: number }) => (
              <form key={i.id} action={updateItem} className="item-row">
                <input type="hidden" name="id" value={i.id} /><input type="hidden" name="proposal_id" value={p.id} />
                <input className="input" name="label" defaultValue={i.label} aria-label="Item" disabled={!editable} />
                <input className="input" name="description" defaultValue={i.description ?? ""} aria-label="Description" disabled={!editable} />
                <input className="input" name="amount" defaultValue={(i.amount_pence / 100).toFixed(2)} aria-label="Price in pounds" inputMode="decimal" disabled={!editable} />
                {editable && <div className="row"><button className="btn btn-line btn-small">Save</button><button className="btn btn-line btn-small" name="_delete" value="1">Remove</button></div>}
              </form>
            ))}
            {editable && (
              <form action={addItem} className="item-row">
                <input type="hidden" name="proposal_id" value={p.id} />
                <input className="input" name="label" placeholder="e.g. Garden styling and lighting" aria-label="New item" required />
                <input className="input" name="description" placeholder="Details the client will see (optional)" aria-label="New item description" />
                <input className="input" name="amount" placeholder="£" aria-label="New item price in pounds" inputMode="decimal" />
                <div><button className="btn btn-ink btn-small">Add</button></div>
              </form>
            )}
          </div>
          <div className="spread" style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <span className="muted small">Deposit (50%): {gbp(p.deposit_pence, { pence: true })}</span>
            <strong style={{ fontSize: "var(--step-1)", fontWeight: 600 }}>Total {gbp(p.total_pence, { pence: true })}</strong>
          </div>
        </section>

        <section className="card stack">
          <h2 style={h2}>Send</h2>
          {p.status === "sent" && p.expires_at && <p className="small">Sent {ukDate(p.sent_at)}. Held until {ukDate(p.expires_at)}.</p>}
          <p className="small muted">Client link: <a className="textlink" href={portalLink}>{portalLink}</a>. They sign in with {enq.email}.</p>
          <div className="row">
            {editable && (
              <form action={sendProposal}><input type="hidden" name="id" value={p.id} />
                <button className="btn btn-gold" disabled={p.total_pence <= 0}>{p.status === "draft" ? "Send to client" : "Resend and hold for 7 more days"}</button>
              </form>
            )}
            {p.status !== "accepted" && p.status !== "cancelled" && p.status !== "declined" && (
              <form action={setProposalStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="declined" />
                <button className="btn btn-line btn-small">Mark as declined</button></form>
            )}
            {p.status === "accepted" && (
              <form action={setProposalStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="cancelled" />
                <button className="btn btn-line btn-small">Mark as cancelled</button></form>
            )}
          </div>
        </section>

        <section className="card stack">
          <div className="spread"><h2 style={h2}>Payments</h2><span className="small muted">Received {gbp(paidTotal, { pence: true })} of {gbp(p.total_pence, { pence: true })}</span></div>
          {payments.length > 0 && (
            <div className="table-wrap"><table className="table"><tbody>
              {payments.map((x: { id: string; kind: string; amount_pence: number; status: string; paid_at: string | null; created_at: string; stripe_session_id: string | null }) => (
                <tr key={x.id}>
                  <td>{x.kind === "deposit" ? "Deposit" : "Balance"}</td>
                  <td>{x.stripe_session_id ? "Card (Stripe)" : "Bank transfer"}</td>
                  <td>{ukDate(x.paid_at ?? x.created_at)}</td>
                  <td><span className={`pill ${x.status}`}>{paymentStatus[x.status]}</span></td>
                  <td className="num">{gbp(x.amount_pence, { pence: true })}</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
          {p.status === "accepted" && (
            <form action={recordPayment} className="row">
              <input type="hidden" name="proposal_id" value={p.id} />
              <select className="select" name="kind" style={{ width: "auto" }} aria-label="Payment type"><option value="deposit">Deposit</option><option value="balance">Balance</option></select>
              <input className="input" name="amount" placeholder="£ received" inputMode="decimal" aria-label="Amount received in pounds" style={{ width: 160 }} required />
              <button className="btn btn-line btn-small">Record bank transfer</button>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
