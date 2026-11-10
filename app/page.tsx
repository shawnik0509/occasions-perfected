import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPackages } from "@/lib/packages";
import PriceGuide from "@/components/PriceGuide";
import { occasions, towns, steps, faqs, photos, packagePhoto, gbp, whatsappLink } from "@/lib/content";

export const revalidate = 300;

export default async function Home() {
  const packages = await getPackages();
  const wa = whatsappLink("Hi, I'd like to plan a celebration.");

  return (
    <>
      <Header overlay />
      <main id="main">
        <section className="hero">
          <div className="hero-img">
            <Image src={photos.candlelit.src} alt={photos.candlelit.alt} fill priority sizes="100vw" />
          </div>
          <div className="wrap hero-in">
            <div className="hero-meta">
              <div>
                <h1><span className="line">One concierge.</span> <span className="line">One plan.</span> <span className="line">One price.</span></h1>
                <p className="hero-sub">
                  Birthdays, anniversaries, hen nights and garden parties across Reading and Berkshire,
                  planned and run for you from the first call to the last guest home.
                </p>
                <div className="hero-actions">
                  <Link href="/plan" className="btn btn-gold">Plan my celebration</Link>
                  {wa && <a href={wa} className="btn btn-line" rel="noopener">WhatsApp us</a>}
                </div>
              </div>
              <p className="hero-caption">{photos.candlelit.caption}, Berkshire</p>
            </div>
          </div>
        </section>

        <section className="section-tight" aria-labelledby="occ-h">
          <div className="wrap">
            <h2 id="occ-h" style={{ fontSize: "var(--step-2)", marginBottom: 18 }}>What are you celebrating?</h2>
            <div className="occ-row">
              {occasions.map((o) => (
                <Link key={o.slug} href={`/plan?occasion=${o.slug}`} className="occ">{o.label}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section pearl" id="celebrations" aria-labelledby="pk-h">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2 id="pk-h">Signature celebrations</h2>
                <p className="lede">Starting points, not set menus. Every plan is shaped around you on your concierge call.</p>
              </div>
              <Link href="/plan" className="textlink">Start with your own idea</Link>
            </div>
            <div className="pk-grid">
              {packages.map((p) => {
                const ph = packagePhoto[p.slug] ? photos[packagePhoto[p.slug]!] : null;
                return (
                  <Link key={p.slug} href={`/celebrations/${p.slug}`} className="pk">
                    {ph ? (
                      <div className="pk-media">
                        <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 960px) 100vw, 33vw" />
                      </div>
                    ) : (
                      <div className="pk-media type"><p>{p.tagline}</p></div>
                    )}
                    <div className="pk-body">
                      <span className="pk-occ">{p.occasion}</span>
                      <h3>{p.name}</h3>
                      <span className="pk-price">From {gbp(p.from_price_pence)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" id="prices">
          <div className="wrap"><PriceGuide /></div>
        </section>

        <section className="section on-ink" aria-labelledby="how-h">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2 id="how-h">How it works</h2>
                <p className="lede">Three stages, one person looking after you throughout.</p>
              </div>
              <Link href="/how-it-works" className="textlink">The detail</Link>
            </div>
            <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((s, i) => (
                <li className="step" key={s.word}>
                  <div className="step-word" aria-hidden="true">{s.word}</div>
                  <div>
                    <span className="step-n">Step {i + 1} of 3</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" aria-labelledby="pr-h">
          <div className="wrap split">
            <div>
              <h2 id="pr-h" style={{ fontSize: "var(--step-3)" }}>Somewhere between doing it yourself and hiring a planner</h2>
              <p className="lede">The care of a full-service planner, priced for the celebrations people actually have.</p>
            </div>
            <div className="promise">
              <div><h3>One person, start to finish</h3><p>Your concierge plans it, books it and is reachable when you need them.</p></div>
              <div><h3>One total price</h3><p>Everything we arrange is in one figure. No planning fee on top and nothing to reconcile.</p></div>
              <div><h3>Trusted, vetted suppliers</h3><p>Every supplier is insured, referenced and seen at work before they join us, with a backup ready for each one.</p></div>
              <div><h3>A host on the night</h3><p>Someone from our team runs the day itself, so you get to be a guest.</p></div>
            </div>
          </div>
        </section>

        <section className="section-tight" aria-labelledby="gal-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="gal-h" style={{ fontSize: "var(--step-3)" }}>Real gardens, real nights</h2>
            </div>
            <div className="gallery">
              {[photos.cinema, photos.tent, photos.hottub, photos.domes, photos.candlelit].slice(0, 4).map((p) => (
                <figure key={p.src}>
                  <Image src={p.src} alt={p.alt} fill sizes="(max-width: 760px) 50vw, 33vw" />
                  <figcaption>{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="faq-h">
          <div className="wrap split">
            <div>
              <h2 id="faq-h" style={{ fontSize: "var(--step-3)" }}>Questions people ask first</h2>
              <p className="lede">Anything else, ask your concierge. <Link className="textlink" href="/questions">All questions</Link></p>
            </div>
            <div className="faq">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight pearl" aria-labelledby="area-h">
          <div className="wrap">
            <h2 id="area-h" style={{ fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 14 }}>Celebrations across Berkshire and beyond</h2>
            <div className="towns">
              {towns.map((t) => <Link key={t.slug} href={`/occasions/milestone-birthdays/${t.slug}`}>{t.name}</Link>)}
              <Link href="/occasions">and nearby</Link>
            </div>
          </div>
        </section>

        <section className="section on-ink">
          <div className="wrap cta-band">
            <h2>Tell us what you&rsquo;re picturing.</h2>
            <div className="row">
              <Link href="/plan" className="btn btn-gold">Plan my celebration</Link>
              {wa && <a href={wa} className="btn btn-line" rel="noopener">WhatsApp us</a>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
