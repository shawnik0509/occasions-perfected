"use client";
import { useState } from "react";
import Link from "next/link";
import { priceGuide, guidePrice, occasions } from "@/lib/content";

const gbp = (n: number) => "£" + n.toLocaleString("en-GB");

export default function PriceGuide({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const occ = occasions.filter((o) => (priceGuide.occasions as readonly string[]).includes(o.slug));
  const [occasion, setOccasion] = useState<string>(occ[0].slug);
  const [style, setStyle] = useState<string>("signature");
  const [guests, setGuests] = useState<number>(priceGuide.defaultGuests);

  const s = priceGuide.styles.find((x) => x.key === style)!;
  const price = guidePrice(style, guests);
  const occLabel = occ.find((o) => o.slug === occasion)?.label ?? "";
  const fill = ((guests - priceGuide.minGuests) / (priceGuide.maxGuests - priceGuide.minGuests)) * 100;
  const href = `/plan?${new URLSearchParams({ occasion, guests: String(guests), style, est: String(price) })}`;
  const H = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="pg">
      <header className="pg-head">
        <H className="pg-title">What would your celebration cost?</H>
        <p className="lede">Choose an occasion, a style and roughly how many guests. You&rsquo;ll see a starting price straight away.</p>
      </header>

      <div className="pg-controls">
        <div>
          <span className="label" id="pg-occ">Occasion</span>
          <div className="occ-row" role="group" aria-labelledby="pg-occ">
            {occ.map((o) => (
              <button key={o.slug} type="button" className="occ" aria-pressed={occasion === o.slug} onClick={() => setOccasion(o.slug)}>{o.label}</button>
            ))}
          </div>
        </div>

        <div>
          <span className="label" id="pg-style">Style</span>
          <div className="pg-styles" role="group" aria-labelledby="pg-style">
            {priceGuide.styles.map((x) => (
              <button key={x.key} type="button" className="choice pg-style" aria-pressed={style === x.key} onClick={() => setStyle(x.key)}>
                <b>{x.name}</b><span>{x.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="spread">
            <label className="label" htmlFor="pg-guests" style={{ margin: 0 }}>Guests</label>
            <span className="pg-guests" aria-hidden="true">{guests}</span>
          </div>
          <input id="pg-guests" className="pg-range" type="range" min={priceGuide.minGuests} max={priceGuide.maxGuests} step={priceGuide.step}
            value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={{ ["--fill" as string]: `${fill}%` }} />
          <div className="pg-ticks" aria-hidden="true"><span>10</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        </div>
      </div>

      <div className="pg-result" aria-live="polite">
        <p className="muted">{occLabel}, {s.name.toLowerCase()} style, {guests} guests</p>
        <p className="pg-price"><small>from about</small>{gbp(price)}</p>
        <p className="pg-per">Roughly {gbp(Math.round(price / guests))} per guest</p>
        <ul className="ticks pg-includes">{s.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        <div className="row" style={{ marginTop: 8 }}>
          <Link href={href} className="btn btn-gold">Get my exact price</Link>
          <span className="small muted">One total price. A 50% deposit secures your date.</span>
        </div>
      </div>
    </div>
  );
}
