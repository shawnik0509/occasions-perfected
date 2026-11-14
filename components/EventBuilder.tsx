"use client";
import { useState } from "react";
import Link from "next/link";
import { occasions, eventServices, eventAreas, estimator } from "@/lib/content";

const gbp = (pounds: number) => "£" + Math.round(pounds).toLocaleString("en-GB");
const steps = ["Occasion", "Date and guests", "Services", "Review"] as const;

export default function EventBuilder() {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [area, setArea] = useState<string>("reading");
  const [guests, setGuests] = useState<number>(estimator.default);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const chosen = eventServices.filter((s) => picked[s.id]);
  const lines = chosen.map((s) => ({ name: s.name, amount: s.perGuest ? s.perGuest * guests : s.price, label: s.perGuest ? `${gbp(s.perGuest)} × ${guests}` : `from ${gbp(s.price)}` }));
  const total = lines.reduce((a, l) => a + l.amount, 0);
  const occLabel = occasions.find((o) => o.slug === occasion)?.label ?? "Not chosen";
  const dateLabel = date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not set";
  const warn = total > 0 && total < 1500 ? "Below our minimum booking value. Your concierge can show what your budget gets you." : "";

  const planHref = `/plan?${new URLSearchParams({
    ...(occasion ? { occasion } : {}),
    guests: String(guests),
    ...(total ? { est: String(Math.round(total)) } : {}),
  })}`;

  return (
    <div className="pg">
      <header className="pg-head">
        <h2 className="pg-title">Build your celebration, piece by piece</h2>
        <p className="lede">Pick the occasion, date and guests, then choose the services you want. The total updates as you go. Send it to your concierge when you are happy.</p>
      </header>

      <div className="eb-steps" role="tablist" aria-label="Event builder steps">
        {steps.map((label, i) => (
          <button key={label} type="button" className="choice eb-step" aria-pressed={step === i + 1}
            onClick={() => setStep(i + 1)} disabled={i > 0 && !occasion}>
            <span className="small muted">Step {i + 1}</span> <b>{label}</b>
          </button>
        ))}
      </div>

      <div className="eb-grid">
        <div className="eb-main">
          {step === 1 && (
            <div className="eb-pane">
              <span className="label">What are we celebrating?</span>
              <div className="occ-row" role="group" aria-label="Occasion">
                {occasions.map((o) => (
                  <button key={o.slug} type="button" className="occ" aria-pressed={occasion === o.slug} onClick={() => setOccasion(o.slug)}>{o.label}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="eb-pane">
              <div className="field">
                <label className="label" htmlFor="eb-date">Event date</label>
                <input id="eb-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <p className="small muted">You can move the date once, free, if it is more than 60 days away.</p>
              </div>
              <div className="field">
                <label className="label" htmlFor="eb-area">Area</label>
                <select id="eb-area" value={area} onChange={(e) => setArea(e.target.value)}>
                  {eventAreas.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
                {area === "wider" && <p className="small muted">Wider-area events may carry a travel fee.</p>}
              </div>
              <div className="field">
                <label className="label" htmlFor="eb-guests">Guests</label>
                <input id="eb-guests" type="number" min={estimator.min} max={300} value={guests}
                  onChange={(e) => setGuests(Math.max(estimator.min, Number(e.target.value) || estimator.min))} />
                <p className="small muted">You can change guest numbers freely until 10 days before.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="eb-pane">
              <p className="small muted">Prices are per event unless marked per guest. Each service has a backup supplier behind the scenes, so you only ever deal with us.</p>
              {eventServices.map((s) => (
                <label key={s.id} className="eb-svc">
                  <input type="checkbox" checked={!!picked[s.id]} onChange={(e) => setPicked({ ...picked, [s.id]: e.target.checked })} />
                  <span className="eb-svc-text"><b>{s.name}</b><span className="small muted">{s.desc}</span></span>
                  <span className="eb-svc-price">{s.perGuest ? `${gbp(s.perGuest)} per guest` : `from ${gbp(s.price)}`}</span>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="eb-pane">
              <p className="muted">Your concierge will confirm availability and turn this into a proposal within 48 hours. Nothing is booked or paid at this stage.</p>
              <div className="row" style={{ marginTop: 8 }}>
                <Link href={planHref} className="btn btn-gold">Send to my concierge</Link>
              </div>
              <p className="small muted" style={{ marginTop: 10 }}>You will be asked for your contact details on the next page.</p>
            </div>
          )}

          <div className="row eb-nav">
            <button type="button" className="btn btn-line" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</button>
            {step < 4 && <button type="button" className="btn btn-ink" onClick={() => setStep(Math.min(4, step + 1))}>Next</button>}
          </div>
        </div>

        <aside className="eb-summary" aria-live="polite">
          <h3>Your plan so far</h3>
          <div className="eb-line"><span>Occasion</span><span>{occLabel}</span></div>
          <div className="eb-line"><span>Date</span><span>{dateLabel}</span></div>
          <div className="eb-line"><span>Guests</span><span>{guests}</span></div>
          {lines.map((l) => (
            <div key={l.name} className="eb-line"><span>{l.name}</span><span>{gbp(l.amount)} <span className="small muted">{l.label}</span></span></div>
          ))}
          <div className="eb-total"><span>Estimate</span><span>{total ? `from ${gbp(Math.round(total))}` : "£0"}</span></div>
          <p className="small muted">{total ? `50% deposit to secure: ${gbp(Math.round(total / 2))}.` : "Choose services to see an estimate."}</p>
          {warn && <p className="small eb-warn">{warn}</p>}
        </aside>
      </div>
    </div>
  );
}
