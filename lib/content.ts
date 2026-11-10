// Everything a non-developer might want to change lives in this file.

export const site = {
  name: "Occasions Perfected",
  tagline: "Pictured · Planned · Perfected",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://occasions-perfected.vercel.app",
  area: "Reading and Berkshire",
  // Set these in Vercel → Settings → Environment Variables. Empty = hidden on the site.
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^\d]/g, ""), // e.g. 447700900123
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "", // e.g. a Cal.com or Calendly link
  termsVersion: "draft-2026-11-10",
};

export function whatsappLink(text: string) {
  if (!site.whatsapp) return "";
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const gbp = (pence: number | null | undefined, opts: { pence?: boolean } = {}) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: opts.pence ? 2 : 0,
    minimumFractionDigits: opts.pence ? 2 : 0,
  }).format((pence ?? 0) / 100);

export const ukDate = (d: string | Date | null | undefined, withDay = true) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        weekday: withDay ? "short" : undefined,
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/London",
      })
    : "Date to be confirmed";

// Occasions offered in the enquiry and on local pages.
// minPence = the "full experience, from £X" figure shown when a budget is low.
export const occasions = [
  { slug: "milestone-birthdays", label: "Milestone birthday", plural: "milestone birthdays", minPence: 250000, packageSlug: "garden-40th",
    blurb: "Thirtieths, fortieths, fiftieths and beyond, planned around the person rather than a template." },
  { slug: "hen-parties", label: "Hen or bridal night", plural: "hen and bridal nights", minPence: 180000, packageSlug: "candlelit-bride-night",
    blurb: "Intimate, candlelit and properly looked after, so the bride and her friends can simply enjoy it." },
  { slug: "anniversaries", label: "Anniversary", plural: "anniversaries", minPence: 180000, packageSlug: null,
    blurb: "From a dinner for two in the garden to a ruby celebration for the whole family." },
  { slug: "garden-parties", label: "Garden party", plural: "garden parties", minPence: 150000, packageSlug: "garden-40th",
    blurb: "Your own garden, styled and lit, with food, drinks and a host so you are a guest at your own party." },
  { slug: "sleepovers", label: "Sleepover", plural: "sleepovers", minPence: 100000, packageSlug: null,
    blurb: "Bell tents, cosy bedding and a film under the stars, all set up and cleared away for you." },
  { slug: "festive-parties", label: "Festive party", plural: "festive parties", minPence: 150000, packageSlug: null,
    blurb: "Christmas and New Year gatherings with warmth, light and nothing left for you to organise." },
  { slug: "manor-celebrations", label: "Manor house celebration", plural: "manor house celebrations", minPence: 800000, packageSlug: "manor-celebration",
    blurb: "The big ones: a country house found, secured and run end to end." },
] as const;

export type Occasion = (typeof occasions)[number];
export const findOccasion = (s: string) => occasions.find((o) => o.slug === s);

export const towns = [
  { slug: "reading", name: "Reading" },
  { slug: "wokingham", name: "Wokingham" },
  { slug: "henley-on-thames", name: "Henley-on-Thames" },
  { slug: "maidenhead", name: "Maidenhead" },
  { slug: "windsor", name: "Windsor" },
  { slug: "bracknell", name: "Bracknell" },
  { slug: "newbury", name: "Newbury" },
  { slug: "marlow", name: "Marlow" },
] as const;
export const findTown = (s: string) => towns.find((t) => t.slug === s);

export const budgets = [
  { label: "Under £1,000", pence: 75000 },
  { label: "£1,000 – £2,000", pence: 150000 },
  { label: "£2,000 – £4,000", pence: 300000 },
  { label: "£4,000 – £8,000", pence: 600000 },
  { label: "£8,000 +", pence: 1000000 },
  { label: "Not sure yet", pence: null },
] as const;

export const photos = {
  candlelit: { src: "/photos/candlelit-dome.avif", alt: "A garden dome lit with fairy lights and candles leading to it at night", caption: "Candlelit dome celebration" },
  cinema: { src: "/photos/cinema-dome.avif", alt: "Guests watching a film inside a lit garden dome at dusk", caption: "Cinema night under the stars" },
  tent: { src: "/photos/bell-tent.avif", alt: "A bell tent set up on a lawn with a pink rug and garden games", caption: "Golden-hour bell tent sleepover" },
  domes: { src: "/photos/garden-domes.avif", alt: "Two clear domes on a lawn, ready for guests", caption: "Garden domes, ready for guests" },
  hottub: { src: "/photos/hot-tub-dome.avif", alt: "A hot tub inside a clear dome in a garden", caption: "Hot tub under glass" },
};

export const packagePhoto: Record<string, keyof typeof photos | null> = {
  "garden-40th": "domes",
  "candlelit-bride-night": "candlelit",
  "manor-celebration": null,
};

export const steps = [
  { word: "Pictured", title: "Tell us what you're picturing",
    body: "Three quick questions, then a call with your concierge. We listen for the feeling you want, not just the headcount." },
  { word: "Planned", title: "Get one plan and one price",
    body: "Within 48 hours you receive a single proposal in your portal. Everything is included in one total, with nothing to chase." },
  { word: "Perfected", title: "Enjoy the day",
    body: "We book, brief and manage everyone involved. On the day your host runs it all, so you are a guest at your own celebration." },
];

export const faqs = [
  { q: "What does it cost?",
    a: "Celebrations start from around £1,000, and our signature packages start at £1,800. Every proposal is one total price for everything we arrange, with no separate planning fee." },
  { q: "How do payments work?",
    a: "A 50% deposit secures your date. The balance is due 14 days before your celebration. You can pay securely by card from your portal." },
  { q: "Can I use my own venue?",
    a: "Yes. Most of our celebrations happen in clients' own gardens. If you'd like a venue, we'll suggest two or three and can arrange a visit. You book and pay the venue directly." },
  { q: "Who will I deal with?",
    a: "One concierge, from your first call to the end of the night. You never have to coordinate suppliers yourself." },
  { q: "Can I change things after booking?",
    a: "You can move your date once, free of charge, if you tell us more than 60 days ahead. Guest numbers can change freely until 10 days before, when final details are locked. After that they can only go up." },
  { q: "What if I need to cancel?",
    a: "More than 60 days before, you lose your deposit only. Between 60 and 14 days, 50% of the total is payable. Within 14 days, the full amount is payable. The full terms are in your proposal." },
  { q: "Where do you cover?",
    a: "Reading and the rest of Berkshire, plus anywhere within about an hour and a half, including parts of London. Ask us if you're unsure." },
  { q: "What about the weather?",
    a: "Your concierge will talk you through the options for bad weather on your call, before you commit to anything." },
];

// ---------- Price guide ----------
// PLACEHOLDER figures – change these when real prices are set.
// Shown price = base + perGuest × guests, rounded to the nearest £50.
export const priceGuide = {
  minGuests: 10,
  maxGuests: 100,
  step: 5,
  defaultGuests: 30,
  occasions: ["milestone-birthdays", "hen-parties", "anniversaries", "garden-parties", "sleepovers", "festive-parties"],
  styles: [
    { key: "relaxed", name: "Relaxed", hint: "Laid-back and beautiful", base: 800, perGuest: 35,
      includes: ["Your own concierge", "Garden styling and festoon lighting", "Grazing food and soft drinks", "Set-up and clear-down"] },
    { key: "signature", name: "Signature", hint: "Our most popular", base: 1300, perGuest: 50,
      includes: ["Your own concierge", "Full styling, lighting and lounge areas", "Catering and a bar, planned around your guests", "A host on the night", "Set-up and clear-down", "One extra experience, like a dome or cinema"] },
    { key: "showstopper", name: "Showstopper", hint: "Nothing held back", base: 3000, perGuest: 95,
      includes: ["Your own concierge", "Bespoke design, florals and lighting", "Catering, bar and entertainment", "A hosting team on the night", "Venue search and a site visit", "A run sheet for the whole evening"] },
  ],
} as const;

export function guidePrice(styleKey: string, guests: number) {
  const s = priceGuide.styles.find((x) => x.key === styleKey) ?? priceGuide.styles[1];
  return Math.round((s.base + s.perGuest * guests) / 50) * 50; // pounds
}

// Which budget button matches a price in pounds (used to pre-fill the enquiry)
export function budgetIndexFor(pounds: number) {
  if (pounds < 1000) return 0;
  if (pounds < 2000) return 1;
  if (pounds < 4000) return 2;
  if (pounds < 8000) return 3;
  return 4;
}
