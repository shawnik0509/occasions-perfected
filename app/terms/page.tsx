import type { Metadata } from "next";
import Page from "@/components/Page";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Booking terms", robots: { index: false } };

// DRAFT – written from the business rules agreed so far. Must be reviewed by a solicitor before taking real payments.
export default function Terms() {
  return (
    <Page>
      <div className="wrap page-head"><h1>Booking terms</h1></div>
      <div className="wrap" style={{ paddingBottom: 96 }}>
        <div className="prose">
          <p className="notice">These terms are a draft and are being reviewed. Version: {site.termsVersion}.</p>
          <h2>Your proposal</h2>
          <p>Your proposal sets out what we will arrange and one total price. It is held for 7 days from when we send it.</p>
          <h2>Payments</h2>
          <p>A deposit of 50% of the total secures your date. The balance is due 14 days before your celebration.</p>
          <h2>Changes</h2>
          <ul>
            <li>You can move your date once, free of charge, if you tell us more than 60 days before it.</li>
            <li>Guest numbers can change freely until 10 days before your celebration. After that, numbers can go up but not down.</li>
            <li>Final details are locked 10 days before your celebration.</li>
          </ul>
          <h2>If you cancel</h2>
          <ul>
            <li>More than 60 days before: you lose your deposit only.</li>
            <li>Between 60 and 14 days before: 50% of the total is payable.</li>
            <li>Less than 14 days before: the full total is payable.</li>
          </ul>
          <h2>Venues</h2>
          <p>If you use a venue, you book and pay the venue directly. We confirm the venue before any other part of your celebration.</p>
          <h2>Photographs</h2>
          <p>We only use photographs of your celebration with your permission, and never photographs in which children can be identified.</p>
        </div>
      </div>
    </Page>
  );
}
