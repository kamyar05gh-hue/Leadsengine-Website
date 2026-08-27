# Reference logos

The "Trusted by" band under the hero (`src/sections/TrustedBy.tsx`) renders each
reference as a **monochrome text wordmark** until a logo file exists here. Drop
a file per brand and the band switches to it automatically — no code change.
A missing file falls back to the wordmark, never to a gap.

## Drop files named exactly like this

| File | Brand |
|---|---|
| `uni-bern.svg` | Universität Bern |
| `mazda.svg` | Mazda |
| `sbb.svg` | SBB |
| `wesco.svg` | WESCO |
| `nau.svg` | Nau.ch |
| `bildung-bern.svg` | Bildung Bern |
| `spitex.svg` | Spitex Region Lueg |
| `stiftung-betagte.svg` | Stiftung für Betagte |
| `boehler.svg` | Böhler AG |
| `jobdoor.svg` | Jobdoor |
| `keyken.svg` | Keyken |
| `mabalu.svg` | mabalu |
| `victorinox.svg` | Victorinox |
| `transsicura.svg` | Transsicura |

`.png` also works — the band probes `<slug>.svg` first, then `<slug>.png`.

The slugs live in `src/constants/site.ts` (`references`). To add a brand, add
it there and drop its file here.

**Several logos on the supplied sheet could not be read** — they are near-white
on a white background and their names are not legible. They are deliberately
NOT in the list rather than guessed at. Send those names (or the files, named
by slug) and they go in.

## Format

- **Colour does not matter.** The band uses each logo as a MASK over a flat
  brand blue, so only the artwork's *shape* is used and the source colours are
  discarded. A full-colour Mazda badge and a white Spitex wordmark come out as
  the same blue at the same weight.
- Because it is a mask, the file must have a **transparent background**. A logo
  on a solid white rectangle will mask as a solid blue rectangle. If a supplied
  file has a white background, remove it first.
- SVG preferred, trimmed to the artwork's bounding box. Rendered ~28px tall in
  a 132px-wide box, `object-fit: contain`, so wide wordmarks and square marks
  both sit correctly.

## Legal framing

These are **Future Media** clients, not Leads Engine customers. The line
"Diese Unternehmen werden von Future Media betreut – dem Team hinter Leads
Engine." renders beneath the logos and must stay visible.
