/* ============================================================
   Backend for Eastern Lake's pickup site.

   Two jobs:
   1. Store every order that comes in from the website, so the
      Kitchen Display page (kitchen.html) can show it.
   2. Create a Stripe Checkout session so customers can pay online
      — until Stripe is configured, /create-payment just replies
      "not configured yet" and the site falls back to a
      confirmation screen without charging a card.

   SETUP
   1. Create a free Stripe account at https://stripe.com if you
      haven't (Puerto Rico businesses are supported).
   2. Get your Secret key from Stripe Dashboard → Developers → API
      keys. Use the "test mode" key first to try everything safely
      with fake cards before going live.
   3. Deploy this folder to Render (see DEPLOY-GUIDE.md).
   4. Set environment variables in Render:
        KITCHEN_PIN         — a 4+ digit code you choose, protects
                               the kitchen screen from strangers
        ALLOWED_ORIGIN       — your live site URL (your own domain)
        SITE_URL             — same as above, used for Stripe's
                               redirect back after payment
        STRIPE_SECRET_KEY    — from Stripe (starts with sk_test_
                               or sk_live_)
        STRIPE_WEBHOOK_SECRET — from Stripe, see Part 6 in
                               DEPLOY-GUIDE.md (optional but
                               recommended — confirms payment
                               actually succeeded before an order
                               counts as paid)
   5. Put the Render URL into js/config.js as `backendUrl`.
   6. Open kitchen.html?pin=YOUR_PIN on a tablet/laptop in the
      kitchen and bookmark it — the PIN is remembered in the URL,
      no typing needed after that.

   npm install express stripe dotenv cors
   ============================================================ */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SITE_URL = process.env.SITE_URL || "https://YOUR-DOMAIN.com";
const stripe = STRIPE_SECRET_KEY ? require("stripe")(STRIPE_SECRET_KEY) : null;

const app = express();

// The Stripe webhook route needs the raw request body (not JSON-parsed)
// to verify its signature, so it's registered before express.json().
app.post("/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(501).send("Webhook not configured");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get("stripe-signature"), STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;
    if (orderId) markOrderPaid(orderId);
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

const KITCHEN_PIN = process.env.KITCHEN_PIN || "";

/* ------------------------------------------------------------
   ORDER STORAGE
   A plain JSON file is enough for a single-location restaurant.
   Note: on Render's free tier, this file resets whenever the
   service redeploys or goes idle-to-sleep and wakes back up. For
   a busier kitchen, swap this for a real database — ask a
   developer to move it to Render's persistent disk or Postgres.
   ------------------------------------------------------------ */
const DATA_FILE = path.join(__dirname, "orders.json");

function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}
function saveOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

let writeQueue = Promise.resolve();
function withOrders(mutator) {
  // Serializes reads/writes so two near-simultaneous orders can't
  // clobber each other.
  writeQueue = writeQueue.then(() => {
    const orders = loadOrders();
    const result = mutator(orders);
    saveOrders(orders);
    return result;
  });
  return writeQueue;
}

function nextOrderCode(orders) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const todayCount = orders.filter(o => o.id.startsWith(`EL-${today}`)).length;
  return `EL-${today}-${String(todayCount + 1).padStart(3, "0")}`;
}

async function markOrderPaid(orderId) {
  await withOrders(orders => {
    const order = orders.find(o => o.id === orderId);
    if (order) order.paid = true;
    return order;
  });
}

function requirePin(req, res, next) {
  if (!KITCHEN_PIN) {
    return res.status(500).json({ error: "Server has no KITCHEN_PIN set — add one in your environment variables." });
  }
  if (req.get("x-kitchen-pin") !== KITCHEN_PIN) {
    return res.status(401).json({ error: "Wrong or missing kitchen PIN." });
  }
  next();
}

/* ------------------------------------------------------------
   Customer-facing: create an order (no PIN needed — anyone
   placing an order through the site calls this).
   ------------------------------------------------------------ */
app.post("/orders", async (req, res) => {
  const { customerName, customerPhone, pickupTime, notes, items, subtotal, tax, total } = req.body;

  if (!customerName || !customerPhone || !pickupTime || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required order fields." });
  }

  const order = await withOrders(orders => {
    const record = {
      id: nextOrderCode(orders),
      customerName,
      customerPhone,
      pickupTime,
      notes: notes || "",
      items,
      subtotal,
      tax,
      total,
      status: "received", // received -> done
      // If Stripe isn't configured, orders are treated as "pay at
      // pickup" and paid stays false — that's fine, it's informational.
      paid: false,
      createdAt: new Date().toISOString()
    };
    orders.push(record);
    return record;
  });

  res.json({ orderId: order.id });
});

/* ------------------------------------------------------------
   Kitchen-facing: list active orders / mark one done.
   Both require the kitchen PIN.
   ------------------------------------------------------------ */
app.get("/orders", requirePin, (req, res) => {
  const orders = loadOrders()
    .filter(o => o.status === "received")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ orders });
});

app.patch("/orders/:id/done", requirePin, async (req, res) => {
  const found = await withOrders(orders => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) order.status = "done";
    return order;
  });
  if (!found) return res.status(404).json({ error: "Order not found." });
  res.json({ ok: true });
});

/* ------------------------------------------------------------
   Customer-facing: look up an order's status. No PIN needed, but
   requires the phone number to match — order IDs alone are
   guessable (they're sequential), so this stops a stranger from
   seeing someone else's name/order by guessing an ID.
   ------------------------------------------------------------ */
function normalizePhone(p) { return String(p || "").replace(/\D/g, ""); }

app.post("/orders/lookup", (req, res) => {
  const { orderId, phone } = req.body;
  if (!orderId || !phone) {
    return res.status(400).json({ error: "Falta el número de orden o el teléfono." });
  }
  const order = loadOrders().find(o => o.id.toLowerCase() === String(orderId).trim().toLowerCase());
  const genericError = () => res.status(404).json({ error: "No encontramos esa orden. Verifica el número y el teléfono." });

  if (!order) return genericError();
  if (normalizePhone(order.customerPhone) !== normalizePhone(phone)) return genericError();

  res.json({
    id: order.id,
    status: order.status,
    paid: order.paid,
    items: order.items,
    total: order.total,
    pickupTime: order.pickupTime,
    createdAt: order.createdAt
  });
});

/* ------------------------------------------------------------
   PAYMENT — Stripe Checkout. Only works once STRIPE_SECRET_KEY is
   set as an environment variable. Until then this returns a clear
   "not configured" response, and the site's checkout falls back to
   confirming the order without charging a card.
   ------------------------------------------------------------ */
app.post("/create-payment", async (req, res) => {
  if (!stripe) {
    return res.status(501).json({ error: "Payment isn't configured yet. Add STRIPE_SECRET_KEY in Render." });
  }

  const { orderId, customerName, customerPhone, pickupTime, items, tax } = req.body;
  if (!orderId || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing order details." });
  }

  try {
    const line_items = items.map(it => ({
      price_data: {
        currency: "usd",
        product_data: { name: it.name },
        unit_amount: Math.round(it.price * 100)
      },
      quantity: it.qty
    }));
    if (tax > 0) {
      line_items.push({
        price_data: { currency: "usd", product_data: { name: "Tax" }, unit_amount: Math.round(tax * 100) },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${SITE_URL}/?order=${encodeURIComponent(orderId)}&paid=1`,
      cancel_url: `${SITE_URL}/?order=${encodeURIComponent(orderId)}&cancelled=1`,
      metadata: { orderId, customerName, customerPhone, pickupTime }
    });

    res.json({ processUrl: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Could not start payment session" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
