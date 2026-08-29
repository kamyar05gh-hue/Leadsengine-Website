# -*- coding: utf-8 -*-
import io, numpy as np
from numpy.fft import rfft, irfft

VW_PX = 1440.0 / 100.0
SIGMA = 80.0
VAR   = "var(--le-accent-bright-rgb)"

def profile(width_vw, alpha, stop_frac=0.65):
    W = width_vw * VW_PX; R = W / 2.0; zero_at = stop_frac * R
    pad = int(4 * SIGMA) + 40; half = int(R + pad)
    y, x = np.ogrid[-half:half + 1, -half:half + 1]
    r = np.hypot(x, y)
    a = alpha * np.clip(1.0 - r / zero_at, 0.0, None); a[r > R] = 0.0
    k1 = np.exp(-0.5 * (np.arange(-half, half + 1) / SIGMA) ** 2); k1 /= k1.sum()
    L = a.shape[-1]
    K = rfft(np.roll(k1, -half), n=L)
    def bl(arr, axis):
        arr = np.moveaxis(arr, axis, -1)
        out = irfft(rfft(arr, n=L) * K, n=L)
        return np.moveaxis(out, -1, axis)
    b = bl(bl(a, 0), 1)
    radial = b[half, half:]
    cut = np.argmax(radial < 0.0015)
    R_new = float(cut) if cut else float(len(radial) - 1)
    return radial, R_new, R

PICKS = [0, 6, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100]

def gradient(width_vw, alpha):
    radial, R_new, R_old = profile(width_vw, alpha)
    grow = 2 * R_new - 2 * R_old
    lines = []
    for p in PICKS:
        idx = min(int(R_new * p / 100.0), len(radial) - 1)
        v = float(radial[idx])
        if p == 100 or v < 0.0016:
            lines.append("            transparent %d%%" % p); break
        lines.append("            rgb(%s / %.3f) %d%%" % (VAR, v, p))
    return "        background: radial-gradient(\n            circle,\n" + ",\n".join(lines) + "\n        );", grow

g1, grow1 = gradient(46.0, 0.45)
g2, grow2 = gradient(34.0, 0.30)
g3, grow3 = gradient(40.0, 0.22)
h1, h2, h3 = grow1 / 2.0, grow2 / 2.0, grow3 / 2.0

BLOCK = '''    /* ------------------------------------------------------------------
       THE ORIGINAL LOOK, WITHOUT THE FILTER THAT COST 33 FRAMES A SECOND.

       These were `radial-gradient(circle, rgb(C / A), transparent 65%%)` under
       `filter: blur(80px)`. The blur was the whole cost of the hero — six
       full filter passes on 490-660px layers. Measured at 1440px, sitting
       still, nothing else touched:

           as shipped ................................ 27 fps
           aurora animation paused, still blurred .... 28 fps
           aurora removed entirely ................... 60 fps

       Pausing the drift changed nothing, so the cost was never the movement.
       It was the existence of the blurred layers.

       A FIRST ATTEMPT AT REPLACING IT BY EYE WAS VISIBLY WRONG, and this is
       why. CSS `blur(<len>)` is an feGaussianBlur with stdDeviation = the
       length, so sigma is 80px, not 40 -- enormous next to a blob whose ink
       stops at ~215px. Spreading that much ink that far drops the centre by
       roughly half:

           blob 1: peak 0.45 -> 0.242   (-46%%)
           blob 2: peak 0.30 -> 0.120   (-60%%)
           blob 3: peak 0.22 -> 0.104   (-53%%)

       A hand-picked gradient kept the original peak, so the glow came out
       about twice as bright and far too tight. The stops below are not
       guessed: the gradient was convolved with a sigma-80 Gaussian
       numerically and the result sampled at fourteen radii, so this IS the
       blurred image, drawn directly instead of computed every frame.

       Each blob is grown by the blur's spread and re-centred on the same
       point, which is what the `calc()` offsets are doing -- the extra is in
       px because the blur radius was in px while the size is in vw.

       IF YOU CHANGE A COLOUR OR SIZE HERE, re-run the convolution rather
       than editing a stop by hand. The script is in the commit that added
       this comment.
       ------------------------------------------------------------------ */
    .le-aurora span {
        position: absolute;
        display: block;
        border-radius: 50%%;
        opacity: 0.85;
        will-change: transform;
    }
    .le-aurora span:nth-child(1) {
        width: calc(46vw + %(g1)dpx);
        height: calc(46vw + %(g1)dpx);
        top: calc(-14vw - %(h1)dpx);
        left: calc(-6vw - %(h1)dpx);
%(grad1)s
        animation: le-drift-a 24s var(--le-ease) infinite alternate;
    }
    .le-aurora span:nth-child(2) {
        width: calc(34vw + %(g2)dpx);
        height: calc(34vw + %(g2)dpx);
        top: calc(6vw - %(h2)dpx);
        right: calc(-8vw - %(h2)dpx);
%(grad2)s
        animation: le-drift-b 30s var(--le-ease) infinite alternate;
    }
    .le-aurora span:nth-child(3) {
        width: calc(40vw + %(g3)dpx);
        height: calc(40vw + %(g3)dpx);
        bottom: calc(-18vw - %(h3)dpx);
        left: calc(28vw - %(h3)dpx);
%(grad3)s
        animation: le-drift-c 34s var(--le-ease) infinite alternate;
    }''' % {
    'g1': round(grow1), 'g2': round(grow2), 'g3': round(grow3),
    'h1': round(h1), 'h2': round(h2), 'h3': round(h3),
    'grad1': g1, 'grad2': g2, 'grad3': g3,
}

P = 'frontend/src/index.css'
s = io.open(P, encoding='utf-8').read()
start = s.index('    /* ------------------------------------------------------------------\n       NO `filter: blur()` HERE')
end   = s.index('\n\n    .le-noise::after {')
s = s[:start] + BLOCK + s[end:]
io.open(P, 'w', encoding='utf-8', newline='').write(s)
print(BLOCK)
print('\nok ' + P)
