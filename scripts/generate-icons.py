#!/usr/bin/env python3
"""
Rasterise frontend/public/favicon.svg into the PNG/ICO set that search
engines, iOS and Android actually consume.

WHY THIS EXISTS. The site shipped an SVG favicon and nothing else, and
`apple-touch-icon` pointed at that same SVG. Two things break:

  * GOOGLE SEARCH will not show an SVG-only favicon reliably. Its documented
    requirement is a square icon whose side is a multiple of 48px, at a
    stable URL. With no raster icon it falls back to the generic globe — which
    is what the leadsengine.ch result was showing.
  * IOS does not support SVG for `apple-touch-icon` at all. A home-screen
    bookmark rendered a blank tile.

WHY IT IS A SCRIPT AND NOT A BUILD STEP. Rasterising SVG needs a real
renderer (cairosvg / resvg / sharp), none of which is installed here and none
of which is worth adding to the production dependency tree for four files
that change roughly never. So the outputs are generated once and committed,
and this script records exactly how — run it again if favicon.svg changes.

WHY IT PARSES THE PATHS BY HAND. Every path in favicon.svg uses only `M`, `L`
and `Z`, so the whole mark is straight-edged polygons. That is a dozen lines
of parsing against a build dependency; the parser below asserts on any other
command rather than silently dropping it, so a future curve in the logo fails
loudly instead of shipping a mangled icon.

    python scripts/generate-icons.py
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "frontend" / "public" / "favicon.svg"
OUT = ROOT / "frontend" / "public"

# Supersample factor. The mark has long near-diagonal edges; anything less
# than 8x leaves them visibly stepped once downsampled to 48px.
SS = 8

VIEWBOX = 128.0
BG = "#08090C"
FG = "#F4F4F5"
CORNER_R = 26.0

# The <g> transform in favicon.svg: translate(19 25.2) scale(0.90).
G_TRANSLATE = (19.0, 25.2)
G_SCALE = 0.90


def parse_polygon(d: str) -> list[tuple[float, float]]:
    """`d` -> list of points. Only M/L/Z; anything else is a hard error."""
    tokens = re.findall(r"([MLZmlz])|(-?\d*\.?\d+)", d)
    pts: list[tuple[float, float]] = []
    nums: list[float] = []
    cmd = None
    for letter, number in tokens:
        if letter:
            if letter.upper() not in ("M", "L", "Z"):
                raise SystemExit(f"unsupported path command {letter!r} in favicon.svg")
            cmd = letter.upper()
            continue
        nums.append(float(number))
        if cmd in ("M", "L") and len(nums) == 2:
            pts.append((nums[0], nums[1]))
            nums = []
    return pts


def to_canvas(pt: tuple[float, float], size: int) -> tuple[float, float]:
    """Group-local coordinates -> pixel coordinates at `size`."""
    k = size / VIEWBOX
    x = (G_TRANSLATE[0] + pt[0] * G_SCALE) * k
    y = (G_TRANSLATE[1] + pt[1] * G_SCALE) * k
    return (x, y)


def render(size: int) -> Image.Image:
    svg = SVG.read_text(encoding="utf-8")
    paths = re.findall(r'<path[^>]*\bd="([^"]+)"', svg)
    if not paths:
        raise SystemExit("no <path> found in favicon.svg")

    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        [0, 0, big - 1, big - 1], radius=CORNER_R * big / VIEWBOX, fill=BG
    )
    for d in paths:
        poly = [to_canvas(p, big) for p in parse_polygon(d)]
        if len(poly) >= 3:
            draw.polygon(poly, fill=FG)
    return img.resize((size, size), Image.LANCZOS)


def main() -> int:
    if not SVG.exists():
        raise SystemExit(f"missing {SVG}")

    # 48 and its multiples are what Google documents; 180 is Apple's
    # home-screen size; 192/512 are the PWA manifest sizes.
    for size, name in [
        (192, "icon-192.png"),
        (512, "icon-512.png"),
        (180, "apple-touch-icon.png"),
        (96, "favicon-96.png"),
    ]:
        img = render(size)
        img.save(OUT / name, "PNG", optimize=True)
        print(f"  {name:24} {size}x{size}")

    # favicon.ico carries 16/32/48 so browsers pick their own, and 48 is the
    # size Google reads.
    ico = render(256)
    ico.save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  {'favicon.ico':24} 16/32/48")
    return 0


if __name__ == "__main__":
    sys.exit(main())
