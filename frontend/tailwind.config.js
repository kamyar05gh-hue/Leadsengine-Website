/** @type {import('tailwindcss').Config} */

/*
 * Colours are composed from the raw "R G B" channel triplets declared in
 * src/index.css. The `<alpha-value>` placeholder is what lets opacity
 * modifiers work — `bg-accent/15`, `border-accent/40`, `text-ink-2/70`.
 * Without it Tailwind cannot parse the value and drops the utility with no
 * error, so the class silently renders nothing.
 *
 * `line` / `line-strong` are deliberately literal rgba: they are already
 * translucent, and channel form would make plain `border-line` solid white.
 */
const channel = (name) => `rgb(var(--le-${name}-rgb) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: channel("bg"),
        "bg-alt": channel("bg-alt"),
        surface: channel("surface"),
        raised: channel("raised"),

        ink: channel("ink"),
        "ink-2": channel("ink-2"),
        "ink-3": channel("ink-3"),

        line: "var(--le-line)",
        "line-strong": "var(--le-line-strong)",

        accent: channel("accent"),
        "accent-hover": channel("accent-hover"),
        "accent-bright": channel("accent-bright"),

        hi: channel("hi"),
        "hi-strong": channel("hi-strong"),

        cta: channel("cta"),
        "cta-hover": channel("cta-hover"),
        gold: channel("gold"),
        "gold-bright": channel("gold-bright"),
        "gold-vivid": channel("gold-vivid"),
        "gold-deep": channel("gold-deep"),

        success: channel("success"),
        "success-deep": channel("success"),
        warning: channel("warning"),
        danger: channel("danger"),
        "danger-deep": channel("danger-deep"),
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        container: "1240px",
      },
    },
  },
  plugins: [],
};
