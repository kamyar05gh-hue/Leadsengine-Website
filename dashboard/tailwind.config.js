/** @type {import('tailwindcss').Config} */
export default {
  /* JIT SCANS ONLY WHAT IS LISTED HERE. Every class in this app is written
     literally in a .tsx file under src/ — nothing is assembled from string
     fragments at runtime, because a class built as `bg-${x}` is invisible to
     this scan and gets purged with no error. */
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    /* Deliberately empty. The design system lives in src/index.css as CSS
       custom properties and scoped `.app-scope` rules; the components use
       arbitrary values (`text-[#8A8A93]`, `rounded-[14px]`) so that the hex
       in the code is the hex in the spec, with no indirection to drift. */
    extend: {},
  },
  plugins: [],
};
