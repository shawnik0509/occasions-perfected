import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { site, whatsappLink } from "@/lib/content";

export const metadata: Metadata = { title: "Enquiry received", robots: { index: false } };

export default async function Thanks({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const first = (sp.name ?? "").split(" ")[0];
  let booking = "";
  if (site.bookingUrl) {
    try {
      const u = new URL(site.bookingUrl);
      if (sp.name) u.searchParams.set("name", sp.name);
      if (sp.email) u.searchParams.set("email", sp.email);
      booking = u.toString();
    } catch { booking = site.bookingUrl; }
  }
  const wa = whatsappLink(`Hi, I've just sent an enquiry${sp.occasion ? ` for a ${sp.occasion.toLowerCase()}` : ""} (ref ${sp.ref ?? ""}).`);

  return (
    <>
      <Header />
      <main id="main" className="flow">
        <div className="flow-progress" aria-hidden="true"><i className="on" /><i className="on" /><i className="on" /></div>
        <div className="flow-step">
          <h1>Thank you{first ? `, ${first}` : ""}. Now let&rsquo;s talk.</h1>
          <p className="lede" style={{ marginTop: 0 }}>
            The next step is a short call with your concierge. Choose a time that suits you and we&rsquo;ll come prepared.
          </p>
          <div className="row">
            {booking
              ? <a href={booking} className="btn btn-gold" target="_blank" rel="noopener">Book my concierge call</a>
              : <p className="notice">We&rsquo;ll be in touch within 24 hours to arrange your call.</p>}
            {wa && <a href={wa} className="btn btn-line" rel="noopener">WhatsApp us instead</a>}
          </div>
          <div className="card stack" style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>What happens next</h2>
            <ol className="small muted" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              <li>Your call: about 20 minutes to talk through your celebration.</li>
              <li>Your proposal: within 48 hours, in your private portal, with one total price.</li>
              <li>Your date: secured with a 50% deposit when you&rsquo;re happy.</li>
            </ol>
            <p className="small muted">Your reference is {sp.ref ?? "–"}. Your portal uses the email you gave us, with no password needed. <Link className="textlink" href="/portal">Open my portal</Link></p>
          </div>
        </div>
      </main>
    </>
  );
}
