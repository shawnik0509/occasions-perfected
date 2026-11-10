import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { occasions, towns, findOccasion, findTown, gbp, steps, faqs, photos } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return occasions.flatMap((o) => towns.map((t) => ({ occasion: o.slug, town: t.slug })));
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export async function generateMetadata({ params }: { params: Promise<{ occasion: string; town: string }> }): Promise<Metadata> {
  const p = await params; const o = findOccasion(p.occasion); const t = findTown(p.town);
  if (!o || !t) return {};
  return {
    title: `${cap(o.plural)} in ${t.name}`,
    description: `Concierge-planned ${o.plural} in ${t.name}. One concierge, one plan, one price – from ${gbp(o.minPence)}.`,
    alternates: { canonical: `/occasions/${o.slug}/${t.slug}` },
  };
}

const photoFor: Record<string, keyof typeof photos> = {
  "milestone-birthdays": "domes", "hen-parties": "candlelit", "anniversaries": "candlelit", "garden-parties": "domes",
  "sleepovers": "tent", "festive-parties": "cinema", "manor-celebrations": "candlelit",
};

export default async function LocalPage({ params }: { params: Promise<{ occasion: string; town: string }> }) {
  const p = await params; const o = findOccasion(p.occasion); const t = findTown(p.town);
  if (!o || !t) notFound();
  const ph = photos[photoFor[o.slug] ?? "candlelit"];
  const others = towns.filter((x) => x.slug !== t.slug);
  const ld = { "@context": "https://schema.org", "@type": "Service", serviceType: `${cap(o.plural)} planning`,
    areaServed: { "@type": "City", name: t.name }, provider: { "@type": "Organization", name: "Occasions Perfected" },
    offers: { "@type": "Offer", priceCurrency: "GBP", price: (o.minPence / 100).toFixed(0) } };

  return (
    <Page>
      <div className="wrap page-head">
        <p className="crumbs"><Link href="/occasions">Where we work</Link> / <Link href={`/occasions/${o.slug}`}>{o.label}</Link> / {t.name}</p>
        <div className="split">
          <div className="stack-lg">
            <div className="stack">
              <h1>{cap(o.plural)} in {t.name}</h1>
              <p className="lede" style={{ marginTop: 0 }}>{o.blurb}</p>
            </div>
            <p>
              Whether it&rsquo;s at home in {t.name} or at a venue nearby, you deal with one concierge who plans it,
              books everyone involved and gives you one total price. On the day, our host runs everything.
            </p>
            <p className="muted">Full celebrations from {gbp(o.minPence)}. Tell us your budget and we&rsquo;ll show you what it makes possible.</p>
            <div className="row">
              <Link href={`/plan?occasion=${o.slug}&town=${encodeURIComponent(t.name)}`} className="btn btn-ink">Plan my {o.label.toLowerCase()}</Link>
            </div>
          </div>
          <figure style={{ margin: 0 }}>
            <div className="detail-media" style={{ position: "relative" }}>
              <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 860px) 100vw, 58vw" />
            </div>
            <figcaption className="small muted" style={{ marginTop: 10 }}>{ph.caption}</figcaption>
          </figure>
        </div>
      </div>

      <section className="section-tight pearl">
        <div className="wrap promise three">
          {steps.map((s) => <div key={s.word}><h3>{s.word}</h3><p>{s.body}</p></div>)}
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <h2 style={{ fontSize: "var(--step-3)" }}>Good to know</h2>
          <div className="faq">{faqs.slice(0, 4).map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>{cap(o.plural)} nearby</h2>
          <div className="towns">{others.map((x) => <Link key={x.slug} href={`/occasions/${o.slug}/${x.slug}`}>{x.name}</Link>)}</div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <CtaBand href={`/plan?occasion=${o.slug}&town=${encodeURIComponent(t.name)}`} />
    </Page>
  );
}
