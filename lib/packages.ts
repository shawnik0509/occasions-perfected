import { supabasePublic } from "@/lib/supabase/server";

export type Pkg = {
  slug: string; name: string; occasion: string; tagline: string | null; description: string | null;
  includes: string[]; from_price_pence: number;
};

// Used only if the database can't be reached, so the site never shows an empty page.
const fallback: Pkg[] = [
  { slug: "garden-40th", name: "The Garden 40th", occasion: "Milestone birthday", tagline: "Your garden, transformed for the night.", description: null, includes: [], from_price_pence: 250000 },
  { slug: "candlelit-bride-night", name: "Candlelit Bride Night", occasion: "Hen & bridal", tagline: "An intimate night for the bride and her closest friends.", description: null, includes: [], from_price_pence: 180000 },
  { slug: "manor-celebration", name: "The Manor Celebration", occasion: "Signature event", tagline: "A country-house celebration, handled end to end.", description: null, includes: [], from_price_pence: 800000 },
];

export async function getPackages(): Promise<Pkg[]> {
  try {
    const { data, error } = await supabasePublic()
      .from("packages").select("slug,name,occasion,tagline,description,includes,from_price_pence")
      .eq("active", true).order("sort");
    if (error || !data?.length) return fallback;
    return data as Pkg[];
  } catch { return fallback; }
}

export async function getPackage(slug: string) {
  const all = await getPackages();
  return all.find((p) => p.slug === slug) ?? null;
}
