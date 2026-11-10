"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { gbp } from "@/lib/content";

type Props = { id: string; status: string; depositPaid: boolean; remaining: number; depositPence: number; termsVersion: string };

export default function ProposalActions({ id, status, depositPaid, remaining, depositPence, termsVersion }: Props) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function accept() {
    setBusy("accept"); setError("");
    const { error } = await supabaseBrowser().rpc("accept_proposal", { p_id: id, p_terms_version: termsVersion });
    setBusy("");
    if (error) setError(error.message);
    else router.refresh();
  }

  async function pay(kind: "deposit" | "balance") {
    setBusy(kind); setError("");
    const { data, error } = await supabaseBrowser().functions.invoke("create-checkout", { body: { proposal_id: id, kind } });
    if (error || !data?.url) {
      let msg = "The payment page couldn’t be opened. Try again, or contact your concierge.";
      try { const body = await (error as { context?: Response })?.context?.json(); if (body?.error) msg = body.error; } catch { /* keep default */ }
      setError(msg); setBusy(""); return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="stack no-print" style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
      {status === "sent" && (
        <>
          <label className="check">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I&rsquo;ve read and agree to the <a className="textlink" href="/terms" target="_blank">booking terms</a>, including the cancellation charges.</span>
          </label>
          <div className="row">
            <button className="btn btn-gold" disabled={!agree || !!busy} onClick={accept}>{busy === "accept" ? "Accepting…" : "Accept proposal"}</button>
            <button className="btn btn-line btn-small" onClick={() => window.print()}>Download as PDF</button>
          </div>
        </>
      )}
      {status === "expired" && <p className="notice">This proposal has expired. Contact your concierge and they&rsquo;ll reissue it.</p>}
      {status === "accepted" && !depositPaid && (
        <div className="row">
          <button className="btn btn-gold" disabled={!!busy} onClick={() => pay("deposit")}>{busy === "deposit" ? "Opening payment…" : `Pay ${gbp(depositPence, { pence: true })} deposit`}</button>
          <button className="btn btn-line btn-small" onClick={() => window.print()}>Download as PDF</button>
        </div>
      )}
      {status === "accepted" && depositPaid && remaining > 0 && (
        <div className="row">
          <p className="small" style={{ flexBasis: "100%" }}>Your date is secured. Thank you.</p>
          <button className="btn btn-ink" disabled={!!busy} onClick={() => pay("balance")}>{busy === "balance" ? "Opening payment…" : `Pay ${gbp(remaining, { pence: true })} balance`}</button>
          <button className="btn btn-line btn-small" onClick={() => window.print()}>Download as PDF</button>
        </div>
      )}
      {status === "accepted" && depositPaid && remaining <= 0 && <p className="notice ok">Paid in full. We can&rsquo;t wait.</p>}
      {(status === "declined" || status === "cancelled") && <p className="muted small">This proposal is no longer active.</p>}
      {error && <p className="error-text" role="alert">{error}</p>}
      <p className="small muted">Payments are taken securely by Stripe. We never see your card details.</p>
    </div>
  );
}
