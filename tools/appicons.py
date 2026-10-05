"""App icons for FAIMESS — cut from the brand mark, not hand-drawn.

The tab icon, the iOS touch icon and the Android launcher icons are all
one raster, re-rendered at each size:

    src/assets/brand/faimess-logo.png   ← the mark itself (150×150)
                │
                ▼
    public/favicon-32.png · apple-touch-icon.png · icon-192.png
    public/icon-512.png · icon-maskable-512.png

The artwork is flat: exactly two colours — the field `#8267F0` (the same
hex as `--color-primary`) and the white cat `#F8F8F8` — with anti-aliased
edges. So rather than scaling pixels (which drags the source's resize
ringing and its half-transparent border along), this script decodes the
PNG into a *coverage* field — the green channel is a clean 103→248 ramp
between the two colours — and re-renders that field at every target size
with supersampling. The result is the mark itself: crisp edges, two
colours, no fringes, at any resolution.

    python3 tools/appicons.py        # writes public/*.png

No third-party libraries: the PNG it reads and the PNGs it writes are
handled by `zlib` and `struct` alone, so a bare python3 is enough. Run it
again whenever `src/assets/brand/faimess-logo.png` changes — the file
names are stable, so nothing else in the repo has to move.
"""

import math
import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src/assets/brand/faimess-logo.png"
OUT = ROOT / "public"

# the two colours of the artwork; `--color-primary` in src/index.css is the
# first of them, which is why the tab, the splash and the cards agree
FIELD = (0x82, 0x67, 0xF0)
MARK = (0xF8, 0xF8, 0xF8)
FIELD_G, MARK_G = FIELD[1], MARK[1]


# ------------------------------------------------------------------ #
#  PNG in / PNG out — standard library only
# ------------------------------------------------------------------ #

def decode(path):
    """Read an 8-bit RGBA PNG into `(width, height, rows)` of RGBA bytes."""
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path}: not a PNG")
    pos, idat, head = 8, b"", None
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        tag = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + length]
        if tag == b"IHDR":
            head = struct.unpack(">IIBBBBB", body)
        elif tag == b"IDAT":
            idat += body
        pos += 12 + length
    width, height, depth, colour, _, _, interlace = head
    if (depth, colour, interlace) != (8, 6, 0):
        raise SystemExit(f"{path}: expected an 8-bit non-interlaced RGBA PNG")

    raw = zlib.decompress(idat)
    stride = width * 4
    rows, prev, at = [], bytearray(stride), 0
    for _ in range(height):
        kind = raw[at]
        at += 1
        line = bytearray(raw[at:at + stride])
        at += stride
        if kind == 1:
            for i in range(4, stride):
                line[i] = (line[i] + line[i - 4]) & 255
        elif kind == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif kind == 3:
            for i in range(stride):
                a = line[i - 4] if i >= 4 else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif kind == 4:
            for i in range(stride):
                a = line[i - 4] if i >= 4 else 0
                b = prev[i]
                c = prev[i - 4] if i >= 4 else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                near = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + near) & 255
        rows.append(bytes(line))
        prev = line
    return width, height, rows


def encode(size, rgba):
    def chunk(tag, body):
        return (struct.pack(">I", len(body)) + tag + body
                + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF))

    raw = b"".join(b"\x00" + rgba[y * size * 4:(y + 1) * size * 4] for y in range(size))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


# ------------------------------------------------------------------ #
#  The coverage field — one float per source pixel
# ------------------------------------------------------------------ #

def coverage(rows, width, height):
    """`0.0` = the purple field, `1.0` = the white mark, in between = an edge.

    The artwork is two flat colours, so the green channel carries the whole
    shape: 103 in the field, 248 in the mark. Alpha is ignored on purpose —
    the only transparency in the source is a one-pixel border that is
    already field-coloured, i.e. invisible once composited.
    """
    span = MARK_G - FIELD_G
    return [min(1.0, max(0.0, (row[i * 4 + 1] - FIELD_G) / span))
            for row in rows for i in range(width)]


def smooth(field, width, height):
    """One 3×3 binomial pass over the field.

    The source's edges are exactly one pixel of anti-aliasing; blown up
    3.4× they would show their stairs. Widening the edge to ~2px first
    lets the supersampler render a soft ramp instead — the same look a
    browser gives the 150px original.
    """
    kern = (1, 2, 1, 2, 4, 2, 1, 2, 1)
    out = []
    for y in range(height):
        for x in range(width):
            acc = tot = 0
            for dy in (-1, 0, 1):
                yy = 0 if y + dy < 0 else (height - 1 if y + dy > height - 1 else y + dy)
                for dx in (-1, 0, 1):
                    xx = 0 if x + dx < 0 else (width - 1 if x + dx > width - 1 else x + dx)
                    k = kern[(dy + 1) * 3 + (dx + 1)]
                    acc += field[yy * width + xx] * k
                    tot += k
            out.append(acc / tot)
    return out


def catmull(p0, p1, p2, p3, t):
    return 0.5 * (2 * p1 + (-p0 + p2) * t
                  + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                  + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)


def sample(field, width, height, x, y):
    """Catmull-Rom lookup on the field, clamped at the borders.

    Catmull-Rom keeps the two-colour edges from turning into the flat,
    soft saucers a bilinear upscale gives them; the result is clipped, so
    its slight overshoot can only round an edge, never tint it.
    """
    x = min(max(x, 0.0), width - 1.0)
    y = min(max(y, 0.0), height - 1.0)
    xi, yi = int(x), int(y)
    fx, fy = x - xi, y - yi

    def at(i, j):
        j = 0 if j < 0 else (height - 1 if j > height - 1 else j)
        i = 0 if i < 0 else (width - 1 if i > width - 1 else i)
        return field[j * width + i]

    columns = [catmull(at(xi - 1, yi + k), at(xi, yi + k),
                       at(xi + 1, yi + k), at(xi + 2, yi + k), fx)
               for k in (-1, 0, 1, 2)]
    return min(1.0, max(0.0, catmull(columns[0], columns[1], columns[2], columns[3], fy)))


def rounded_square(x, y, size, radius):
    """Signed distance to a rounded square — negative inside."""
    qx = abs(x - size / 2) - (size / 2 - radius)
    qy = abs(y - size / 2) - (size / 2 - radius)
    return math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - radius


def render(field, width, height, size, radius_frac=0.0, ink_scale=1.0):
    """Draw the mark at `size`, supersampled — 3×3 for the launcher sizes,
    4×4 for the small ones, where a single edge pixel is whole percent."""
    step = 1.0 / (4 if size <= 64 else 3)
    radius = radius_frac * size
    pixels = bytearray()
    for y in range(size):
        for x in range(size):
            light = 0.0
            alpha = 0.0
            for sy in range(int(1 / step)):
                for sx in range(int(1 / step)):
                    px = x + (sx + 0.5) * step
                    py = y + (sy + 0.5) * step
                    # the mask belongs to the icon, the mark to the artwork:
                    # the same rounded square the app draws in CSS
                    # (`rounded-[32.5%]`), and the mark centred inside it
                    mask = 1.0 if radius_frac == 0 else min(
                        1.0, max(0.0, 0.5 - rounded_square(px, py, size, radius)))
                    u = ((px / size) - 0.5) / ink_scale + 0.5
                    v = ((py / size) - 0.5) / ink_scale + 0.5
                    light += sample(field, width, height, u * width - 0.5, v * height - 0.5) * mask
                    alpha += mask
            n = (int(1 / step)) ** 2
            light /= n
            alpha /= n
            pixels += bytes(round(FIELD[c] + (MARK[c] - FIELD[c]) * light) for c in range(3))
            pixels.append(round(255 * alpha))
    return bytes(pixels)


# ------------------------------------------------------------------ #

JOBS = [
    # name,                  size, radius (fraction of the side), art scale
    ("favicon-32.png",         32, 13 / 40, 1.0),
    ("apple-touch-icon.png",  180, 0.0,     1.0),   # iOS masks it itself
    ("icon-192.png",          192, 13 / 40, 1.0),
    ("icon-512.png",          512, 13 / 40, 1.0),
    # Android paints a maskable icon full-bleed and crops it to whatever
    # shape the launcher likes; the cat already sits well inside the safe
    # zone of the source artwork, so it needs no extra inset
    ("icon-maskable-512.png", 512, 0.0,     1.0),
]

width, height, rows = decode(SOURCE)
field = smooth(coverage(rows, width, height), width, height)
print(f"source  {SOURCE.relative_to(ROOT)}  {width}×{height}")
for name, size, radius, ink_scale in JOBS:
    data = encode(size, render(field, width, height, size, radius, ink_scale))
    (OUT / name).write_bytes(data)
    print(f"  → public/{name:24} {size}×{size}  {len(data) / 1024:6.2f} KB")
