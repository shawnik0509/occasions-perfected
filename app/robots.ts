import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/portal", "/admin", "/auth", "/sign-in"] }], sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml` };
}
