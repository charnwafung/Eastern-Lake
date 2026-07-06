/* ============================================================
   RESTAURANT CONFIG
   Edit everything in this file to make the site yours.
   No other file needs to change for basic setup.
   ============================================================ */

const RESTAURANT = {
  name: "Eastern Lake",
  tagline: "Restaurante Chino",

  // URL of your deployed backend (the server-example/ folder, once
  // deployed to Render or similar). This one URL handles both saving
  // orders for the Kitchen Display and (once Stripe is set up)
  // starting a payment. Leave the placeholder in place until deployed.
  // Example once deployed: "https://easternlake-backend.onrender.com"
  backendUrl: "REPLACE_WITH_YOUR_RENDER_URL",

  // The PIN set on your backend as KITCHEN_PIN — put the same value
  // in the kitchen.html link, e.g. kitchen.html?pin=4821, and bookmark
  // that link on the kitchen's tablet/laptop.
  phone: "(787) 292-0920 / (787) 292-7759",
  address: "Centro Comercial Villa Andalucía, 1 Cll Frontera, San Juan, PR 00926",
  note: "Recogido disponible en mostrador o por servi-carro (drive-through)",

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
