import Link from "next/link";
import Page from "@/components/Page";
export default function NotFound() {
  return (
    <Page>
      <div className="wrap page-head" style={{ minHeight: "50vh" }}>
        <h1>This page isn&rsquo;t here</h1>
        <p className="lede">It may have moved. Try the homepage, or start planning your celebration.</p>
        <div className="row" style={{ marginTop: 24 }}>
          <Link href="/" className="btn btn-line">Go to the homepage</Link>
          <Link href="/plan" className="btn btn-ink">Plan my celebration</Link>
        </div>
      </div>
    </Page>
  );
}
