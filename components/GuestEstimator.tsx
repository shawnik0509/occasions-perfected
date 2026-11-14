"use client";
import { useState } from "react";
import Link from "next/link";
import { estimator, estimatorTiers, estimatorPrice } from "@/lib/content";

const gbp = (n: number) => "£" + n.toLocaleString("en-GB");

export default function GuestEstimator() {
  const [guests, setGuests] = useState<number>(estimator.default);
  const fill = ((guests - estimator.min) / (estimator.max - estimator.min)) * 100;

  return (
    <div className="pg pg-wide">
      <header className="pg-head">
        <h2 className="pg-title">Tell us how many guests. See what it could look like.</h2>
        <p className="lede">Drag to your guest count. Each package shows an indicative total and what it includes. Your concierge confirms the final plan and price.</p>
      </header>

      <div className="spread">
        <label className="label" htmlFor="est-guests" style={{ margin: 0 }}>Number of guests</label>
        <span className="pg-guests" aria-hidden="true">{guests} guests</span>
      </div>
      <input id="est-guests" className="pg-range" type="range" min={estimator.min} max={estimator.max} step={estimator.step}
        value={guests} onChange={(e) => setGuests(Number(e.target.value))} aria-label="Number of guests"
        style={{ ["--fill" as string]: `${fill}%` }} />
      <div className="pg-ticks" aria-hidden="true"><span>10</span><span>50</span><span>100</span><span>150+</span></div>

      <div className="est-tiers">
        {estimatorTiers.map((t) => {
          const price = estimatorPrice(t.base, t.perGuest, guests);
          return (
            <article key={t.key} className={`est-tier${t.featured ? " featured" : ""}`}>
              {t.featured && <span className="est-badge">Most booked</span>}
              <h3>{t.name}</h3>
              <p className="muted">{t.blurb}</p>
              <p className="est-price"><small>from</small>{gbp(price)}</p>
              <p className="small muted">for {guests} guests, indicative</p>
              <ul className="ticks est-list">
                {t.includes.map((i) => <li key={i}>{i}</li>)}
                {t.excludes.map((i) => <li key={i} className="est-no">Not included: {i.toLowerCase()}</li>)}
              </ul>
              <Link href={`/plan?${new URLSearchParams({ guests: String(guests), est: String(price), style: t.key })}`}
                className={t.featured ? "btn btn-gold" : "btn btn-line"}>Choose {t.name}</Link>
            </article>
          );
        })}
      </div>
      <p className="small muted">Indicative only. Final pricing is confirmed by your concierge, and a 50% deposit secures your date.</p>
    </div>
  );
}
