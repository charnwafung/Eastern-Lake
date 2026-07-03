# Deploy Guide — Eastern Lake Pickup Site

Two separate deployments: the website (static files) and the payment
backend (small server). They don't need to happen on the same day —
the site works and takes orders without the backend; it just skips
straight to a confirmation screen until the backend is live.

---

## Part 1 — Put the code on GitHub (do this first)

Both Netlify and Render deploy easiest from a GitHub repo.

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository, e.g. `easternlake-site`.
3. Upload the entire `easternlake-site` folder (everything you downloaded
   from this chat) into that repository. Easiest way with no command
   line: on the repo page, click **Add file → Upload files**, then drag
   the whole folder in.

You'll end up with one repo containing both the site files and the
`server-example/` folder — that's fine, they deploy independently from
the same repo.

---

## Part 2 — Deploy the website to Netlify

1. Go to https://netlify.com and sign up (the free "Starter" plan is
   enough).
2. Click **Add new site → Import an existing project**.
3. Connect your GitHub account and pick the `easternlake-site` repo.
4. Build settings:
   - **Base directory:** leave blank (or set it if you nested the
     folder inside another one)
   - **Build command:** leave blank — there's nothing to build, it's
     plain HTML/CSS/JS
   - **Publish directory:** `.` (the root of the repo, since
     `index.html` sits at the top level)
5. Click **Deploy**. In under a minute you'll get a live URL like
   `https://random-name-123.netlify.app` — that's your site, live on
   the internet.
6. **Custom domain:** in Netlify, go to **Domain settings → Add a
   domain**, enter your domain (buy one from Namecheap, Cloudflare, or
   similar if you don't have one), and follow the DNS instructions
   Netlify gives you. HTTPS is set up automatically once DNS propagates
   (can take a few hours).

From now on, any time you edit `js/menu-data.js` or `js/config.js` in
GitHub and commit the change, Netlify redeploys automatically.

---

## Part 3 — Deploy the backend to Render

You can do this now, even before you set up Stripe — the Kitchen
Display and order-saving work without it. Payment can be added later
just by adding environment variables, no redeploy of code needed.

1. Go to https://render.com and sign up.
2. Click **New → Web Service**, connect the same GitHub repo.
3. **Root directory:** `server-example` (this tells Render to only run
   what's in that folder).
4. **Runtime:** Node.
5. **Build command:** `npm install`
6. **Start command:** `npm start`
7. **Instance type:** the free tier is fine to start (it sleeps after
   inactivity and wakes on the next request, which adds a few seconds
   delay to the first order after a quiet period — the paid $7/mo tier
   removes that if it bothers you). Note: the free tier's disk resets
   on redeploy/sleep cycles, so treat old orders as not permanently
   archived — fine for day-to-day kitchen use, not for long-term
   record-keeping.
8. Under **Environment**, add:
   - `ALLOWED_ORIGIN` = your live domain, e.g. `https://easternlake.com`
   - `SITE_URL` = the same domain — used to send customers back after
     paying
   - `KITCHEN_PIN` = any 4+ digit code you choose — this protects your
     kitchen screen from strangers finding it
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — add these once you
     get to Part 6 below. Until they're set, checkout still works and
     saves orders — it just skips the online-payment step.
9. Click **Create Web Service**. Render gives you a URL like
   `https://easternlake-backend.onrender.com`.

## Part 4 — Connect the site to the backend

1. Open `js/config.js` in your GitHub repo.
2. Set `backendUrl` to the Render URL from step 9 above.
3. Commit the change — Netlify redeploys automatically. From then on,
   every order placed on the site is saved to your backend and shows
   up on the Kitchen Display.
4. Place a real test order yourself, start to finish, to make sure it
   shows up.

## Part 5 — Set up the Kitchen Display

1. Take the PIN you set as `KITCHEN_PIN` in Part 3.
2. On the tablet, laptop, or computer you'll keep in the kitchen, open:
   `https://YOUR-DOMAIN.com/kitchen.html?pin=YOUR_PIN`
3. Bookmark that exact page (or add it to the home screen on a tablet)
   — the PIN is remembered in that URL, so no one needs to type it in
   again.
4. Leave that page open. It checks for new orders every few seconds
   and plays a sound when one comes in. Tap **Mark done** to clear an
   order once it's made.

## Part 6 — Turn on real payment with Stripe

1. Sign up at https://stripe.com (Puerto Rico businesses are
   supported). You can build and test everything below before
   Stripe finishes verifying your account — just use test mode.
2. In the Stripe Dashboard, make sure you're in **Test mode** (toggle,
   top right) while you try things out.
3. Go to **Developers → API keys**, copy the **Secret key** (starts
   with `sk_test_...`).
4. In Render, add environment variable `STRIPE_SECRET_KEY` with that
   value. Save — Render redeploys automatically.
5. Place a test order on your live site. On the payment page, use
   Stripe's test card `4242 4242 4242 4242`, any future expiry date,
   any 3-digit CVC. It should complete without charging anything real.
6. **(Recommended)** Set up the webhook, which confirms a payment
   actually succeeded rather than just trusting the browser redirect:
   - In Stripe Dashboard: **Developers → Webhooks → Add endpoint**.
   - Endpoint URL: `https://YOUR-RENDER-URL.onrender.com/stripe-webhook`
   - Select event: `checkout.session.completed`.
   - Copy the **Signing secret** it gives you (starts with `whsec_`),
     add it to Render as `STRIPE_WEBHOOK_SECRET`.
7. When you're ready to accept real cards, flip Stripe's toggle out of
   Test mode, get your **live** secret key (`sk_live_...`), and swap
   it into `STRIPE_SECRET_KEY` on Render. Do the same for the webhook
   signing secret in live mode.

---

## Ongoing costs (realistic, at launch scale)

| Piece | Cost |
|---|---|
| Netlify (site) | $0 |
| Render (backend) | $0–7/month |
| Domain | ~$10–20/year (you already have this) |
| Stripe fees | ~2.9% + $0.30 per transaction, no monthly fee |

Nothing here requires a yearly contract — you can start on free tiers
and upgrade only if order volume actually needs it.
