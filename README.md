# Eastern Lake — Pickup Ordering Site

## What's here

- `index.html`, `css/styles.css`, `js/script.js` — the full pickup-ordering
  site: menu, cart, pickup time picker, checkout form. **This part works
  right now** — open `index.html` in a browser and try it end to end.
- `js/config.js` — edit this to set your real restaurant name, hours,
  phone, and address.
- `js/menu-data.js` — edit this to set your real menu and prices.
- `server-example/server.js` — an **example, not yet connected**, showing
  how the payment step talks to Evertec's PlaceToPay. This needs a real
  server to run and your actual Evertec credentials.

## What's simulated for now

The "Continue to payment" button skips straight to a confirmation screen.
No real charge happens. That's intentional — I didn't want to build
anything that touches real money without your credentials and your okay.

## To take real payments, you (or a developer) need to

1. **Get PlaceToPay access from Evertec.** Ask your Evertec rep for
   PlaceToPay (their online checkout product) login + secret key, and
   their current API docs — the exact endpoint in `server.js` should be
   confirmed against what they send you, since integration details can
   change.
2. **Host the small backend in `server-example/`** somewhere (it can't
   live only in the browser — your secret key would be exposed). Any
   basic Node hosting works.
3. **Wire the checkout form to call it.** In `js/script.js`, the
   `submitOrder` function has a comment marking exactly where to send
   the order to `/create-payment` and redirect the customer to the
   `processUrl` it returns, instead of jumping to the confirmation
   screen directly.
4. **Decide on cash/pay-at-pickup**, if you want that as an option
   alongside card — that's just a second button, no Evertec needed.
5. **Consider ATH Móvil** as a second payment option — very commonly
   used in PR for exactly this kind of pickup order, and Evertec
   operates it too.

## Hosting the site itself

Any static hosting works (Netlify, Vercel, GitHub Pages, or your current
web host) since `index.html`, `css/`, and `js/` are all static files —
this is separate from wherever the payment backend runs.
