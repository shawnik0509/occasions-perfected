import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/supabase/server";
import { gbp, ukDate, site } from "@/lib/content";
import { proposalStatus, paymentStatus, balanceDue } from "@/lib/labels";
import ProposalActions from "./ProposalActions";

export const metadata: Metadata = { title: "Your proposal", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ProposalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb, user } = await requireUser(`/portal/proposal/${id}`);
  const [{ data: p }, { data: profile }] = await Promise.all([
    sb.from("proposals")
      .select("id, title, intro, status, total_pence, deposit_pence, sent_at, expires_at, accepted_at, enquiries(name, occasion, event_date, guests, town), proposal_items(id, label, description, amount_pence, sort), payments(id, kind, amount_pence, status, paid_at, created_at)")
      .eq("id", id).maybeSingle(),
    sb.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);
  if (!p || p.status === "draft") notFound();

  const enq = p.enquiries as unknown as { name: string; occasion: string; event_date: string | null; guests: number | null; town: string | null };
  const items = [...(p.proposal_items ?? [])].sort((a, b) => a.sort - b.sort);
  const paid = (p.payments ?? []).filter((x) => x.status === "paid");
  const paidTotal = paid.reduce((s, x) => s + x.amount_pence, 0);
  const depositPaid = paid.some((x) => x.kind === "deposit");
  const remaining = p.total_pence - paidTotal;
  const expired = p.status === "sent" && p.expires_at && new Date(p.expires_at) < new Date();
  const due = balanceDue(enq.event_date);

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="portal">
      <div className="stack-lg" style={{ maxWidth: 820 }}>
        <p className="crumbs no-print"><Link href="/portal">My celebrations</Link> / Proposal</p>
        {sp.paid && <p className="notice ok" role="status">Thank you, your payment went through. It can take a minute to show below.</p>}

        <article className="card stack-lg">
          <header className="stack">
            <div className="spread">
              <span className="small muted">{site.name}</span>
              <span className={`pill ${expired ? "expired" : p.status}`}>{expired ? "Expired" : proposalStatus[p.status] ?? p.status}</span>
            </div>
            <h1>{p.title}</h1>
            <dl className="kv">
              <dt>For</dt><dd>{enq.name}</dd>
              <dt>Occasion</dt><dd>{enq.occasion}</dd>
              <dt>Date</dt><dd>{ukDate(enq.event_date)}</dd>
              {enq.guests ? (<><dt>Guests</dt><dd>About {enq.guests}</dd></>) : null}
              {enq.town ? (<><dt>Where</dt><dd>{enq.town}</dd></>) : null}
              {p.status === "sent" && p.expires_at && <><dt>Held until</dt><dd>{ukDate(p.expires_at)}</dd></>}
            </dl>
          </header>

          {p.intro && <p style={{ whiteSpace: "pre-line" }}>{p.intro}</p>}

          <table className="proposal-lines">
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><strong style={{ fontWeight: 500 }}>{i.label}</strong>{i.description && <div className="small muted" style={{ marginTop: 4, whiteSpace: "pre-line" }}>{i.description}</div>}</td>
                  <td>{gbp(i.amount_pence)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td>Total</td><td>{gbp(p.total_pence)}</td></tr></tfoot>
          </table>

          <div className="stack small">
            <p><strong style={{ fontWeight: 500 }}>Deposit to secure your date (50%):</strong> {gbp(p.deposit_pence)}</p>
            <p><strong style={{ fontWeight: 500 }}>Balance:</strong> {gbp(p.total_pence - p.deposit_pence)}, due {due ? ukDate(due) : "14 days before your celebration"}</p>
            <p className="muted">One total price for everything listed. Cancellation and change terms are in our <Link className="textlink" href="/terms">booking terms</Link>.</p>
          </div>

          <ProposalActions
            id={p.id}
            status={expired ? "expired" : p.status}
            depositPaid={depositPaid}
            remaining={remaining}
            depositPence={p.deposit_pence}
            termsVersion={site.termsVersion}
          />
        </article>

        {(p.payments ?? []).some((x) => x.status === "paid") && (
          <section className="card stack">
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>Payments</h2>
            <table className="table">
              <tbody>
                {(p.payments ?? []).filter((x) => x.status === "paid").map((x) => (
                  <tr key={x.id}><td>{x.kind === "deposit" ? "Deposit" : "Balance"}</td><td>{ukDate(x.paid_at)}</td><td>{paymentStatus[x.status]}</td><td className="num">{gbp(x.amount_pence, { pence: true })}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AppShell>
  );
}
