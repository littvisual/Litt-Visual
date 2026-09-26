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

## Contact form (Formspree)
The form posts to `https://formspree.io/f/xbglabpl` (set in the form's `action`
in **index.html**). Submissions arrive in that Formspree account's inbox; manage
notification emails and spam filtering from the Formspree dashboard.

## Change your details
All placeholder contact info lives in **index.html**:
- Email: `bookings@littvisual.com` (search for it — appears in the chip and mailto)
- Phone: `(619) 780-6345` (tap-to-call link: `tel:+16197806345`)
- Location line: `West Coast · Available worldwide`

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
- The hero title "Litt Visual" is set in Georgia Bold Italic (75px), falling back
  to Times New Roman where Georgia isn't installed.
- The cursor becomes a small white circle on desktop (pointer devices); touch
  devices keep the native cursor.

Fonts: Fraunces, Inter, Space Mono (Open Font License). Hero title in Georgia.
