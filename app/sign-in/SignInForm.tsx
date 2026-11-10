"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignInForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: redirect } });
    if (error) {
      setState("error");
      setMsg(error.status === 429 ? "Too many sign-in emails were requested. Wait a few minutes and try again." : "The link couldn’t be sent. Check your email address and try again.");
    } else setState("sent");
  }

  if (state === "sent") return (
    <div className="notice ok" role="status">Check your inbox for an email from us and tap the link to sign in. It can take a minute to arrive; check your spam folder too.</div>
  );
  return (
    <form onSubmit={send} className="stack">
      <label className="field"><span>Email</span>
        <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {state === "error" && <p className="error-text" role="alert">{msg}</p>}
      <div><button className="btn btn-ink" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button></div>
    </form>
  );
}
