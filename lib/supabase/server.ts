import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SUPABASE_URL, SUPABASE_KEY } from "./env";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a server component */ }
      },
    },
  });
}

// Public pages that don't need a session (no cookies → can be static)
import { createClient } from "@supabase/supabase-js";
export const supabasePublic = () => createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

export async function requireUser(next = "/portal") {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return { sb, user };
}

export async function requireAdmin(next = "/admin") {
  const { sb, user } = await requireUser(next);
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/portal?notice=admin-only");
  return { sb, user };
}
