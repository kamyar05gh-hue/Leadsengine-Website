import { Fragment, useCallback, useRef, type KeyboardEvent } from "react";
import { useLang, type Lang } from "@/i18n/LanguageContext";

/** German first — it is the primary market, and the control should say so. */
const LANGS: readonly Lang[] = ["de", "en"];

/**
 * Language control — a typographic pair, not a widget.
 *
 * The segmented pill with a sliding blob was thrown out: it is the single most
 * recognisable "AI landing page" component, and it fought the rest of the bar.
 * What replaces it is how a Swiss watch house or a private bank switches
 * locale — two small capitalised labels, a hairline stroke between them set at
 * a slight angle so it reads as a fine solidus rather than a border, and a
 * single blue hairline sitting under whichever one is live. No container, no
 * fill, no shadow, no chrome of any kind.
 *
 * Geometry is frozen. Both labels carry the same size, weight and tracking in
 * both states, and the only thing that changes is a colour and a 1px rule
 * scaling from the left — so switching language cannot move a pixel of layout.
 * Both labels are fully legible at rest (`ink` / `ink-2`); hover only lifts the
 * inactive one to `ink`, it never supplies the legibility.
 *
 * Accessibility: a real `radiogroup` with roving tabindex — Tab reaches the
 * group once, then Arrow/Home/End move between languages, which is the pattern
 * screen-reader users expect from a two-state choice. The rows are real
 * `<button>`s, the hit area is 32px tall, and no prop is required.
 */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, LANGS.indexOf(lang));

  const move = useCallback(
    (to: number) => {
      const next = (to + LANGS.length) % LANGS.length;
      setLang(LANGS[next]);
      buttons.current[next]?.focus();
    },
    [setLang],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          move(activeIndex + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          move(activeIndex - 1);
          break;
        case "Home":
          e.preventDefault();
          move(0);
          break;
        case "End":
          e.preventDefault();
          move(LANGS.length - 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, move],
  );

  return (
    <div
      role="radiogroup"
      aria-label={t.footer.langLabel}
      className={`inline-flex select-none items-center ${className}`}
    >
      {LANGS.map((l, i) => {
        const active = l === lang;
        return (
          <Fragment key={l}>
            {i > 0 && (
              /* A fine solidus, not a border: one hairline, tilted. */
              <span
                aria-hidden="true"
                className="mx-2 block h-[11px] w-px rotate-[16deg] bg-line-strong"
              />
            )}
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              lang={l}
              onClick={() => setLang(l)}
              onKeyDown={onKeyDown}
              className={`relative px-0.5 py-2.5 text-[11px] font-medium uppercase leading-none tracking-[0.18em] [text-indent:0.18em] transition-colors duration-300 [transition-timing-function:var(--le-ease)] ${
                active ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {l.toUpperCase()}
              {/* Always in the DOM, so the switch costs one transform and
                  never a reflow. Gold: the page's one warm accent, used here
                  as the mark of the live choice. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 bottom-1.5 h-px origin-left bg-accent-bright transition-transform duration-500 [transition-timing-function:var(--le-ease-out)] ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
