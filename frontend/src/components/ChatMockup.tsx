import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowUp, ChevronDown, Copy, Plus, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/*
 * A mock-up of the moment the whole product exists for: a buyer asks an AI
 * assistant, and the answer names three providers. Everyone else is gone.
 *
 * The presentation deliberately mirrors the interface people actually know:
 * a thin top bar with the assistant's mark, the question in a grey bubble on
 * the right, the answer running full width on the left with no bubble at all,
 * and an inert composer pinned to the bottom.
 *
 * The platform marks below are inline single-colour paths, used nominatively:
 * they name the assistants Leads Engine analyses. Several — the ChatGPT knot
 * in particular — reproduce the vendor's actual mark rather than approximating
 * it, at the client's explicit request. They are never shown as a badge, a
 * partnership or an endorsement. See memory/DECISIONS.md for the reasoning and
 * the one-object change that swaps them for generic forms if legal objects.
 *
 * Every glyph of copy comes from the dictionary.
 *
 * The sequence types, thinks, then streams the answer word by word. All of
 * the text is in the DOM from the first frame at `opacity: 0` and revealed by
 * index, so nothing ever reflows while it plays. It replays whenever the
 * panel re-enters the viewport — or on demand, from the replay control — and
 * renders finished, with no timers at all, under reduced motion.
 */

/* ------------------------------------------------------------------ */
/* Platform marks                                                      */
/* ------------------------------------------------------------------ */

/*
 * These are the vendors' ACTUAL marks, not approximations.
 *
 * The Perplexity and Grok glyphs used to be shapes I drew by hand, and the
 * client called that out: they looked like generic icons rather than the
 * brands. Every path below is now the real logo, taken from the canonical
 * icon sets (simple-icons for OpenAI / Gemini / Claude / Perplexity, the
 * LobeHub AI set for Grok, which simple-icons does not carry).
 *
 * Used nominatively — they name the assistants Leads Engine analyses, are
 * always monochrome, and are never presented as a badge, a partnership or an
 * endorsement. See memory/DECISIONS.md.
 */

const OPENAI_MARK =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const GEMINI_MARK =
  "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81";

const CLAUDE_MARK =
  "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";

const PERPLEXITY_MARK =
  "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z";

const GROK_MARK =
  "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815";

/** The five marks, keyed by the platform names the dictionary uses. */
const MARKS: Record<string, ReactNode> = {
  ChatGPT: <path fill="currentColor" d={OPENAI_MARK} />,
  "Google AI": <path fill="currentColor" d={GEMINI_MARK} />,
  Claude: <path fill="currentColor" d={CLAUDE_MARK} />,
  Perplexity: <path fill="currentColor" d={PERPLEXITY_MARK} />,
  Grok: <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={GROK_MARK} />,
};

/**
 * One platform mark, monochrome, inheriting `currentColor`. Decorative by
 * default: every place that uses it prints the platform's name in text, so
 * the glyph itself carries no information a screen reader needs.
 */
export function PlatformMark({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const mark = MARKS[name];
  if (!mark) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {mark}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The conversation                                                    */
/* ------------------------------------------------------------------ */

type Token = { w: string; i: number };
type Phase = "idle" | "typing" | "thinking" | "answering" | "done";

const TYPE_MS = 26;
const WORD_MS = 52;
const AFTER_TYPING_MS = 420;
const THINKING_MS = 1100;


function splitWords(text: string, start: number): { words: Token[]; next: number } {
  const parts = text.split(/\s+/).filter(Boolean);
  return {
    words: parts.map((w, k) => ({ w, i: start + k })),
    next: start + parts.length,
  };
}

/** Pre-rendered words, faded in by index — the layout is fixed from frame one. */
function Words({ tokens, revealed }: { tokens: Token[]; revealed: number }) {
  return (
    <>
      {tokens.map(({ w, i }) => (
        <span
          key={i}
          className="transition-opacity duration-300 ease-out"
          style={{ opacity: i < revealed ? 1 : 0 }}
        >
          {w}{" "}
        </span>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Per-platform chrome                                                 */
/* ------------------------------------------------------------------ */

/**
 * Each assistant gets its own surface, not just its own answer.
 *
 * These are EVOCATIONS, not clones: the accent, the ground, the shape of the
 * user bubble and the platform-specific affordance (Perplexity's sources
 * strip, Gemini's drafts control, Grok's model chip) are enough to recognise
 * the product without reproducing anyone's interface pixel for pixel. That
 * line is deliberate — a faithful replica of a competitor's UI on a commercial
 * page is a different legal question from naming it. See memory/DECISIONS.md.
 *
 * `accent` is a raw CSS colour rather than a token because these are other
 * companies' brand colours, not ours; keeping them out of the palette stops
 * them leaking into the rest of the site.
 */
type Chrome = {
  accent: string;
  /** The conversation ground. */
  surface: string;
  /** The header strip, where the product uses a distinct one. */
  head: string;
  /** The user's bubble. */
  bubble: string;
  /** Radius of the user's bubble, in px. */
  bubbleRadius: number;
  /** Hairline colour inside the surface. */
  line: string;
  /** How the product names itself, top left. */
  header: "model" | "wordmark";
  /** Small chip beside the wordmark, e.g. a model name. */
  chip?: string;
  /** Perplexity's Answer / Sources / Steps row. */
  tabs?: readonly string[];
  /** Perplexity's numbered sources strip above the answer. */
  sources?: boolean;
  /** Gemini's drafts control. */
  drafts?: string;
  /** The copy / retry affordances under an answer. */
  actions?: boolean;
  /** Chips the product puts inside its composer. */
  composerChips?: readonly string[];
  /** Foreground of the send button. */
  sendFg: string;
  /** Send button shape — Claude and Perplexity use a square-ish button. */
  sendSquare?: boolean;
  /**
   * THE PLATFORM'S TYPEFACE, or the closest thing we may legally ship.
   *
   * Colour and chrome alone were not enough to tell the five apart at a
   * glance — every one of them was rendering in Inter, which is the site's
   * font, not theirs. Type is most of what makes a product's interface
   * recognisable, so each tab now sets its own.
   *
   * THESE ARE SUBSTITUTES, AND DELIBERATELY SO. The real faces — Söhne and
   * OpenAI Sans, Styrene and Tiempos, Google Sans, FK Grotesk Neue, Chirp —
   * are all licensed and none of them may be redistributed from this domain.
   * Each stack below is the nearest widely-available relative of the real
   * thing, chosen for family resemblance rather than for novelty:
   *
   *   ChatGPT     Söhne is Helvetica-derived, so Helvetica/Arial.
   *   Claude      Tiempos is a Times-derived serif, and the serif IS what
   *               makes Claude look like Claude. Georgia is its closest
   *               universally-installed relative.
   *   Google AI   Google Sans is Roboto's geometric cousin; Roboto ships on
   *               every Android device and falls back to Segoe UI elsewhere.
   *   Perplexity  FK Grotesk Neue is a quirky neo-grotesque; Space Grotesk
   *               is the closest free equivalent and is the ONE webfont this
   *               adds, at a single weight.
   *   Grok        xAI's identity is terminal-technical, and a mono is both
   *               true to that and the clearest possible contrast with the
   *               other four.
   *
   * Everything inside the surface inherits this, EXCEPT the elements that
   * carry `le-mono` — timecodes and counters, which must stay tabular.
   */
  font: string;
};

const CHROME: Record<string, Chrome> = {
  ChatGPT: {
    font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    accent: "#10a37f",
    surface: "rgb(33 33 33)",
    head: "rgb(33 33 33)",
    bubble: "rgb(48 48 48)",
    bubbleRadius: 20,
    line: "rgba(255,255,255,0.09)",
    header: "model",
    chip: "5",
    actions: true,
    sendFg: "#0d0d0d",
  },
  "Google AI": {
    font: 'Roboto, "Segoe UI", system-ui, sans-serif',
    accent: "#4285f4",
    surface: "rgb(27 28 31)",
    head: "rgb(27 28 31)",
    bubble: "rgb(41 43 48)",
    bubbleRadius: 24,
    line: "rgba(255,255,255,0.09)",
    header: "wordmark",
    chip: "2.5 Flash",
    drafts: "Show drafts",
    actions: true,
    composerChips: ["Deep Research", "Canvas"],
    sendFg: "#ffffff",
  },
  Claude: {
    font: 'Georgia, "Times New Roman", Times, serif',
    accent: "#c96442",
    surface: "rgb(38 35 32)",
    head: "rgb(30 28 26)",
    bubble: "rgb(52 48 44)",
    bubbleRadius: 12,
    line: "rgba(255,255,255,0.08)",
    header: "wordmark",
    chip: "Sonnet 4.5",
    actions: true,
    sendFg: "#ffffff",
    sendSquare: true,
  },
  Perplexity: {
    font: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
    accent: "#20a2b4",
    surface: "rgb(24 30 32)",
    head: "rgb(20 26 28)",
    bubble: "rgb(35 43 45)",
    bubbleRadius: 10,
    line: "rgba(255,255,255,0.08)",
    header: "wordmark",
    tabs: ["Answer", "Sources", "Steps"],
    sources: true,
    sendFg: "#ffffff",
    sendSquare: true,
  },
  Grok: {
    font: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace',
    accent: "#ffffff",
    surface: "rgb(0 0 0)",
    head: "rgb(0 0 0)",
    bubble: "rgb(28 28 30)",
    bubbleRadius: 18,
    line: "rgba(255,255,255,0.12)",
    header: "model",
    chip: "4",
    actions: true,
    composerChips: ["DeepSearch", "Think"],
    sendFg: "#000000",
  },
};

const FALLBACK_CHROME: Chrome = {
  /* The site's own face, for any engine the dictionary names that has no
     chrome entry — it should look like us, not like a guess at them. */
  font: 'Inter, ui-sans-serif, system-ui, sans-serif',
  accent: "rgb(62 151 240)",
  surface: "rgb(17 20 27)",
  head: "rgb(17 20 27)",
  bubble: "rgb(24 28 37)",
  bubbleRadius: 18,
  line: "rgba(255,255,255,0.1)",
  header: "wordmark",
  sendFg: "#ffffff",
};

/** The assistant avatar — the mark of whichever engine the dictionary names. */
function AssistantMark({ engine, className = "" }: { engine: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg ${className}`}
    >
      <PlatformMark name={engine} className="h-[58%] w-[58%] text-ink-2" />
    </span>
  );
}

export default function ChatMockup() {
  const { t } = useLang();
  const chat = t.problem.chat;
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35, once: false });

  /* Bumped by the replay control; the sequence effect keys off it. */
  const [run, setRun] = useState(0);

  /* Which platform is answering. Every mark in the top bar switches to it —
     the question never changes, only who answers it, which is the entire
     argument: five engines, five different shortlists. */
  const [engineIdx, setEngineIdx] = useState(0);
  const engines = chat.engines;
  const active = engines[engineIdx] ?? engines[0]!;

  /* Set when the visitor picks a platform, so the sequence skips straight to
     thinking rather than re-typing a question that is already on screen. */
  const skipTyping = useRef(false);

  const pickEngine = (i: number) => {
    if (i === engineIdx) return;
    skipTyping.current = true;
    setEngineIdx(i);
  };

  const chars = useMemo(() => Array.from(chat.prompt), [chat.prompt]);

  const seq = useMemo(() => {
    let n = 0;
    const intro = splitWords(active.intro, n);
    n = intro.next;
    const answers = active.answers.map((a) => {
      const name = splitWords(a.name, n);
      n = name.next;
      const note = splitWords(a.note, n);
      n = note.next;
      return { name: name.words, note: note.words, at: name.words[0]?.i ?? 0 };
    });
    const outro = splitWords(active.outro, n);
    n = outro.next;
    return { intro: intro.words, answers, outro: outro.words, total: n };
  }, [active]);

  const [typed, setTyped] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    // Reduced motion: the finished state, immediately, and no timers start.
    if (reduced) {
      setTyped(chars.length);
      setRevealed(seq.total);
      setPhase("done");
      return;
    }

    if (!inView) {
      setTyped(0);
      setRevealed(0);
      setPhase("idle");
      return;
    }

    /* Read and clear in the same breath: the flag belongs to this run only. */
    const skip = skipTyping.current;
    skipTyping.current = false;

    const timeouts: number[] = [];
    let typeTimer = 0;
    let wordTimer = 0;

    /* Shared tail: think, then stream the answer word by word. */
    const answerAfterThinking = () => {
      setPhase("thinking");
      timeouts.push(
        window.setTimeout(() => {
          setPhase("answering");
          let w = 0;
          wordTimer = window.setInterval(() => {
            w += 1;
            setRevealed(w);
            if (w < seq.total) return;
            window.clearInterval(wordTimer);
            wordTimer = 0;
            setPhase("done");
          }, WORD_MS);
        }, THINKING_MS),
      );
    };

    setRevealed(0);

    if (skip) {
      /* Platform switch: the question stays typed, only the answer is new. */
      setTyped(chars.length);
      answerAfterThinking();
    } else {
      setTyped(0);
      setPhase("typing");
      let c = 0;
      typeTimer = window.setInterval(() => {
        c += 1;
        setTyped(c);
        if (c < chars.length) return;
        window.clearInterval(typeTimer);
        typeTimer = 0;
        timeouts.push(window.setTimeout(answerAfterThinking, AFTER_TYPING_MS));
      }, TYPE_MS);
    }

    return () => {
      if (typeTimer) window.clearInterval(typeTimer);
      if (wordTimer) window.clearInterval(wordTimer);
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [inView, reduced, chars.length, seq.total, run, engineIdx]);

  const done = phase === "done";
  /* The control asks the question again, so the question is its name. */
  const replayLabel = chat.replay;
  const chrome = CHROME[active.name] ?? FALLBACK_CHROME;


  /* The small action row under an answer — copy / retry / rate. Every one of
     these products has one; only the glyph set differs, so it is drawn once. */
  const Actions = () => (
    <div aria-hidden="true" className="mt-3 flex items-center gap-3.5 text-ink-3">
      <Copy size={13} strokeWidth={1.8} />
      <RotateCcw size={13} strokeWidth={1.8} />
      <ThumbsUp size={13} strokeWidth={1.8} />
      <ThumbsDown size={13} strokeWidth={1.8} />
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <div role="img" aria-label={`${active.name}: ${chat.prompt} ${active.intro}`}>
        {/* ---------------------------------------------------------- */}
        {/* The conversation surface                                    */}
        {/* ---------------------------------------------------------- */}
        {/* A FIXED-HEIGHT column. Each platform carries different furniture —
            Perplexity has tabs, a sources strip and follow-ups; Gemini has a
            drafts control; the rest have an action row — so the natural height
            differed per tab and the panel jumped every time you switched. The
            message area is `flex-1` inside a fixed min-height, which absorbs
            the difference and keeps the frame identical for all five. */}
        <div
          className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-line transition-colors duration-500 sm:min-h-[564px]"
          /* `fontFamily` on the surface, so every label, bubble and chip
             inside inherits the platform's face in one place rather than
             each needing to remember. `.le-mono` still wins where it is set,
             which is what keeps counters tabular. */
          style={{ backgroundColor: chrome.surface, fontFamily: chrome.font }}
        >
          {/* Header. The `model` products put a model selector top-left with a
              chevron; the `wordmark` products put their name and mark. Both
              then carry the platform switcher on the right. */}
          <div
            className="flex shrink-0 items-center gap-2 py-2.5 pl-3.5 pr-11 sm:pl-4"
            style={{ backgroundColor: chrome.head, borderBottom: `1px solid ${chrome.line}` }}
          >
            {chrome.header === "model" ? (
              <span className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold tracking-tight text-ink">
                  {active.name}
                </span>
                {chrome.chip && (
                  <span className="text-[13.5px] font-normal text-ink-3">{chrome.chip}</span>
                )}
                <ChevronDown size={13} strokeWidth={2} className="text-ink-3" aria-hidden="true" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlatformMark name={active.name} className="h-[15px] w-[15px] shrink-0 text-ink" />
                <span className="text-[13.5px] font-semibold tracking-tight text-ink">
                  {active.name}
                </span>
                {chrome.chip && (
                  <span
                    className="hidden rounded-md px-1.5 py-0.5 text-[10.5px] leading-none text-ink-3 sm:inline"
                    style={{ border: `1px solid ${chrome.line}` }}
                  >
                    {chrome.chip}
                  </span>
                )}
              </span>
            )}

            <span
              role="group"
              aria-label={chat.switchLabel}
              className="ml-auto flex items-center gap-0.5 pl-2"
            >
              {engines.map((e, i) => {
                const on = i === engineIdx;
                const c = CHROME[e.name] ?? FALLBACK_CHROME;
                return (
                  <button
                    key={e.name}
                    type="button"
                    aria-label={e.name}
                    aria-pressed={on}
                    onClick={() => pickEngine(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border-b-2 outline-none transition-[color,border-color,opacity] duration-200 ease-out"
                    style={{
                      borderColor: on ? c.accent : "transparent",
                      color: on ? c.accent : "rgb(var(--le-ink-2-rgb))",
                      opacity: on ? 1 : 0.75,
                    }}
                  >
                    <PlatformMark name={e.name} className="h-[17px] w-[17px] shrink-0" />
                  </button>
                );
              })}
            </span>
          </div>

          {/* Perplexity's Answer / Sources / Steps row. */}
          {chrome.tabs && (
            <div
              aria-hidden="true"
              className="flex shrink-0 items-center gap-5 px-3.5 pt-3 sm:px-4"
              style={{ borderBottom: `1px solid ${chrome.line}` }}
            >
              {chrome.tabs.map((tab, i) => (
                <span
                  key={tab}
                  className="pb-2 text-[12.5px] font-medium"
                  style={{
                    color: i === 0 ? "rgb(var(--le-ink-rgb))" : "rgb(var(--le-ink-3-rgb))",
                    borderBottom: `2px solid ${i === 0 ? chrome.accent : "transparent"}`,
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>
          )}

          <div className="flex-1 px-3.5 py-4 sm:px-4 sm:py-5">
            {/* The buyer's question — in this platform's own bubble. */}
            <div className="flex justify-end">
              <p
                className="max-w-[90%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[14px] leading-[1.55] text-ink transition-colors duration-500"
                style={{ backgroundColor: chrome.bubble, borderRadius: chrome.bubbleRadius }}
              >
                {chars.map((ch, i) => (
                  <Fragment key={i}>
                    {!reduced && i === typed && phase === "typing" ? (
                      <span className="le-caret" style={{ marginLeft: 0, marginRight: -2 }} />
                    ) : null}
                    <span
                      className="transition-opacity duration-100 ease-out"
                      style={{ opacity: i < typed ? 1 : 0 }}
                    >
                      {ch}
                    </span>
                  </Fragment>
                ))}
              </p>
            </div>

            {/* The answer. */}
            <div className="mt-5 flex gap-2.5 sm:gap-3">
              <AssistantMark engine={active.name} className="mt-0.5 h-[22px] w-[22px]" />

              <div className="min-w-0 flex-1">
                {/* Perplexity leads with its sources, so this surface does too. */}
                {chrome.sources && (
                  <div
                    className="mb-2.5 transition-opacity duration-500"
                    style={{ opacity: phase === "answering" || done ? 1 : 0 }}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                      {chat.sourcesLabel}
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {active.answers.map((a, i) => (
                        <li
                          key={a.name}
                          className="flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] leading-none text-ink-2"
                          style={{
                            border: `1px solid ${chrome.line}`,
                            backgroundColor: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <span className="le-mono" style={{ color: chrome.accent }}>
                            {i + 1}
                          </span>
                          <span className="max-w-[14ch] truncate">{a.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Thinking — the row is always present so nothing shifts. */}
                <div className="flex h-4 items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block h-1 w-1 rounded-full transition-opacity duration-300"
                      style={{
                        backgroundColor: chrome.accent,
                        opacity: phase === "thinking" ? 1 : 0,
                        animation:
                          phase === "thinking"
                            ? `le-pulse-ring 1.25s var(--le-ease) ${i * 160}ms infinite`
                            : undefined,
                      }}
                    />
                  ))}
                </div>

                <p className="text-[14px] leading-[1.7] text-ink-2">
                  <Words tokens={seq.intro} revealed={revealed} />
                </p>

                <ol className="mt-3 space-y-2.5">
                  {seq.answers.map((answer, idx) => {
                    const lead = idx === 0;
                    const shown = revealed > answer.at;
                    return (
                      <li
                        key={answer.at}
                        className={`flex gap-2 transition-opacity duration-500 ease-out ${
                          lead ? "-ml-2.5 rounded-r-lg border-l-2 py-1.5 pl-2.5 pr-2" : ""
                        }`}
                        style={{
                          opacity: shown ? 1 : 0,
                          ...(lead
                            ? {
                                borderLeftColor: chrome.accent,
                                backgroundColor: "rgba(255,255,255,0.045)",
                              }
                            : null),
                        }}
                      >
                        <span
                          className="le-mono w-4 shrink-0 pt-px text-[13.5px] leading-[1.7]"
                          style={{ color: lead ? chrome.accent : "rgb(var(--le-ink-2-rgb))" }}
                        >
                          {idx + 1}.
                        </span>

                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="break-words text-[14px] font-semibold leading-[1.5] text-ink">
                              <Words tokens={answer.name} revealed={revealed} />
                            </span>
                            {chrome.sources && (
                              <span
                                className="le-mono rounded px-1 text-[10px] leading-[1.5]"
                                style={{
                                  color: chrome.accent,
                                  backgroundColor: "rgba(255,255,255,0.07)",
                                  opacity: shown ? 1 : 0,
                                }}
                              >
                                {idx + 1}
                              </span>
                            )}
                            {lead && !chrome.sources ? (
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[1.4] tracking-[0.04em] transition-opacity duration-500"
                                style={{
                                  opacity: shown ? 1 : 0,
                                  border: `1px solid ${chrome.accent}`,
                                  color: chrome.accent,
                                }}
                              >
                                {chat.recommended}
                              </span>
                            ) : null}
                          </span>

                          <span className="mt-0.5 block break-words text-[13px] leading-[1.6] text-ink-2">
                            <Words tokens={answer.note} revealed={revealed} />
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-3 text-[13px] leading-[1.7] text-ink-3">
                  <Words tokens={seq.outro} revealed={revealed} />
                </p>

                {/* Gemini offers drafts; the others offer the action row. */}
                {done && chrome.drafts && (
                  <span
                    aria-hidden="true"
                    className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-ink-3"
                  >
                    {chrome.drafts}
                    <ChevronDown size={13} strokeWidth={2} />
                  </span>
                )}
                {done && chrome.actions && <Actions />}

              </div>
            </div>
          </div>

          {/* Composer — decorative only, never focusable, never announced. */}
          <div
            aria-hidden="true"
            className="shrink-0 px-3.5 py-3 sm:px-4"
            style={{ borderTop: `1px solid ${chrome.line}` }}
          >
            <div
              className="flex items-center gap-2.5 px-3 py-2 transition-colors duration-500"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: `1px solid ${chrome.line}`,
                borderRadius: chrome.sendSquare ? 12 : 9999,
              }}
            >
              <Plus size={15} strokeWidth={2} className="shrink-0 text-ink-3" />
              <span className="block truncate text-[13px] text-ink-3">{active.placeholder}</span>

              {chrome.composerChips && (
                <span className="ml-1 hidden shrink-0 items-center gap-1.5 sm:flex">
                  {chrome.composerChips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full px-2 py-0.5 text-[11px] leading-[1.5] text-ink-3"
                      style={{ border: `1px solid ${chrome.line}` }}
                    >
                      {c}
                    </span>
                  ))}
                </span>
              )}

              <span
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center transition-colors duration-500"
                style={{
                  backgroundColor: chrome.accent,
                  borderRadius: chrome.sendSquare ? 7 : 9999,
                }}
              >
                <ArrowUp size={13} strokeWidth={2.5} style={{ color: chrome.sendFg }} />
              </span>
            </div>
          </div>
        </div>

        {/* One line, directly under the panel. The blurred ghost rows that used
            to sit here were read as empty space and are gone. */}
        <p
          className="mt-3 text-[12px] leading-[1.5] text-ink-2 transition-opacity duration-700"
          style={{ opacity: done ? 1 : 0 }}
        >
          {chat.disclaimer}
        </p>
      </div>

      {/* Replay — sits outside the role="img" subtree so it stays reachable. */}
      {reduced ? null : (
        <button
          type="button"
          aria-label={replayLabel}
          disabled={!done}
          onClick={() => setRun((r) => r + 1)}
          className="group absolute right-3 top-2.5 flex h-6 w-6 items-center justify-center rounded-lg border border-line text-ink-2 transition-[opacity,color,border-color] duration-300 hover:text-ink disabled:pointer-events-none sm:right-3.5"
          style={{ opacity: done ? 1 : 0 }}
        >
          <RotateCcw
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-90"
          />
        </button>
      )}
    </div>
  );
}
