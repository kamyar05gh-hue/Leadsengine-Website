import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TEAM } from "@/constants/team";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * The roster — PORTRAITS ON THE GROUND, NOT CARDS.
 *
 * NO PANEL AROUND A PERSON, BY INSTRUCTION. This briefly used the bordered
 * `Benefits.tsx` card language so it would match the rest of the page. The
 * client ruled that out: a face boxed inside a bordered, tinted panel reads
 * like a product feature tile, not like a person, and six of them in a row
 * turn a team into a spec sheet. The photo carries the section; the ring
 * around it is the only frame it gets.
 *
 * What still ties it to the page is the type, the tokens and the staggered
 * reveal — not a box.
 *
 * The tint is picked deterministically from the slug, not randomly, so the
 * same person always gets the same colour on every load and in every
 * language — three of the site's own tones in rotation (blue, gold, cyan),
 * never a fourth invented one.
 */
const TINTS = [
  "var(--le-accent-bright-rgb)",
  "var(--le-gold-bright-rgb)",
  "var(--le-cyan-rgb)",
] as const;

function tintFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

/**
 * One member's portrait: a photo if `public/team/<slug>.*` exists, otherwise
 * an initial on a tinted ring. Plain `<img onError>` rather than a pre-flight
 * probe — the photo is a direct, cheap request, and `onError` swaps to the
 * fallback in one paint with no duplicate request and no async flash.
 *
 * The halo behind it is the tint at low alpha, so a missing photo degrades to
 * something that still looks placed rather than to a hole in the card.
 */
function Avatar({ slug, name, size }: { slug: string; name: string; size: number }) {
  const [broken, setBroken] = useState(false);
  const tone = tintFor(slug);

  const ring = {
    width: size,
    height: size,
    border: `1px solid rgb(${tone} / 0.42)`,
    boxShadow: `0 0 0 5px rgb(${tone} / 0.09)`,
  } as const;

  if (broken) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full font-semibold text-ink"
        style={{ ...ring, fontSize: size * 0.36, background: `rgb(${tone} / 0.16)` }}
        aria-hidden="true"
      >
        {name.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={`/team/${slug}.jpg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      onError={(e) => {
        // one retry at .png, then .webp, before giving up and showing initials
        const img = e.currentTarget;
        if (img.src.endsWith(".jpg")) img.src = `/team/${slug}.png`;
        else if (img.src.endsWith(".png")) img.src = `/team/${slug}.webp`;
        else setBroken(true);
      }}
      className="shrink-0 rounded-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      style={ring}
    />
  );
}

/* Larger than it could be inside a panel: dropping the card frees the padding
   the border used to eat, and the photo is what this section is for. At the
   1180px container this leaves ~163px per column for a 112px portrait plus its
   ring, so it never crowds its neighbour. */
/* Literal classes only — see the note on the <ul> below. Anything outside
   this map means the roster outgrew a single row and needs a real decision
   about layout rather than an eighth narrower column. */
const COLS_BY_COUNT: Record<number, string> = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};
const COLS = COLS_BY_COUNT[TEAM.length] ?? "lg:grid-cols-6";

export default function TeamGrid({ size = 112 }: { size?: number }) {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const roles = t.about.roles;
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.1, once: true });
  const on = reduced || inView;

  return (
    /* THE WHOLE TEAM ON ONE ROW from `lg` up, by instruction — an explicit
       column count, not a wrapping flex, so they are equal-width tracks that
       stay on one line instead of orphaning the last one or two.

       The count is derived from TEAM.length rather than hard-coded: it was
       `grid-cols-6` and adding a seventh member silently dropped that person
       onto a second row by themselves, which is exactly what the instruction
       rules out. The classes are written out in full because Tailwind's JIT
       scans for literal strings — `lg:grid-cols-${n}` would be purged and
       the grid would collapse to one column. Below `lg` it steps down 3 → 2,
       since seven 1/7-width columns on a phone would be unreadable.
       `items-start` so a two-line role never stretches its neighbours. */
    <ul
      ref={ref}
      className={`grid grid-cols-2 items-start gap-x-6 gap-y-10 sm:grid-cols-3 lg:gap-x-4 xl:gap-x-6 ${COLS}`}
    >
      {TEAM.map((member, i) => (
        <li
          key={member.slug}
          className="group flex min-w-0 flex-col items-center text-center"
          style={{
            opacity: on ? 1 : 0,
            transform: on ? "none" : "translateY(18px)",
            transition: reduced
              ? undefined
              : `opacity 620ms var(--le-ease-out) ${i * 90}ms, transform 620ms var(--le-ease-out) ${i * 90}ms`,
          }}
        >
          <Avatar slug={member.slug} name={member.name} size={size} />

          <h3 className="mt-5 break-words text-[15px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink">
            {member.name}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-[1.5] text-ink-3">
            {roles[member.name] ?? member.role}
          </p>
        </li>
      ))}
    </ul>
  );
}
