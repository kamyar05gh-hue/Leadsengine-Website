import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { TEAM } from "@/constants/team";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * The roster as PORTRAIT CARDS — the structure of future-media.ch/team, which
 * the client asked the "Über uns" page to follow.
 *
 * What that structure is, and what it is not:
 *
 *   IS   a grid of cards, each one a large rectangular portrait filling the
 *        card's width, with the name under it and the role under that.
 *   NOT  the circular avatars used on the home page — those are a compact
 *        roster strip; this is the page where the people are the content.
 *
 * NO BIOS, BY INSTRUCTION. The reference page carries three paragraphs and a
 * mail link per person. The client asked for "just their picture and role",
 * so the card stops at the role. Nothing is truncated or hidden — the text
 * simply is not there, which is why there is no "read more" affordance.
 *
 * PHOTOS come from `public/team/<slug>.{jpg,png,webp}`, the same files the
 * home-page grid uses, so a portrait added for one appears in both. A member
 * with no file yet gets their initial on a tinted ground rather than a broken
 * image or a gap.
 */

/* Deterministic per-slug tint, matching TeamGrid so the same person is the
   same colour in both places. Three of the site's own tones, never a fourth. */
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

function Portrait({ slug, name, load }: { slug: string; name: string; load: boolean }) {
  const [broken, setBroken] = useState(false);
  const tone = tintFor(slug);

  /* `aspect-[4/5]` rather than a square: the reference uses an upright frame,
     and a head sits better in one. The supplied files are square, so
     `object-cover` crops the sides rather than the top of the head. */
  const frame =
    "relative w-full overflow-hidden rounded-xl aspect-[4/5] bg-surface";

  if (broken || !load) {
    return (
      <div
        className={`${frame} grid place-items-center`}
        style={{ background: `rgb(${tone} / 0.12)` }}
        aria-hidden="true"
      >
        <span className="text-[42px] font-semibold text-ink/70">{name.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={frame}>
      <img
        src={`/team/${slug}.jpg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.endsWith(".jpg")) img.src = `/team/${slug}.png`;
          else if (img.src.endsWith(".png")) img.src = `/team/${slug}.webp`;
          else setBroken(true);
        }}
        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
      />
    </div>
  );
}

export default function TeamCards() {
  const { t } = useLang();
  const roles = t.about.roles;
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.05, once: true });
  const on = reduced || inView;

  return (
    <ul
      ref={ref}
      className="grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12"
    >
      {TEAM.map((member, i) => (
        <li
          key={member.slug}
          className="group flex min-w-0 flex-col"
          style={{
            opacity: on ? 1 : 0,
            transform: on ? "none" : "translateY(16px)",
            transition: reduced
              ? undefined
              : `opacity 560ms var(--le-ease-out) ${i * 70}ms, transform 560ms var(--le-ease-out) ${i * 70}ms`,
          }}
        >
          {/* `inView`, not `on`: under reduced motion `on` is true from first
              paint, which would defeat the deferral for exactly the visitors
              most likely to be on a constrained device. */}
          <Portrait slug={member.slug} name={member.name} load={inView} />

          <h3 className="mt-4 text-[17px] font-semibold leading-[1.25] tracking-[-0.015em] text-ink sm:text-[19px]">
            {member.name}
          </h3>
          <p className="mt-1 text-[13px] leading-[1.5] text-ink-3 sm:text-[13.5px]">
            {roles[member.name] ?? member.role}
          </p>
        </li>
      ))}
    </ul>
  );
}
