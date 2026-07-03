# Eastern Lake — Pickup Ordering Site

## What's here

- `index.html`, `css/styles.css`, `js/script.js` — the full pickup-ordering
  site: menu, cart, pickup time picker, checkout form. **This part works
  right now** — open `index.html` in a browser and try it end to end.
- `kitchen.html`, `js/kitchen.js`, `css/kitchen.css` — the Kitchen Display:
  a live board of incoming orders for a tablet/laptop in the kitchen.
- `js/config.js` — restaurant name, tagline, hours, phone, address, and
  the backend URL once deployed.
- `js/menu-data.js` — your real menu and prices.
- `server-example/` — the backend: saves orders for the Kitchen Display
  and creates Stripe Checkout sessions for payment. Needs to be deployed
  somewhere (see DEPLOY-GUIDE.md) — it can't run in the browser alone.

## What works today vs. what needs setup

- **Menu, cart, pickup scheduling, Kitchen Display:** all work as soon as
  the backend is deployed — no Stripe account required for this part.
- **Real card payment:** requires a Stripe account and two keys added to
  the backend's environment variables (Part 6 of DEPLOY-GUIDE.md). Until
  that's done, checkout still saves the order and shows a confirmation —
  it just skips charging a card, so you'd collect payment at pickup in
  the meantime.

## Hosting

- **Site** (`index.html`, `css/`, `js/`, `kitchen.html`): any static host
  — Netlify, Vercel, GitHub Pages. See DEPLOY-GUIDE.md for the exact
  Netlify steps.
- **Backend** (`server-example/`): needs to run somewhere with Node —
  Render is what the guide walks through, since it has a workable free
  tier and deploys straight from GitHub.
- These are two separate deployments; either can be updated independently.

## Full walkthrough

See `DEPLOY-GUIDE.md` for step-by-step instructions covering GitHub →
Netlify → Render → Kitchen Display → Stripe, in that order.
