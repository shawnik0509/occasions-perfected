import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventBuilder from "@/components/EventBuilder";

export const metadata: Metadata = {
  title: "Event builder",
  description: "Build your celebration piece by piece: occasion, date, guests, your garden or space, and the services you want.",
};

export default function EventBuilderPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="section">
          <div className="wrap"><EventBuilder /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
