import type { Metadata } from "next";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";
import { steps } from "@/lib/content";

export const metadata: Metadata = { title: "How it works", description: "From first call to the last guest home: how Occasions Perfected plans and runs your celebration." };

const detail = [
  ["Your enquiry", "Three quick questions: what you're celebrating, when and roughly for how many, and how to reach you. It takes about a minute."],
  ["Your concierge call", "Book a time that suits you straight after your enquiry. We talk through the feeling you want, your guests, your space and your budget."],
  ["Your proposal", "Within 48 hours you get one proposal in your private portal: what's included and one total price. It's held for 7 days."],
  ["Securing your date", "Accept online and pay a 50% deposit by card. The balance is due 14 days before your celebration."],
  ["Final details", "We check in 14 days before. Final numbers and details lock 10 days before, so everyone involved can prepare properly."],
  ["The day itself", "Your host arrives first, checks every detail and runs the event, then makes sure everything is cleared away."],
];

export default function HowItWorks() {
  return (
    <Page>
      <div className="wrap page-head">
        <h1>From first call to the last guest home</h1>
        <p className="lede">{steps.map((s) => s.word).join(", ")}. Here is what happens at each stage.</p>
      </div>
      <section className="wrap" style={{ paddingBottom: "clamp(64px,10vw,120px)" }}>
        <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0, borderColor: "var(--line)" }}>
          {detail.map(([t, b], i) => (
            <li key={t} className="step" style={{ borderColor: "var(--line)", alignItems: "start" }}>
              <div><span className="step-n" style={{ color: "var(--slate)" }}>{i + 1}</span><h2 style={{ fontSize: "var(--step-2)" }}>{t}</h2></div>
              <p className="muted">{b}</p>
            </li>
          ))}
        </ol>
      </section>
      <CtaBand />
    </Page>
  );
}
