import Link from "next/link";
import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { occasions, towns } from "@/lib/content";

export const metadata: Metadata = { title: "Where we work", description: "Concierge-planned celebrations in Reading, Wokingham, Henley, Maidenhead, Windsor, Bracknell, Newbury and Marlow." };

export default function Occasions() {
  return (
    <Page>
      <div className="wrap page-head">
        <h1>Celebrations across Berkshire</h1>
        <p className="lede">We&rsquo;re based in Reading and plan celebrations across Berkshire and anywhere within about an hour and a half, including parts of London.</p>
      </div>
      <div className="wrap stack-lg" style={{ paddingBottom: 96 }}>
        {occasions.map((o) => (
          <section key={o.slug} className="stack" style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
            <h2 style={{ fontSize: "var(--step-2)" }}><Link href={`/occasions/${o.slug}`} style={{ textDecoration: "none" }}>{o.label}</Link></h2>
            <p className="muted" style={{ maxWidth: "40rem" }}>{o.blurb}</p>
            <div className="towns">{towns.map((t) => <Link key={t.slug} href={`/occasions/${o.slug}/${t.slug}`}>{t.name}</Link>)}</div>
          </section>
        ))}
      </div>
      <CtaBand />
    </Page>
  );
}
