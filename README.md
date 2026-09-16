# Kaufman Wash — website + Square booking + admin

A full marketing site for Kaufman Wash, with appointment booking and
payment handled by **Square Appointments**. The pages themselves are
static HTML/CSS, but nearly all of the text on the site is editable
live from a password-protected **`/admin`** dashboard — no code
changes or redeploys needed to fix a typo or update a price. Editing
is powered by a small Cloudflare Pages Functions backend + KV storage
(see section 3).

## What's in here

```
index.html                 Homepage — pricing, add-ons, gallery, contact
booking.html                Booking page — embeds the Square Appointments widget
css/styles.css                Site styles
css/admin.css                   Styles for /admin only
js/data.js                        Default site copy — fallback only, see section 3
js/content.js                       Fetches live content from /api/content and renders it
js/main.js                            Nav toggle, footer year (no content logic)
js/admin.js                             Renders the /admin edit form
images/logo.svg, icon.svg  Logo + favicon (vector, easy to recolor)
images/gallery/          Your real detailing photos, used across the site
functions/admin.js      /admin route — login form + dashboard (Cloudflare Pages Function)
functions/api/content.js  /api/content route — read/write the live site text
functions/lib/            Shared auth + default-content helpers for the Functions above
```

## 1. Set up Square Appointments

If you don't already have a Square account, create one at
[squareup.com](https://squareup.com) and turn on **Appointments**
(Square Dashboard → Appointments).

**Add your services** (Appointments → Services) to match what's on the
site — keep these in sync with `js/data.js` so customers see the same
price in both places:

| Service | Price | Duration |
|---|---|---|
| Small Car Detail (sedan/coupe) | $100 | ~2 hr |
| Medium Detail (SUV/wagon) | $125 | ~2.5 hr |
| Large Detail (van/truck) | $150 | ~3 hr |

Add your add-ons as extra services or "add-ons" on those services:
Paint Protectant/Sealant ($45), Pet Hair Removal ($35), Headlight
Restoration ($60), Engine Bay Detail ($40), Odor Elimination ($35),
Leather Conditioning ($30).

**Set your business as mobile** — Appointments → Locations → your
location → **Appointment Preferences → Where do you accept
appointments?** → choose **At the Customer's Location** (or **At Both**
if you ever want customers to come to you too). This makes Square ask
for the customer's address automatically at checkout — no custom form
needed.

**Set your hours** under Appointments → Calendar & Booking.

**Set your payment policy** under Appointments → Online Booking →
Prepayment — choose whether customers pay in full online, pay a
deposit, or can reserve now and pay cash/card in person. Square
supports card, Apple Pay, Google Pay, and in-person payment.

## 2. Booking link (already connected)

`booking.html` embeds the live Square Appointments booking page for
this business:

```
https://app.squareup.com/appointments/book/nli0ta2tcmk72z/L34BNW3KDNT5C/start
```

It's wired in two places — both inside `#squareBooking` /
`.embed-fallback` in `booking.html`:

- an `<iframe>` that embeds the booking flow directly on the page
  (Square doesn't send an `X-Frame-Options`/`frame-ancestors`
  restriction on this booking URL, so the iframe embed works)
- a "Book on Square →" fallback button that opens the same link in a
  new tab, for anyone who has iframes blocked

If the booking link ever changes (e.g. a new Square location ID),
update the URL in both spots.

## 3. Set up the `/admin` editor (Cloudflare Pages Functions + KV)

The homepage and booking page fetch their text from `/api/content` at
load time (falling back to the defaults in `js/data.js` if that request
fails). `/admin` is a password-gated dashboard that edits that same
content in place — changes are live immediately, no redeploy needed.
This needs two things set up in the Cloudflare dashboard:

1. **Create a KV namespace.** Workers & Pages → **KV** → Create a
   namespace, e.g. `kaufman-wash-content`.
2. **Bind it to this Pages project as `CONTENT_KV`.** Your Pages
   project → **Settings → Functions → KV namespace bindings** → Add
   binding → Variable name `CONTENT_KV`, pick the namespace you just
   created.
3. **Set the admin password.** Your Pages project → **Settings →
   Environment variables** → Add variable → name `ADMIN_PASSWORD`,
   value: your chosen password, and click **Encrypt**. Set this for
   both Production and Preview if you use preview deployments. This is
   the only password — there's no separate admin username or account
   system.
4. Redeploy (or trigger any deploy) so the new binding/variable take
   effect, then visit `https://yoursite.com/admin` and sign in.

**Rotating the password:** just change `ADMIN_PASSWORD` in the
Cloudflare dashboard and redeploy — that instantly signs out every
existing admin session too, since sessions are signed with that
password.

**Local development:** `npm run dev` runs `wrangler pages dev . --kv
CONTENT_KV`, which simulates the KV namespace locally and reads
`ADMIN_PASSWORD` from `.dev.vars` (already present, gitignored, holds
a throwaway local password — change it if you want). Visit
`http://localhost:8788/admin`.

**What's editable:** essentially every piece of marketing copy — hero
text, section headings/body copy, vehicle size names/prices, add-on
names/prices/descriptions, gallery captions, footer contact info and
hours, the "why us" bullets, and the booking page intro. A few purely
decorative/structural bits (nav labels, button labels, the hero
ticket's illustrative checklist) are intentionally left static since
editing them risks breaking layout — ask if you'd like any of those
made editable too.

## 4. Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo, or drag-and-drop deploy from the
   Cloudflare dashboard: **Workers & Pages → Create → Pages → Upload assets**.
2. If using Git: **Workers & Pages → Create → Pages → Connect to Git**,
   pick the repo. No build command needed — output directory is `/` (root).
3. Complete section 3 above (KV binding + `ADMIN_PASSWORD`) so
   `/admin` and the live content API work in production.

## 5. Custom domain

Pages project → **Custom domains** → add your domain and follow the DNS
steps Cloudflare gives you.

## 6. Keep Square in sync

`js/data.js` holds the fallback/default pricing and add-on copy (used
only if `/api/content` is unreachable, or before anything's been saved
from `/admin`). Whenever you change a price on the site via `/admin`,
also update the matching service price in your Square Dashboard so
customers never see two different numbers between the site and
checkout.

## 7. Photos

Real photos are wired in at `images/gallery/` — used in the hero
background, the "Every detail, done right" banner, the Why Us section,
and the gallery grid on the homepage. To swap or add more, drop images
into `images/gallery/` and update the `<img src="...">` paths in
`index.html`'s `#gallery` section, and the `url('images/gallery/...')`
references in `css/styles.css` if you want different background photos.

---
Site managed by [northstartechmn.com](https://northstartechmn.com)
# kaufmanwash
# kaufmanwash
# kaufmanwash
