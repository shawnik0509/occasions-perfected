import type { Metadata } from "next";
import Header from "@/components/Header";
import SignInForm from "./SignInForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignIn({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/portal";
  return (
    <>
      <Header />
      <main id="main" className="flow">
        <div className="flow-step">
          <h1>Sign in to your portal</h1>
          <p className="lede" style={{ marginTop: 0 }}>Use the email you enquired with. We&rsquo;ll send you a sign-in link, so there&rsquo;s no password to remember.</p>
          {sp.error && <p className="notice danger">That sign-in link has expired or was already used. Request a new one below.</p>}
          <SignInForm next={next} />
        </div>
      </main>
    </>
  );
}
