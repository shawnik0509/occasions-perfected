import type { Metadata } from "next";
import Page from "@/components/Page";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy", robots: { index: false } };

// DRAFT – check with a solicitor (UK GDPR), especially for dietary and allergy information.
export default function Privacy() {
  return (
    <Page>
      <div className="wrap page-head"><h1>Privacy</h1></div>
      <div className="wrap" style={{ paddingBottom: 96 }}>
        <div className="prose">
          <p className="notice">This notice is a draft and is being reviewed.</p>
          <h2>What we collect</h2>
          <p>When you enquire we collect your name, email, phone number and the details of your celebration. If you book, we also keep your proposal and payment records. Card payments are handled by Stripe; we never see or store your card number.</p>
          <h2>Why</h2>
          <p>To plan and deliver your celebration, to contact you about it, and to meet our legal and accounting obligations.</p>
          <h2>Marketing</h2>
          <p>We only send you offers if you tick the box to say you&rsquo;d like them. You can stop at any time.</p>
          <h2>Who we share it with</h2>
          <p>Only the suppliers who need specific details to deliver your celebration (for example, guest numbers and dietary needs for a caterer), and the services that run this website: Supabase (data storage, UK region), Vercel (hosting) and Stripe (payments).</p>
          <h2>Your rights</h2>
          <p>You can ask to see, correct or delete your information{site.email ? <> by emailing <a href={`mailto:${site.email}`}>{site.email}</a></> : " by contacting your concierge"}.</p>
        </div>
      </div>
    </Page>
  );
}
