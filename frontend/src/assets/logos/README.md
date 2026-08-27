# Drop the client logos in THIS folder

Any file you put here is picked up automatically by the "Trusted by" band
(`src/sections/TrustedBy.tsx`). **No filename convention, no list to edit, no
code change** — Vite resolves the folder at build time.

- Accepted: `.svg`, `.png`, `.webp`, `.jpg`
- The filename becomes the accessible label: `bildung-bern.svg` -> "Bildung Bern"
- Until at least one file is here, the band renders the brand NAMES as
  wordmarks instead, so it never shows a row of gaps.

## Important: transparent background

Each logo is used as a **mask** over a flat brand blue — the source colours are
discarded and only the shape is kept, so every logo comes out the same blue at
the same weight as the platform marks.

That means the file must have a **transparent background**. A logo saved on a
solid white rectangle will mask as a solid blue rectangle. If a supplied file
has a white background, remove it first (in most PNG exports the background is
already transparent).

## Sizing

Rendered about 28-32px tall inside a 140px-wide box with `contain`, so wide
wordmarks and square marks both sit correctly. Trim the file to the artwork's
bounding box for the best result — a lot of empty margin inside the file makes
the logo look small next to its neighbours.
