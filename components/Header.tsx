import Link from "next/link";

export default function Header({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? "hdr" : "hdr solid"}>
      <div className="wrap hdr-in">
        <Link href="/" className="wordmark" aria-label="Occasions Perfected, home">
          Occasions <span>Perfected</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#celebrations">Celebrations</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/occasions">Where we work</Link>
          <Link href="/questions">Questions</Link>
        </nav>
        <div className="hdr-cta">
          <Link href="/portal" className="signin">Sign in</Link>
          <Link href="/plan" className="btn btn-gold btn-small">Plan my celebration</Link>
        </div>
      </div>
    </header>
  );
}
