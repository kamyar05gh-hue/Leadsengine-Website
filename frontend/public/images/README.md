# Site images

Files here are served from the site root: `public/images/hero-engine.png` is
referenced as `/images/hero-engine.png`.

## 1. `hero-engine.png` — THE HERO ENGINE (needed)

**Status: missing.** Save the client's engine render here as `hero-engine.png`
and it appears automatically. Nothing else needs changing.

Until then the hero draws a soft ambient bloom and nothing else. That state is
deliberate and reads as finished — it never shows an empty box or a broken
image icon, because the `<img>` is only mounted once the bitmap has genuinely
decoded. But the engine is the point of the hero.

### What to export

- **Square canvas**, engine centred. The frame is rendered as a square, so a
  square source needs no cropping guesswork.
- **PNG with a transparent background**, or the same near-black the site uses
  (`#08090C`). A transparent PNG is better: the site's own ambient glow then
  shows through behind the machine.
- **>= 1200 x 1200** so it stays sharp on high-DPI screens.
- **Pills baked in are fine.** The render the client supplied already carries
  the AI platform names (ChatGPT, Gemini, Grok, Claude, Perplexity, AI), and
  `IMAGE_INCLUDES_PILLS` in `src/components/HeroEngineImage.tsx` is set to
  `true` to match, so no live pills are drawn on top and nothing collides.

  If an **engine-only** export ever replaces it, flip that constant to `false`
  and the pills come back from the dictionary (`t.hero.platforms`), so they
  stay translatable. Adjust `PILL_POS` in the same file if the crop differs.

### Animation

**None.** The client asked for the exact image, presented as-is. The rotating
light passes, the breathing core, the energy streams and the floating pills
that used to be layered on top are deleted, not disabled. The only movement
left is a 600 ms fade as the decoded image is mounted, and that is suppressed
under `prefers-reduced-motion`.

## 2. `team-mohie.jpg` — team photo (missing)

The Team card for Mohie falls back to an "M" initials avatar until this exists.

## 3. Recommended: self-host the other team photos

Elias, Livia and Alex currently hotlink `i.imgur.com`, which can break or
rate-limit. To self-host, save them here and point `image` in
`src/constants/team.ts` at the local paths:

```
team-elias.jpg   ← https://i.imgur.com/9pjdi6d.jpg
team-livia.jpg   ← https://i.imgur.com/tsxABsf.jpg
team-alex.jpg    ← https://i.imgur.com/PiOi9FF.jpg
```

Any member whose image is absent or fails to load renders an initials avatar,
so a missing file degrades gracefully rather than breaking the card.

## Format notes

Team photos: square crops, ≥ 320 × 320, WebP or well-compressed JPEG.
