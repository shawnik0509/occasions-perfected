import type { Metadata } from "next";
import Header from "@/components/Header";
import EnquiryFlow from "./EnquiryFlow";
import { findOccasion, occasions, priceGuide } from "@/lib/content";

export const metadata: Metadata = { title: "Plan my celebration", description: "Three quick questions, then a call with your concierge." };

export default async function Plan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const occ = sp.occasion && findOccasion(sp.occasion) ? sp.occasion : occasions.find((o) => o.packageSlug === sp.package)?.slug;
  return (
    <>
      <Header />
      <main id="main">
        <EnquiryFlow initialOccasion={occ ?? ""} packageSlug={sp.package ?? ""} initialTown={sp.town ?? ""}
          initialGuests={sp.guests && /^\d{1,4}$/.test(sp.guests) ? sp.guests : ""}
          guideStyle={priceGuide.styles.find((s) => s.key === sp.style)?.name ?? ""}
          guideEstimate={sp.est && /^\d{1,6}$/.test(sp.est) ? Number(sp.est) : null} />
      </main>
    </>
  );
}
