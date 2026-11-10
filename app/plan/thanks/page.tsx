import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import CallBooker from "@/components/CallBooker";
import { whatsappLink } from "@/lib/content";

export const metadata: Metadata = { title: "Book your call", robots: { index: false } };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Thanks({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const first = (sp.name ?? "").split(" ")[0];
  const id = sp.e && UUID.test(sp.e) ? sp.e : "";
  const wa = whatsappLink(`Hi, I've just sent an enquiry${sp.occasion ? ` for a ${sp.occasion.toLowerCase()}` : ""}${id ? ` (ref ${id.slice(0, 8)})` : ""}.`);

  return (
    <>
      <Header />
      <main id="main" className="flow">
        <div className="flow-progress" aria-hidden="true"><i className="on" /><i className="on" /><i className="on" /></div>
        <div className="flow-step">
          <div className="stack">
            <h1>Thank you{first ? `, ${first}` : ""}. Now let&rsquo;s talk.</h1>
            <p className="lede" style={{ marginTop: 0 }}>
              Pick a time for a short call with your concierge. We&rsquo;ll talk through your celebration and come prepared with ideas.
            </p>
          </div>

          {id ? <CallBooker enquiryId={id} /> : <p className="notice">We&rsquo;ll be in touch within 24 hours to arrange your call.</p>}
          {wa && <p className="small muted">Prefer to message? <a className="textlink" href={wa} rel="noopener">WhatsApp us</a></p>}

          <div className="card stack">
            <h2 style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" }}>What happens next</h2>
            <ol className="small muted" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              <li>Your call: about 20 minutes to talk through your celebration.</li>
              <li>Your proposal: within 48 hours, in your private portal, with one total price.</li>
              <li>Your date: secured with a 50% deposit when you&rsquo;re happy.</li>
            </ol>
            <p className="small muted">{id && <>Your reference is {id.slice(0, 8)}. </>}Your portal uses the email you gave us, with no password needed. <Link className="textlink" href="/portal">Open my portal</Link></p>
          </div>
        </div>
      </main>
    </>
  );
}
