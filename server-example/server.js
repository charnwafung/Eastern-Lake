/* ============================================================
   EXAMPLE ONLY — not wired into the site yet.

   This shows the shape of the piece a developer needs to add:
   a small backend that creates a PlaceToPay (Evertec) checkout
   session and hands the customer off to pay. Your secret API
   keys must live here, on a server — never in the website's
   front-end code.

   To actually go live you (or a developer) will need to:
   1. Get your PlaceToPay login + secret key from Evertec.
   2. Run this on a real server (Node hosting, e.g. Render,
      Railway, a VPS, etc. — not required to be the same host
      as the static site).
   3. Point the "Continue to payment" button in js/script.js
      at POST /create-payment instead of skipping to confirm.
   4. Set up the returnUrl below to a page on your site that
      checks the payment status and shows the real confirmation.

   npm install express node-fetch dotenv cors
   ============================================================ */

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());

// Your site (on Netlify/Vercel/etc.) and this backend (on Render/etc.)
// live on different domains, so CORS has to be enabled explicitly.
// Lock this down to your real site domain once you have it instead
// of allowing all origins.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

const PLACETOPAY_LOGIN = process.env.PLACETOPAY_LOGIN;   // from Evertec
const PLACETOPAY_SECRET = process.env.PLACETOPAY_SECRET; // from Evertec
const PLACETOPAY_URL = "https://checkout.placetopay.com/api/session"; // confirm exact endpoint with Evertec onboarding docs

// PlaceToPay requires each request to be signed with a nonce + timestamp.
function buildAuth() {
  const nonce = crypto.randomBytes(16).toString("base64");
  const seed = new Date().toISOString();
  const rawNonce = crypto.randomBytes(16);
  const tranKey = crypto
    .createHash("sha256")
    .update(Buffer.concat([rawNonce, Buffer.from(seed), Buffer.from(PLACETOPAY_SECRET)]))
    .digest("base64");

  return {
    login: PLACETOPAY_LOGIN,
    tranKey,
    nonce: rawNonce.toString("base64"),
    seed
  };
}

app.post("/create-payment", async (req, res) => {
  const { orderId, customerName, customerPhone, pickupTime, total } = req.body;

  const payload = {
    auth: buildAuth(),
    payment: {
      reference: String(orderId),
      description: `Pickup order for ${customerName}, ready ${pickupTime}`,
      amount: {
        currency: "USD",
        total: Number(total)
      }
    },
    buyer: {
      name: customerName,
      mobile: customerPhone
    },
    // where PlaceToPay sends the customer back after paying
    returnUrl: "https://YOUR-DOMAIN.com/order-confirmed",
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    expiration: new Date(Date.now() + 20 * 60000).toISOString() // 20 min to pay
  };

  try {
    const response = await fetch(PLACETOPAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    // data.processUrl is the hosted payment page to redirect the customer to
    res.json({ processUrl: data.processUrl, requestId: data.requestId });
  } catch (err) {
    console.error("PlaceToPay session error:", err);
    res.status(500).json({ error: "Could not start payment session" });
  }
});

// PlaceToPay will also call/allow you to poll a status endpoint using
// requestId to confirm the payment before you mark the order as paid —
// see Evertec's PlaceToPay integration docs for /api/session/{requestId}.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Payment server running on port ${PORT}`));
