import type { MetadataRoute } from "next";
import { site, occasions, towns } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const pages = ["", "/how-it-works", "/questions", "/occasions", "/plan",
    "/celebrations/garden-40th", "/celebrations/candlelit-bride-night", "/celebrations/manor-celebration"];
  return [
    ...pages.map((p) => ({ url: base + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...occasions.map((o) => ({ url: `${base}/occasions/${o.slug}`, priority: 0.6 })),
    ...occasions.flatMap((o) => towns.map((t) => ({ url: `${base}/occasions/${o.slug}/${t.slug}`, priority: 0.5 }))),
  ];
}
