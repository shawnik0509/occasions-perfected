import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { getPackage, getPackages } from "@/lib/packages";
import { gbp, photos, packagePhoto, occasions } from "@/lib/content";

export const revalidate = 300;
export async function generateStaticParams() { return (await getPackages()).map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPackage((await params).slug);
  return p ? { title: p.name, description: `${p.tagline} From ${gbp(p.from_price_pence)}. Concierge-planned in Reading and Berkshire.` } : {};
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) notFound();
  const ph = packagePhoto[p.slug] ? photos[packagePhoto[p.slug]!] : null;
  const occ = occasions.find((o) => o.packageSlug === p.slug);
  const planHref = `/plan?package=${p.slug}${occ ? `&occasion=${occ.slug}` : ""}`;

  return (
    <Page>
      <div className="wrap page-head">
        <p className="crumbs"><Link href="/#celebrations">Celebrations</Link> / {p.name}</p>
        <div className="split">
          <div className="stack-lg">
            <div className="stack">
              <h1>{p.name}</h1>
              <p className="lede" style={{ marginTop: 0 }}>{p.tagline}</p>
            </div>
            {p.description && <p>{p.description}</p>}
            {p.includes?.length > 0 && (
              <div className="stack">
                <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>Usually included</h2>
                <ul className="ticks">{p.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
            <div className="stack">
              <p style={{ fontSize: "var(--step-2)", letterSpacing: "-0.02em" }}>From {gbp(p.from_price_pence)}</p>
              <p className="muted small">Your proposal is one total price, shaped around your guest numbers and wishes. A 50% deposit secures the date.</p>
              <div className="row"><Link href={planHref} className="btn btn-ink">Plan this celebration</Link></div>
            </div>
          </div>
          <div>
            {ph ? (
              <figure style={{ margin: 0 }}>
                <div className="detail-media" style={{ position: "relative" }}>
                  <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 860px) 100vw, 58vw" priority />
                </div>
                <figcaption className="small muted" style={{ marginTop: 10 }}>{ph.caption}</figcaption>
              </figure>
            ) : (
              <div className="detail-media pk-media type" style={{ aspectRatio: "4/3" }}><p>{p.tagline}</p></div>
            )}
          </div>
        </div>
      </div>
      <CtaBand href={planHref} />
    </Page>
  );
}
