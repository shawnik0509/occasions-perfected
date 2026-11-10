import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { occasions, towns, findOccasion, gbp } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() { return occasions.map((o) => ({ occasion: o.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ occasion: string }> }): Promise<Metadata> {
  const o = findOccasion((await params).occasion);
  if (!o) return {};
  const t = o.plural[0].toUpperCase() + o.plural.slice(1);
  return { title: `${t} in Berkshire`, description: `${o.blurb} Planned and hosted across Reading and Berkshire.` };
}

export default async function OccasionPage({ params }: { params: Promise<{ occasion: string }> }) {
  const o = findOccasion((await params).occasion);
  if (!o) notFound();
  const title = o.plural[0].toUpperCase() + o.plural.slice(1);
  return (
    <Page>
      <div className="wrap page-head">
        <p className="crumbs"><Link href="/occasions">Where we work</Link> / {o.label}</p>
        <h1>{title} in Berkshire</h1>
        <p className="lede">{o.blurb}</p>
        <p className="muted" style={{ marginTop: 14 }}>Full celebrations from {gbp(o.minPence)}.</p>
        <div className="row" style={{ marginTop: 24 }}><Link href={`/plan?occasion=${o.slug}`} className="btn btn-ink">Plan my {o.label.toLowerCase()}</Link></div>
      </div>
      <div className="wrap" style={{ paddingBottom: 96 }}>
        <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>Choose your town</h2>
        <div className="towns">{towns.map((t) => <Link key={t.slug} href={`/occasions/${o.slug}/${t.slug}`}>{t.name}</Link>)}</div>
      </div>
      <CtaBand href={`/plan?occasion=${o.slug}`} />
    </Page>
  );
}
