import Link from "next/link";

export default function AppShell({ children, isAdmin, active }: { children: React.ReactNode; isAdmin?: boolean; active?: "portal" | "admin" | "calendar" }) {
  return (
    <div className="app">
      <header className="hdr solid app-nav">
        <div className="wrap hdr-in">
          <Link href="/" className="wordmark">Occasions <span>Perfected</span></Link>
          <nav className="tabs" aria-label="Account">
            <Link href="/portal" aria-current={active === "portal" ? "page" : undefined}>My celebrations</Link>
            {isAdmin && <Link href="/admin" aria-current={active === "admin" ? "page" : undefined}>Admin</Link>}
            {isAdmin && <Link href="/admin/calendar" aria-current={active === "calendar" ? "page" : undefined}>Calendar</Link>}
          </nav>
          <form action="/auth/signout" method="post"><button className="btn btn-line btn-small">Sign out</button></form>
        </div>
      </header>
      <main id="main" className="app-main"><div className="wrap">{children}</div></main>
    </div>
  );
}
