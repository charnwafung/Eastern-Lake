/* ============================================================
   RESTAURANT CONFIG
   Edit everything in this file to make the site yours.
   No other file needs to change for basic setup.
   ============================================================ */

const RESTAURANT = {
  name: "Eastern Lake",
  tagline: "Restaurante Chino",

  // URL of your deployed payment backend (the server-example/ folder,
  // once deployed to Render or similar). Leave the placeholder in
  // place until then — the site will show a friendly message instead
  // of trying to charge a card.
  // Example once deployed: "https://easternlake-payments.onrender.com"
  paymentApiUrl: "REPLACE_WITH_YOUR_RENDER_URL",
  phone: "(787) 292-0920 / (787) 292-7759",
  address: "1 Cll Frontera, San Juan, PR 00926",
  note: "Servi-carro y orden por teléfono disponible",

  // Hours in 24h time. Set a day to null to mark it closed.
  hours: {
    mon: { open: "10:30", close: "21:45" },
    tue: { open: "10:30", close: "21:45" },
    wed: { open: "10:30", close: "21:45" },
    thu: { open: "10:30", close: "21:45" },
    fri: { open: "10:30", close: "21:45" },
    sat: { open: "10:30", close: "21:45" },
    sun: { open: "10:30", close: "21:45" }
  },

  // Minutes of prep time required before the earliest pickup slot
  // shown to a customer ordering right now.
  minLeadMinutes: 25,

  // Spacing between pickup slots offered to customers, in minutes.
  slotIntervalMinutes: 15
};
