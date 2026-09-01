# Litt Visual — portfolio website

A self-contained static website. No build step, no server required — every asset
(fonts, images) is bundled locally, so it works offline and on any host.

## View it
Double-click **index.html** to open it in your browser. That's it.

To put it online, upload the whole folder to any static host (Netlify drag-and-drop,
Vercel, GitHub Pages, Cloudflare Pages, or ordinary web hosting).

## What's inside
```
index.html            the whole page
css/style.css         styles (warm cream editorial system)
css/fonts.css         @font-face rules (self-hosted)
fonts/                Fraunces, Inter, Space Mono (woff2)
js/main.js            cursor, nav, hero slideshow, masonry, lightbox, form
images/grid/          full-size portfolio photos (img-01…img-28)
images/hero/          smaller versions used by the 3D hero
```

## Connect the contact form (Formspree)
1. Create a free form at https://formspree.io and copy your endpoint
   (looks like `https://formspree.io/f/abcdwxyz`).
2. Open **index.html**, find `action="https://formspree.io/f/YOUR_FORM_ID"`
   and replace `YOUR_FORM_ID` with your real ID.
That's the only change — submissions then send inline with a thank-you message.
(Until you do, the form runs in "demo mode" and won't post anywhere.)

## Change your details
All placeholder contact info lives in **index.html**:
- Email: `bookings@littvisual.com` (search for it — appears in the chip and mailto)
- Phone: `+1 (555) 214-0197`
- Location line: `West Coast · Available worldwide`
- Social links: the four `<a href="#">` buttons in the "Let's connect" section —
  drop in your Instagram / X / Facebook / Behance URLs.

## Add or replace photos
Grid photos are `images/grid/img-01.jpg … img-28.jpg`; each has a matching tile
in index.html with a title and number. The hero slideshow cycles through the same
grid photos in a random order (reshuffled every visit), driven by the `pool` list
near the top of the slideshow block in **js/main.js**. Keep grid images ~1500px on
the long edge for fast loading.

## Notes
- The hero is a slow slideshow: full-bleed photos slowly cross-fade in a random
  order that reshuffles on every visit — no autoplay motion, no auto-scroll.
  Fade/hold timing lives in **js/main.js** (the slideshow block: `2200ms` fade in
  css/style.css, `6500ms` interval in the JS).
- The hero title "Litt Visual" is set in Helvetica Bold (75px), falling back
  to Arial where Helvetica isn't installed.
- The cursor becomes a small white circle on desktop (pointer devices); touch
  devices keep the native cursor.

Fonts: Fraunces, Inter, Space Mono (Open Font License). Hero title in Helvetica/Arial.
