# -*- coding: utf-8 -*-
"""
Generate the hero aurora's gradients, and write them into frontend/src/index.css.

    python scripts/aurora-profile.py

WHY THIS EXISTS
---------------
The three glow blobs behind the hero used to be
`radial-gradient(circle, rgb(C / A), transparent 65%)` under
`filter: blur(80px)`. That blur was the single most expensive thing on the
page: measured at 1440px, sitting perfectly still, the hero ran at 27 fps and
went to 60 the moment the aurora was removed. Pausing its drift changed
nothing, so the cost was never the movement -- it was six full filter passes
existing at all.

The fix is to draw the blurred RESULT directly. This script convolves the
source gradient with the real Gaussian and emits the answer as stops.

TWO THINGS THAT WERE GOT WRONG FIRST, both caught by the client:

1. GUESSING THE STOPS BY EYE. CSS `blur(<len>)` is an feGaussianBlur with
   stdDeviation = the length, so sigma is 80px, not 40 -- enormous next to a
   blob whose ink stops at ~215px. Spreading that much ink that far drops the
   centre by about half (0.45 -> 0.242). A hand-picked gradient that kept the
   original peak came out twice as bright and far too tight.

2. TOO FEW STOPS. Fourteen evenly-spaced ones produced visible CIRCLES. CSS
   interpolates linearly between stops, so a sparse set turns a smooth curve
   into a fan of straight segments joined at kinks; each kink is a break in
   the first derivative and the eye amplifies precisely that into a ring
   (Mach banding). Segments were ~26px apart with ~6 levels of brightness
   across each.

So stops are now placed ADAPTIVELY -- wherever the profile has moved 0.6 of
one 8-bit level -- which packs them through the steep middle and spreads them
across the flat centre and the long tail. Below one level, a display cannot
show a step at all, so there is nothing left to band.

DO NOT hand-edit the stops in index.css, and do not tidy them onto a round
grid. Change the constants here and re-run.
"""
import io, os, sys
import numpy as np
from numpy.fft import rfft, irfft

CSS      = os.path.join('frontend', 'src', 'index.css')
VW_PX    = 1440.0 / 100.0     # reference desktop width; blur is px, size is vw
SIGMA    = 80.0               # CSS blur(80px) -> feGaussianBlur stdDeviation 80
VAR      = "var(--le-accent-bright-rgb)"

ELEMENT_OPACITY = 0.85        # `.le-aurora span { opacity }`
PEAK_CHANNEL    = 240.0       # brightest channel of the accent blue
MAX_STEP_LEVELS = 0.6         # below one 8-bit level => no visible banding
TAIL_ALPHA      = 0.0003      # carry the tail to nothing, not to a hard edge

#  name              width_vw  alpha  colour-stop
BLOBS = [(46.0, 0.45), (34.0, 0.30), (40.0, 0.22)]
STOP_FRAC = 0.65

def levels(a):
    return a * ELEMENT_OPACITY * PEAK_CHANNEL

def profile(width_vw, alpha):
    """The source gradient, convolved with a sigma-80 Gaussian."""
    R = width_vw * VW_PX / 2.0
    zero_at = STOP_FRAC * R
    half = int(R + 4 * SIGMA + 40)
    y, x = np.ogrid[-half:half + 1, -half:half + 1]
    r = np.hypot(x, y)

    a = alpha * np.clip(1.0 - r / zero_at, 0.0, None)
    a[r > R] = 0.0                       # border-radius:50% clips the box

    k = np.exp(-0.5 * (np.arange(-half, half + 1) / SIGMA) ** 2)
    k /= k.sum()
    L = a.shape[-1]
    K = rfft(np.roll(k, -half), n=L)
    def blur(arr, axis):
        arr = np.moveaxis(arr, axis, -1)
        out = irfft(rfft(arr, n=L) * K, n=L)
        return np.moveaxis(out, -1, axis)
    b = blur(blur(a, 0), 1)

    radial = b[half, half:]
    cut = np.argmax(radial < TAIL_ALPHA)
    R_new = float(cut) if cut else float(len(radial) - 1)
    return radial, R_new, R

def gradient(width_vw, alpha):
    radial, R_new, R_old = profile(width_vw, alpha)
    lines, last = [], None
    for i in range(int(R_new) + 1):
        v = float(radial[i])
        if last is None or abs(levels(v) - levels(last)) >= MAX_STEP_LEVELS:
            lines.append("            rgb(%s / %.4f) %.2f%%" % (VAR, v, 100.0 * i / R_new))
            last = v
        if v < TAIL_ALPHA:
            break
    lines.append("            transparent 100%")
    css = ("        background: radial-gradient(\n            circle,\n"
           + ",\n".join(lines) + "\n        );")
    return css, 2 * R_new - 2 * R_old, len(lines), float(radial[0])

g, grow, n, peak = [], [], [], []
for w, a in BLOBS:
    c, gr, cnt, pk = gradient(w, a)
    g.append(c); grow.append(gr); n.append(cnt); peak.append(pk)

BLOCK = '''    /* ------------------------------------------------------------------
       THE ORIGINAL GLOW, WITHOUT THE FILTER THAT COST 33 FRAMES A SECOND.

       GENERATED -- do not hand-edit. Run `python scripts/aurora-profile.py`,
       which carries the full reasoning and the measurements.

       These were `radial-gradient(circle, rgb(C / A), transparent 65%%)` under
       `filter: blur(80px)`. Measured at 1440px, sitting still:

           as shipped ................................ 27 fps
           aurora animation paused, still blurred .... 28 fps
           aurora removed entirely ................... 60 fps

       Pausing the drift changed nothing, so the cost was never the movement.
       It was six filter passes existing at all.

       The stops below ARE the blurred image -- the source gradient convolved
       with the real sigma-80 Gaussian -- drawn once instead of recomputed
       every frame. Peak alpha falls by about half in the process
       (%.3f / %.3f / %.3f), because that is what spreading ink that far does.

       They are spaced ADAPTIVELY, at 0.6 of one 8-bit level. An earlier
       version used fourteen even stops and the client saw circles: CSS
       interpolates linearly between stops, so sparse ones are straight
       segments joined at kinks, and the eye turns a derivative break into a
       ring. Below one level there is no step left to see.

       THE GLOW DOES NOT MOVE, at the client's request. It used to drift on
       three `le-drift-*` loops. Those keyframes are deleted rather than
       merely unreferenced, and `will-change: transform` goes with them —
       with nothing to animate it only pinned three extra composited layers
       in memory for no benefit. The reduced-motion and mobile overrides that
       used to switch the drift off are deleted too: there is no longer an
       animation for them to cancel.
       ------------------------------------------------------------------ */
    .le-aurora span {
        position: absolute;
        display: block;
        border-radius: 50%%;
        opacity: 0.85;
    }
    .le-aurora span:nth-child(1) {
        width: calc(46vw + %dpx);
        height: calc(46vw + %dpx);
        top: calc(-14vw - %dpx);
        left: calc(-6vw - %dpx);
%s
    }
    .le-aurora span:nth-child(2) {
        width: calc(34vw + %dpx);
        height: calc(34vw + %dpx);
        top: calc(6vw - %dpx);
        right: calc(-8vw - %dpx);
%s
    }
    .le-aurora span:nth-child(3) {
        width: calc(40vw + %dpx);
        height: calc(40vw + %dpx);
        bottom: calc(-18vw - %dpx);
        left: calc(28vw - %dpx);
%s
    }''' % (
    peak[0], peak[1], peak[2],
    round(grow[0]), round(grow[0]), round(grow[0] / 2), round(grow[0] / 2), g[0],
    round(grow[1]), round(grow[1]), round(grow[1] / 2), round(grow[1] / 2), g[1],
    round(grow[2]), round(grow[2]), round(grow[2] / 2), round(grow[2] / 2), g[2],
)

s = io.open(CSS, encoding='utf-8').read()
anchor = s.index('    .le-aurora span {')
start = s.rindex('    /* ---', 0, anchor)
end = s.index('\n\n    .le-noise::after {')
io.open(CSS, 'w', encoding='utf-8', newline='').write(s[:start] + BLOCK + s[end:])

print('peak alpha after blur : %.4f / %.4f / %.4f' % tuple(peak))
print('stops per blob        : %d / %d / %d' % tuple(n))
print('grown by (px)         : %d / %d / %d' % tuple(round(x) for x in grow))
print('max step              : %.2f of one 8-bit level' % MAX_STEP_LEVELS)
print('wrote', CSS)
