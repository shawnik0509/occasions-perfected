import type { Metadata } from "next";
import Page from "@/components/Page";
import PriceGuide from "@/components/PriceGuide";

export const metadata: Metadata = {
  title: "Price guide",
  description: "See a starting price for your celebration in Reading and Berkshire: choose an occasion, a style and your guest numbers.",
};

export default function PriceGuidePage() {
  return (
    <Page>
      <div className="wrap" style={{ paddingBlock: "clamp(48px, 8vw, 104px)" }}>
        <PriceGuide headingLevel={1} />
      </div>
    </Page>
  );
}
