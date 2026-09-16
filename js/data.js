/* ============================================================
   KAUFMAN WASH — default site content (fallback only)
   The live site fetches /api/content and renders that. This object
   is only used if that request fails (e.g. Functions aren't running,
   such as opening the HTML files directly without `npm run dev`) or
   before anything has ever been saved from /admin. Once you save
   from /admin, KV — not this file — is the source of truth.
   ============================================================ */
const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "Kaufman Wash · Mobile Detail Co.",
    heading: "Your car, detailed right — wherever you parked it.",
    highlight: "detailed",
    lede: "We come to you. One full detail, priced by vehicle size, with protectant and extras you can add on. Pick a time and we'll show up ready to work.",
    stats: [
      { value: "We drive to you", label: "Mobile service" },
      { value: "< 2 min", label: "Online booking" },
      { value: "Cash or card", label: "Pay your way" }
    ],
    ticketTitle: "Full Detail",
    ticketNumber: "TICKET #KW-00214",
    ticketStamp: "We come to you",
    ticketPriceLabel: "Starting at",
    ticketPrice: "$100"
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "One full detail. Priced by size.",
    body: "Every appointment is the same complete detail — exterior wash, brake dust removal, carpet & floor deep clean, upholstery cleaning, and accessory detailing. Price just depends on how big the vehicle is."
  },
  detailIncludes: [
    "Exterior hand wash",
    "Brake dust removal (all wheels)",
    "Carpet & floor deep cleaning",
    "Upholstery cleaning",
    "Accessory detailing (vents, cupholders, trim)",
    "Full interior vacuum & wipe-down",
    "Windows cleaned inside & out"
  ],
  vehicleSizes: [
    { id: "small", name: "Small Car", examples: "Sedan, coupe — e.g. Accord, Civic, Corolla", price: 100, duration: 120 },
    { id: "medium", name: "Medium", examples: "SUV, wagon", price: 125, duration: 150 },
    { id: "large", name: "Large", examples: "Van, truck", price: 150, duration: 180 }
  ],
  addonsSection: {
    eyebrow: "Add-ons",
    heading: "Finish the job.",
    body: "Layer on extra protection or tackle a specific problem. Add these to any appointment during booking."
  },
  addons: [
    { id: "sealant", name: "Paint Protectant / Sealant", desc: "3-month protective sealant layer", price: 45 },
    { id: "pethair", name: "Pet Hair Removal", desc: "Deep extraction from seats & carpet", price: 35 },
    { id: "headlight", name: "Headlight Restoration", desc: "Cloudy to clear, both sides", price: 60 },
    { id: "engine", name: "Engine Bay Detail", desc: "Degrease & dress the engine bay", price: 40 },
    { id: "odor", name: "Odor Elimination", desc: "Ozone treatment, smoke & pet odors", price: 35 },
    { id: "leather", name: "Leather Conditioning", desc: "Clean, condition & protect leather", price: 30 }
  ],
  photoBand: {
    eyebrow: "Our work",
    heading: "Every detail, done right.",
    body: "From floor mats to headliners — we don't rush the parts that get skipped."
  },
  gallery: {
    eyebrow: "Gallery",
    heading: "Recent work.",
    body: "A few finished jobs — more added after every appointment.",
    captions: [
      "Rear seats & floor mats",
      "Upholstery cleaning",
      "Front interior",
      "Cargo area"
    ]
  },
  why: {
    eyebrow: "Why Kaufman Wash",
    heading: "Detailing done the way it should be.",
    items: [
      "We come to you — home, office, wherever",
      "Real time slots, no back-and-forth",
      "Pay online or with cash at your appointment",
      "Full interior deep clean on every detail"
    ]
  },
  cta: {
    heading: "Ready to book your slot?",
    body: "Pick your vehicle size, choose an open time, and you're on the schedule — we'll come to you."
  },
  footer: {
    tagline: "Mobile auto detailing — we come to you, booked online.",
    serviceArea: ["Serving the Twin Cities metro area", "We come to your home or office"],
    email: "info@kaufmanwash.com",
    hours: ["Mon–Fri: 8:00 AM – 5:00 PM", "Sat: 8:00 AM – 3:00 PM", "Sun: Closed"]
  },
  booking: {
    eyebrow: "Book an appointment",
    heading: "Pick a time — we'll come to you.",
    body: "Choose your vehicle size and an open slot below. Pay online or reserve now and pay cash when the work's done — booking and payment are handled securely by Square."
  }
};
