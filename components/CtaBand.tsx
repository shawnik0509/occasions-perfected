import Link from "next/link";
import { whatsappLink } from "@/lib/content";
export default function CtaBand({ title = "Tell us what you’re picturing.", href = "/plan" }: { title?: string; href?: string }) {
  const wa = whatsappLink("Hi, I'd like to plan a celebration.");
  return (
    <section className="section on-ink">
      <div className="wrap cta-band">
        <h2>{title}</h2>
        <div className="row">
          <Link href={href} className="btn btn-gold">Plan my celebration</Link>
          {wa && <a href={wa} className="btn btn-line" rel="noopener">WhatsApp us</a>}
        </div>
      </div>
    </section>
  );
}
