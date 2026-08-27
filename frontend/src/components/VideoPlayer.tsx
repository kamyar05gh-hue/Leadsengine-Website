import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Check,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

/**
 * The site's own video player — a native `<video>` with the browser chrome
 * turned off and our controls drawn over it.
 *
 * WHY NOT `controls`. The native control bar is the one surface on the page
 * that would be styled by Chrome rather than by us: blue-grey on desktop,
 * a different blue-grey on Android, translucent white on iOS. On a page this
 * carefully toned it reads as a foreign object dropped into the layout.
 *
 * WHAT IS DELIBERATE HERE
 *
 * · The timeline is a REAL `<input type="range">`, not a div with a click
 *   handler. That is what makes it keyboard-operable (arrows seek, Home/End
 *   jump) and gives assistive tech a slider with a value, for free and
 *   correctly. It is styled through `.le-video-range` in index.css — a
 *   pseudo-element track and thumb, since those cannot be set from Tailwind.
 *
 * · Nothing is downloaded until the visitor asks. `preload="none"` plus a
 *   poster means the page costs one 43 KB JPEG, not an 8.6 MB video, for
 *   every visitor who never presses play. The first click loads and plays.
 *
 * · `playsInline` is required or iOS Safari hijacks playback into its own
 *   fullscreen player, which throws away this entire component.
 *
 * · Controls are always in the DOM and fade via opacity, so showing them
 *   costs no layout and they can never shift the frame. They stay visible
 *   while paused, while the pointer is over the frame, and whenever anything
 *   inside has keyboard focus — that last one is what stops a keyboard user
 *   from tabbing to a control they cannot see.
 *
 * · Time is `le-mono` (tabular figures) so the digits do not jitter as they
 *   count, which on a proportional face makes the whole bar twitch.
 */

/** `m:ss`, and `h:mm:ss` only if the video is actually that long. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** One rung of the quality ladder. `label` is shown; `height` is the file. */
export type Quality = { label: string; src: string };

export default function VideoPlayer({
  qualities,
  defaultQuality = 1,
  poster,
  className = "",
}: {
  qualities: Quality[];
  /** Index into `qualities`. 720p by default — see the note in VideoSection. */
  defaultQuality?: number;
  poster: string;
  className?: string;
}) {
  const { t } = useLang();
  const v = t.video;
  const uid = useId();

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [qualityIndex, setQualityIndex] = useState(defaultQuality);
  const [menuOpen, setMenuOpen] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [full, setFull] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  /* `started` gates the big centre play button: before the first play the
     poster needs one large, obvious target; after that the bar is enough. */
  const [started, setStarted] = useState(false);

  /* ------------------------------------------------------------------
     TOUCH CONTROLS.

     The bar's visibility was driven by `pointerInside`, i.e. HOVER — which
     does not exist on a phone. The result, measured on a real touch
     viewport: once playback started the controls faded out and there was no
     way to get them back, so the timeline could never be dragged, and
     tapping the picture called `toggle()` and merely paused the video.

     So on a coarse pointer a tap means "show me the controls", not
     "play/pause" — which is what every native mobile player does. They then
     auto-hide again after a few seconds so they do not sit over the picture.
     ------------------------------------------------------------------ */
  const [touchRevealed, setTouchRevealed] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  /* SEEDED from the media query, then CORRECTED by the real pointer that
     actually touches the player. The media query alone was not enough: a
     tablet with a keyboard case, a touchscreen laptop and a desktop with a
     stylus all report `(pointer: coarse)` inconsistently between browsers,
     and iPadOS Safari deliberately lies about several of these to look like
     a desktop. Whatever the query says, the FIRST pointerdown carries a
     `pointerType` that is simply true — so the query provides an answer
     before the first interaction, and the event replaces it from then on. */
  const isCoarse = useRef(false);

  useEffect(() => {
    isCoarse.current = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  const notePointerType = useCallback((e: React.PointerEvent) => {
    if (e.pointerType) isCoarse.current = e.pointerType !== "mouse";
  }, []);

  const revealControls = useCallback(() => {
    setTouchRevealed(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setTouchRevealed(false), 4000);
  }, []);

  /* Any interaction with the bar restarts the auto-hide countdown, so the
     controls cannot disappear mid-drag on the timeline. */
  const keepAlive = useCallback(() => {
    if (isCoarse.current) revealControls();
  }, [revealControls]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      setStarted(true);
      /* play() rejects if the gesture is not trusted or the media fails to
         load. Swallowing it silently would leave the UI showing "playing"
         over a stopped video, so the state is only advanced on the real
         `play` event below — this just prevents an unhandled rejection. */
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, []);

  const restart = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    setEnded(false);
    void el.play().catch(() => setPlaying(false));
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  /**
   * Switch rung without losing the viewer's place.
   *
   * Changing `src` resets the element: position goes to 0 and playback stops.
   * So the position and play state are captured here, and restored by the
   * effect below once React has actually swapped the `src` — capturing and
   * restoring in the same callback cannot work, because the new source is
   * not on the element until the next render.
   */
  const pendingRestore = useRef<{ at: number; play: boolean } | null>(null);

  const changeQuality = useCallback(
    (index: number) => {
      const el = videoRef.current;
      setMenuOpen(false);
      if (!el || index === qualityIndex) return;
      pendingRestore.current = { at: el.currentTime, play: !el.paused };
      setQualityIndex(index);
    },
    [qualityIndex],
  );

  useEffect(() => {
    const el = videoRef.current;
    const pending = pendingRestore.current;
    if (!el || !pending) return;
    pendingRestore.current = null;

    /* `loadedmetadata`, not `canplay`: seeking needs the duration and the
       index, and waiting for `canplay` adds a visible stall for no gain. */
    const onReady = () => {
      el.currentTime = pending.at;
      if (pending.play) void el.play().catch(() => setPlaying(false));
    };
    el.addEventListener("loadedmetadata", onReady, { once: true });

    /* LIFTING `preload` HERE IS WHAT MAKES THE SWITCH WORK.
       `preload="none"` is right for a video nobody has asked for, and it is
       what keeps the page cheap for visitors who never press play. But after
       a quality switch the visitor HAS asked: leave it at "none" and the new
       file is never fetched, so `loadedmetadata` never fires, the restore
       never runs, and the player sits at 0:00 and stopped. Measured — that
       was the first version of this. */
    el.preload = "metadata";
    el.load();

    return () => el.removeEventListener("loadedmetadata", onReady);
  }, [qualityIndex]);

  /* Close the quality menu on an outside click or Escape — a menu that can
     only be dismissed by re-clicking its own button is a trap on touch. */
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /**
   * Fullscreen, including the one platform that does not have it.
   *
   * IPHONE SAFARI IMPLEMENTS NO ELEMENT FULLSCREEN AT ALL — no
   * `requestFullscreen`, no `webkitRequestFullscreen` on a div. Calling it
   * on the wrapper is not an error that can be caught; the method is simply
   * absent, so `wrap.requestFullscreen?.()` was a no-op and the button did
   * nothing on every iPhone. The only fullscreen iOS offers is on the video
   * element itself, via the non-standard `webkitEnterFullscreen`, which
   * hands playback to Apple's own player.
   *
   * That is a worse experience than our own chrome, so it is a FALLBACK and
   * not the first choice: standard fullscreen on the wrapper keeps our
   * controls; only where that does not exist do we hand over to iOS.
   */
  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    const el = videoRef.current;
    if (!wrap) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }

    type WebkitVideo = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };
    type WebkitEl = HTMLElement & { webkitRequestFullscreen?: () => void };

    const w = wrap as WebkitEl;
    if (typeof wrap.requestFullscreen === "function") {
      void wrap.requestFullscreen().catch(() => {});
    } else if (typeof w.webkitRequestFullscreen === "function") {
      w.webkitRequestFullscreen();
    } else {
      const vid = el as WebkitVideo | null;
      vid?.webkitEnterFullscreen?.();
    }
  }, []);

  /* Fullscreen can also be left with Escape or the browser's own UI, so the
     button's label must follow the DOCUMENT, never our own click. */
  useEffect(() => {
    const onChange = () =>
      setFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Keyboard, but only while the player has focus — binding these to the
     document would steal Space and the arrow keys from the whole page. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = videoRef.current;
    if (!el) return;
    /* The range input owns the arrow keys; intercepting them here would
       double-seek and fight the native slider behaviour. */
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        toggle();
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "ArrowLeft":
        e.preventDefault();
        el.currentTime = Math.max(0, el.currentTime - 5);
        break;
      case "ArrowRight":
        e.preventDefault();
        el.currentTime = Math.min(el.duration || 0, el.currentTime + 5);
        break;
      default:
        break;
    }
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  /* `menuOpen` belongs in here. The quality menu lives INSIDE the control
     bar, so without it the bar could fade out from under its own open menu —
     which on a touch device is not an edge case but the normal path: there
     is no hover, so `pointerInside` is false the moment the finger lifts off
     the gear, and the menu the visitor just opened would vanish.

     `touchRevealed` is the touch equivalent of hover — see `onVideoClick`. */
  const controlsVisible =
    !playing || pointerInside || focusInside || ended || menuOpen || touchRevealed;

  /* 44px on touch — the fingertip minimum — and 40px from `sm` up, nudged
     from 36 at the client's request so the row reads as a control surface
     rather than as small print along the bottom edge. */
  const iconBtn =
    "grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-colors " +
    "duration-200 hover:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-accent-bright/70 sm:h-10 sm:w-10";
  const iconSize = "h-[18px] w-[18px]";

  return (
    /* SEATED IN THE PAGE, NOT DROPPED ON IT.
       A hard-edged rectangle over a flat ground reads as a foreign object —
       an embed — which is exactly what the client saw. Four things fix that,
       and they work together:

       · a deep, very soft drop shadow, so the frame sits ON the page and
         casts onto it rather than floating in front of it
       · a GOLD glow in the same shadow stack, at two radii: a tight one that
         hugs the edge and a wide one that spills onto the ground
       · a 1px gold-tinted border and a warm inner hairline, so the edge is a
         deliberate frame rather than where the picture happens to stop

       GOLD, BY INSTRUCTION — it was the accent blue. Gold is the palette's
       warm counterpoint and is otherwise spent only on the rating stars and
       the headline accent, so a gold-lit frame reads as the page's own
       highlight rather than as more of the blue everything else already is.

       The shadow is on this wrapper while `overflow-hidden` clips the video
       to the radius — the two cannot be the same element, since a clipping
       box also clips its own shadow. */
    <div
      ref={wrapRef}
      className={`le-video-frame group relative overflow-hidden rounded-2xl border border-gold-vivid/15 bg-black ring-1 ring-inset ring-white/[0.05] ${className}`}
      style={{
        /* DIALLED BACK at the client's request — the gold was overpowering
           the picture rather than seating it. Roughly halved: the tight rim
           0.45 -> 0.20, the wide spill 0.60 -> 0.28, and the gold hairline
           dropped entirely (the border carries that job at /15). The neutral
           black shadows are untouched: they are what actually creates the
           depth, and cutting them with the gold would have flattened the
           frame back onto the page. */
        boxShadow:
          "0 2px 6px -2px rgb(0 0 0 / 0.6), " +
          "0 24px 48px -18px rgb(0 0 0 / 0.85), " +
          "0 10px 36px -14px rgb(var(--le-gold-rgb) / 0.20), " +
          "0 44px 110px -46px rgb(var(--le-gold-rgb) / 0.28)",
      }}
      onPointerDown={notePointerType}
      /* HOVER, AND ONLY HOVER. A touch tap also fires pointerenter, which
         left `pointerInside` true for the length of the tap and made the
         touch reveal fight the hover path. Restricting both to a mouse means
         the coarse-pointer branch owns visibility outright on a phone. */
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPointerInside(true);
      }}
      onPointerLeave={() => setPointerInside(false)}
      onFocusCapture={() => setFocusInside(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocusInside(false);
      }}
    >
      {/* CAPTIONS ARE NOT SHIPPED YET, and the rule below is disabled
          knowingly rather than to quiet a warning. A `<track>` pointing at an
          empty or machine-guessed VTT would be worse than none: it advertises
          captions to a deaf visitor and then gives them nothing. The honest
          state is "missing, and known". To fix properly: put a real
          `leads-engine.de.vtt` beside the MP4, add a `<track kind="captions">`
          child here, and delete this comment with the disable. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="block aspect-video w-full bg-black object-contain"
        src={qualities[qualityIndex]?.src ?? qualities[0].src}
        poster={poster}
        preload="none"
        playsInline
        /* Focusable and key-handling ON THE VIDEO, not on the wrapper div.
           A plain div carrying `onKeyDown` is an interactive control with no
           role and no tab stop — a keyboard user could never reach the
           shortcuts. The video is the natural target: tab to the picture,
           then Space / M / F / arrows work. */
        tabIndex={0}
        aria-label={v.title}
        onKeyDown={onKeyDown}
        onPointerDown={notePointerType}
        /* Mouse: tap the picture to play/pause, as expected on desktop.
           Touch: tap reveals (or dismisses) the controls instead — see the
           note on `touchRevealed`. Play/pause stays on its own button, which
           is where a thumb goes anyway. */
        onClick={() => {
          if (!isCoarse.current) {
            toggle();
            return;
          }
          if (touchRevealed) setTouchRevealed(false);
          else revealControls();
        }}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      >
        {v.unsupported}
      </video>

      {/* Centre play / replay. Only before the first play and after the end —
          during playback the bar is the control surface and a target this
          large over the picture would be in the way. */}
      {(!started || ended) && (
        <button
          type="button"
          onPointerDown={notePointerType}
          onClick={() => {
            if (ended) restart();
            else toggle();
            /* Start the auto-hide countdown from the very first play, so the
               bar is up for the first seconds of the video on a phone and
               the viewer can see there IS a timeline before it fades. */
            if (isCoarse.current) revealControls();
          }}
          aria-label={ended ? v.replay : v.play}
          className="absolute inset-0 grid place-items-center bg-black/25 transition-colors duration-300 hover:bg-black/15 focus-visible:outline-none"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-accent-bright/40 bg-bg/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
            {ended ? (
              <RotateCcw className="h-6 w-6 text-ink sm:h-7 sm:w-7" />
            ) : (
              /* Nudged right by a hair: a triangle's optical centre sits left
                 of its bounding box, so a centred play glyph reads off-centre
                 inside a circle. */
              <Play className="ml-0.5 h-6 w-6 fill-ink text-ink sm:h-7 sm:w-7" />
            )}
          </span>
        </button>
      )}

      {/* Control bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* A scrim, so white controls stay legible over a bright frame. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              "linear-gradient(to top, rgb(var(--le-bg-rgb) / 0.92), rgb(var(--le-bg-rgb) / 0.55) 45%, transparent)",
          }}
        />

        {/* `-mt-1` pulls the button row up under the timeline: the range
            input carries 16px of its own height around a 3px track for a
            comfortable hit area, and that padding read as a gap between the
            bar and the buttons. Tightened at the client's request without
            shrinking the target. */}
        {/* THE CONTAINER STAYS TRANSPARENT TO POINTERS, ALWAYS.
            It used to take `pointer-events-auto` as a whole whenever the
            controls were visible — and it is a padded box: `pt-8` alone is
            32px of empty, invisible, but fully interactive area sitting on
            top of the picture. MEASURED on a 390px viewport: the video is
            196px tall and this box is ~122px of it, so roughly 60% of the
            frame was a dead zone that ate every tap aimed at the video. On a
            phone that is the whole interaction — tap the picture to bring the
            controls back — so it silently did nothing.

            `pointer-events-auto` now lives on the two REAL controls below,
            which is the only surface that should ever claim a touch. */}
        <div
          className="pointer-events-none relative flex flex-col px-3 pb-3 pt-6 sm:px-4 sm:pb-3.5 sm:pt-8"
          onPointerDown={(e) => {
            notePointerType(e);
            keepAlive();
          }}
          onPointerMove={keepAlive}
        >
          <input
            id={`${uid}-seek`}
            type="range"
            className={`le-video-range w-full ${
              controlsVisible ? "pointer-events-auto" : "pointer-events-none"
            }`}
            min={0}
            max={duration || 0}
            step="any"
            value={current}
            aria-label={v.seek}
            /* A slider announced as "43 of 106" means nothing; these make a
               screen reader read real timecodes. */
            aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
            onChange={(e) => {
              const el = videoRef.current;
              const next = Number(e.target.value);
              setCurrent(next);
              if (el) el.currentTime = next;
              /* Restart the auto-hide countdown on every scrub tick, or the
                 bar can vanish under the finger mid-drag. */
              keepAlive();
            }}
            onPointerDown={(e) => {
              notePointerType(e);
              keepAlive();
            }}
            onPointerUp={keepAlive}
            style={{ ["--le-progress" as string]: `${pct}%` }}
          />

          <div
            className={`-mt-1 flex items-center gap-0.5 sm:gap-1 ${
              controlsVisible ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={ended ? restart : toggle}
              aria-label={ended ? v.replay : playing ? v.pause : v.play}
              className={iconBtn}
            >
              {ended ? (
                <RotateCcw className={iconSize} />
              ) : playing ? (
                <Pause className={`${iconSize} fill-current`} />
              ) : (
                <Play className={`ml-0.5 ${iconSize} fill-current`} />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? v.unmute : v.mute}
              className={iconBtn}
            >
              {muted ? (
                <VolumeX className={iconSize} />
              ) : (
                <Volume2 className={iconSize} />
              )}
            </button>

            <p className="le-mono ml-1.5 select-none text-[12.5px] leading-none text-ink-2 sm:text-[13px]">
              {formatTime(current)}
              <span className="mx-1 text-ink-3">/</span>
              {formatTime(duration)}
            </p>

            {/* ---- quality ---- */}
            <div ref={menuRef} className="relative ml-auto">
              {menuOpen && (
                <div
                  role="menu"
                  aria-label={v.quality}
                  className="absolute bottom-[calc(100%+8px)] right-0 min-w-[7.5rem] overflow-hidden rounded-xl border border-line bg-bg/95 py-1 shadow-2xl backdrop-blur-md"
                >
                  {/* HIGHEST AT THE TOP, BY INSTRUCTION — the list ascends
                      reading upward: 480p at the bottom, then 720p, then
                      1080p. `qualities` stays in natural ascending order for
                      everything else (the `defaultQuality` index, the file
                      list in VideoSection); only the render is reversed, so
                      nothing else has to think backwards. */}
                  {qualities
                    .map((q, i) => ({ q, i }))
                    .reverse()
                    .map(({ q, i }) => {
                      const active = i === qualityIndex;
                      return (
                        <button
                          key={q.label}
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => changeQuality(i)}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors duration-150 hover:bg-ink/10 ${
                            active ? "text-ink" : "text-ink-2"
                          }`}
                        >
                          <Check
                            className={`h-3.5 w-3.5 shrink-0 text-gold-vivid ${
                              active ? "opacity-100" : "opacity-0"
                            }`}
                            aria-hidden="true"
                          />
                          {q.label}
                        </button>
                      );
                    })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={v.quality}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`${iconBtn} ${menuOpen ? "bg-ink/10" : ""}`}
              >
                <Settings className={iconSize} />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={full ? v.exitFullscreen : v.fullscreen}
              className={iconBtn}
            >
              {full ? (
                <Minimize className={iconSize} />
              ) : (
                <Maximize className={iconSize} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
