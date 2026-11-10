"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { occasions, budgets, gbp, findOccasion, whatsappLink, budgetIndexFor } from "@/lib/content";

type Props = { initialOccasion: string; packageSlug: string; initialTown: string; initialGuests?: string; guideStyle?: string; guideEstimate?: number | null };

export default function EnquiryFlow({ initialOccasion, packageSlug, initialTown, initialGuests = "", guideStyle = "", guideEstimate = null }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialOccasion ? 2 : 1);
  const [occasion, setOccasion] = useState(initialOccasion);
  const [date, setDate] = useState("");
  const [flexible, setFlexible] = useState(false);
  const [guests, setGuests] = useState(initialGuests);
  const [budgetIdx, setBudgetIdx] = useState<number | null>(guideEstimate ? budgetIndexFor(guideEstimate) : null);
  const [town, setTown] = useState(initialTown);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOk, setWhatsappOk] = useState(true);
  const [notes, setNotes] = useState("");
  const guideNote = guideStyle && guideEstimate ? `From the price guide: ${guideStyle} style, about ${gbp(guideEstimate * 100)}.` : "";
  const [optIn, setOptIn] = useState(false); // UK GDPR: starts unticked
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const occ = findOccasion(occasion);
  const budgetPence = budgetIdx === null ? null : budgets[budgetIdx].pence;
  const lowBudget = occ && budgetPence !== null && budgetPence < occ.minPence;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const step2Ok = (date || flexible) && budgetIdx !== null;
  const step3Ok = name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!step3Ok || busy) return;
    setBusy(true); setError("");
    const { data, error } = await supabaseBrowser().rpc("submit_enquiry", {
      p_occasion: occ?.label ?? occasion, p_package_slug: packageSlug || occ?.packageSlug || null,
      p_event_date: date || null, p_date_flexible: flexible, p_guests: guests ? Number(guests) : null,
      p_budget_pence: budgetPence, p_town: town || null, p_name: name, p_email: email,
      p_phone: phone || null, p_whatsapp_ok: whatsappOk, p_notes: [guideNote, notes].filter(Boolean).join("\n\n") || null,
      p_marketing_opt_in: optIn, p_source: typeof document !== "undefined" ? (document.referrer ? "referral" : "direct") : null,
    });
    if (error) {
      setBusy(false);
      setError(error.message.includes("Too many") ? error.message : "That didn’t send. Check your details and try again, or WhatsApp us.");
      return;
    }
    const q = new URLSearchParams({ e: String(data), name: name.trim(), occasion: occ?.label ?? "" });
    router.push(`/plan/thanks?${q}`);
  }

  return (
    <div className="flow">
      <div className="flow-progress" aria-hidden="true">{[1, 2, 3].map((n) => <i key={n} className={n <= step ? "on" : ""} />)}</div>
      <p className="small muted" style={{ marginBottom: 10 }}>Step {step} of 3</p>

      {step === 1 && (
        <div className="flow-step">
          <h1>What are you celebrating?</h1>
          <div className="choice-grid" role="group" aria-label="Occasion">
            {occasions.map((o) => (
              <button key={o.slug} type="button" className="choice" aria-pressed={occasion === o.slug}
                onClick={() => { setOccasion(o.slug); setStep(2); }}>{o.label}</button>
            ))}
            <button type="button" className="choice" aria-pressed={occasion === "something-else"}
              onClick={() => { setOccasion("something-else"); setStep(2); }}>Something else</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flow-step">
          <h1>When, and roughly how big?</h1>
          {guideNote && <p className="notice">{guideNote} Your concierge will turn this into an exact price.</p>}
          <div className="grid-2">
            <label className="field"><span>Date</span>
              <input className="input" type="date" min={today} value={date} disabled={flexible} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="field"><span>Guests (roughly)</span>
              <input className="input" type="number" inputMode="numeric" min={1} max={2000} placeholder="e.g. 30" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </label>
          </div>
          <label className="check"><input type="checkbox" checked={flexible} onChange={(e) => { setFlexible(e.target.checked); if (e.target.checked) setDate(""); }} /> My date isn&rsquo;t fixed yet</label>
          <label className="field"><span>Town or postcode area</span>
            <input className="input" type="text" autoComplete="address-level2" placeholder="e.g. Wokingham" value={town} onChange={(e) => setTown(e.target.value)} />
          </label>
          <div className="field">
            <span id="budget-l">Budget</span>
            <div className="choice-grid" role="group" aria-labelledby="budget-l">
              {budgets.map((b, i) => (
                <button key={b.label} type="button" className="choice" aria-pressed={budgetIdx === i} onClick={() => setBudgetIdx(i)}>{b.label}</button>
              ))}
            </div>
          </div>
          {lowBudget && occ && (
            <div className="compare" aria-live="polite">
              <div><b>What your budget gets you</b>We&rsquo;ll put it towards the moments that matter most, and show you exactly what&rsquo;s possible on your call.</div>
              <div className="full"><b>The full experience</b>A fully planned and hosted {occ.label.toLowerCase()} starts from {gbp(occ.minPence)}.</div>
            </div>
          )}
          <div className="flow-nav">
            <button type="button" className="btn btn-line btn-small" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-ink" disabled={!step2Ok} onClick={() => setStep(3)}>Continue</button>
          </div>
          {!step2Ok && <p className="hint">Choose a date (or tick that it isn&rsquo;t fixed) and a budget to continue.</p>}
        </div>
      )}

      {step === 3 && (
        <form className="flow-step" onSubmit={submit} noValidate>
          <h1>Where should we send your plan?</h1>
          <label className="field"><span>Your name</span>
            <input className="input" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="grid-2">
            <label className="field"><span>Email</span>
              <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field"><span>Mobile <span className="muted">(optional)</span></span>
              <input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>
          {phone && <label className="check"><input type="checkbox" checked={whatsappOk} onChange={(e) => setWhatsappOk(e.target.checked)} /> You can message me on WhatsApp</label>}
          <label className="field"><span>Anything we should know? <span className="muted">(optional)</span></span>
            <textarea className="textarea" placeholder="The person, the feeling you want, ideas you've seen…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label className="check"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} /> Send me occasional ideas and offers. You can stop at any time.</label>
          {error && <p className="error-text" role="alert">{error} {whatsappLink("Hi, my enquiry form didn't send.") && <a className="textlink" href={whatsappLink("Hi, my enquiry form didn't send.")}>WhatsApp us</a>}</p>}
          <div className="flow-nav">
            <button type="button" className="btn btn-line btn-small" onClick={() => setStep(2)}>Back</button>
            <button type="submit" className="btn btn-gold" disabled={!step3Ok || busy}>{busy ? "Sending…" : "Send my enquiry"}</button>
          </div>
          <p className="hint">We use your details only to plan your celebration. <a className="textlink" href="/privacy">Privacy</a></p>
        </form>
      )}
    </div>
  );
}
