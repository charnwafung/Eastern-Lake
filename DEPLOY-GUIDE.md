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

## Part 3 — Deploy the payment backend to Render

Only do this once you have your Evertec PlaceToPay login and secret key.

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
   removes that if it bothers you).
8. Under **Environment**, add these variables (values from Evertec, and
   your live Netlify URL):
   - `PLACETOPAY_LOGIN`
   - `PLACETOPAY_SECRET`
   - `ALLOWED_ORIGIN` = your Netlify URL, e.g. `https://easternlake.com`
9. Click **Create Web Service**. Render gives you a URL like
   `https://easternlake-payments.onrender.com`.

## Part 4 — Connect the two

1. Open `js/config.js` in your GitHub repo.
2. Set `paymentApiUrl` to the Render URL from step 9 above.
3. Commit the change — Netlify redeploys automatically, and from then
   on the "Continue to payment" button sends real orders to your
   backend instead of showing the demo confirmation.
4. Place a real test order yourself, start to finish, before telling
   customers the site is live.

---

## Ongoing costs (realistic, at launch scale)

| Piece | Cost |
|---|---|
| Netlify (site) | $0 |
| Render (backend) | $0–7/month |
| Domain | ~$10–20/year |
| Evertec/PlaceToPay fees | per-transaction, set by your Evertec agreement |

Nothing here requires a yearly contract — you can start on free tiers
and upgrade only if order volume actually needs it.
