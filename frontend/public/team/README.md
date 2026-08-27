# Team photos

Drop a photo here named exactly after the person's slug and it is picked up
automatically — on the main page's team band, on the "Über uns" page, no code
change either place.

| File | Person |
|---|---|
| `elias.jpg` | Elias — CEO & Founder |
| `livia.jpg` | Livia — Marketing Manager |
| `alex.jpg` | Alex — Growth & Sales |
| `mohie.jpg` | Mohie — CTO & AI/Software Engineer |
| `daniel.jpg` | Daniel — AI & Software Engineer |
| `mahboob.jpg` | Mahboob — Data Security Advisor |

`.png` and `.webp` also work (tried in that order after `.jpg`). Until a
file exists, that person shows as a tinted initial instead of a broken image
— never a gap.

## Why this folder and not `src/assets/team/`

The "Über uns" page is generated at build time as plain HTML (like the legal
pages), with no JavaScript bundle. It cannot resolve a Vite-processed asset
import, but it CAN reference a file that ships as-is under `/team/…`, which is
exactly what everything in `public/` does. Keeping team photos here means one
folder serves both the React team band and the static About page — no
duplicate copies, no two different URLs for the same face.

## Format

- Square, or close to it — the component crops to a circle with
  `object-fit: cover`, so a portrait or landscape source still works but a
  roughly-square crop looks best.
- Reasonable file size (a few hundred KB), since these are not optimised or
  resized at build time.
