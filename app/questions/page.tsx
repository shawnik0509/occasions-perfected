import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { faqs } from "@/lib/content";

export const metadata: Metadata = { title: "Questions", description: "Prices, payments, venues, changes and cancellations – answers to common questions." };

export default function Questions() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <Page>
      <div className="wrap page-head"><h1>Questions</h1><p className="lede">If yours isn&rsquo;t here, your concierge will happily answer it on your call.</p></div>
      <div className="wrap narrow" style={{ paddingBottom: 96 }}>
        <div className="faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <CtaBand />
    </Page>
  );
}
