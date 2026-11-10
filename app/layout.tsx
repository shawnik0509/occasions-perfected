import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Occasions Perfected – celebrations in Reading and Berkshire", template: "%s | Occasions Perfected" },
  description: "Concierge-planned celebrations in Reading and Berkshire. One concierge, one plan, one price – birthdays, anniversaries, hen nights and garden parties.",
  openGraph: { type: "website", siteName: site.name, locale: "en_GB" },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#15161a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
