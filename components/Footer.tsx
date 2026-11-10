import Link from "next/link";
import { site, occasions, towns, whatsappLink } from "@/lib/content";

export default function Footer() {
  const wa = whatsappLink("Hi, I'd like to plan a celebration.");
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <h4>{site.name}</h4>
            <p style={{ maxWidth: "26rem" }}>Concierge-planned celebrations in {site.area}. One concierge, one plan, one price.</p>
            <p style={{ marginTop: 14 }}>
              {wa && <a href={wa} rel="noopener">WhatsApp us</a>}
              {wa && site.email && " or "}
              {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
            </p>
          </div>
          <div>
            <h4>Celebrations</h4>
            <ul>{occasions.slice(0, 6).map((o) => <li key={o.slug}><Link href={`/occasions/${o.slug}`}>{o.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Where we work</h4>
            <ul>{towns.slice(0, 6).map((t) => <li key={t.slug}><Link href={`/occasions/milestone-birthdays/${t.slug}`}>{t.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/price-guide">Price guide</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/questions">Questions</Link></li>
              <li><Link href="/portal">Client sign in</Link></li>
              <li><Link href="/terms">Booking terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="ftr-base">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
