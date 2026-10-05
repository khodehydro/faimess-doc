"""App icons for FAIMESS — generated, not hand-drawn.

The favicon and the launcher icons are the same mark the app draws in
`src/ui/Logo.tsx` (a violet tile with a rounded "F" and two sound waves),
rasterised here with no dependencies: the tile, the strokes and the arcs
are distance functions, sampled 3x3 per pixel, and the PNG is written
straight out of `zlib`.

    python3 tools/appicons.py        # writes public/*.png

`icon-maskable-512.png` is the Android "maskable" variant: full-bleed
purple with the mark scaled into the safe zone, so a launcher can crop it
to a circle, a squircle or a rounded square without eating the letter.
"""

import math, struct, zlib, pathlib

W = "#9B82F6"; M = "#8267F0"; D = "#6B4FDD"   # logo tile gradient
FW = "#FFFFFF"; FE = "#E7DEFE"               # logo "F" gradient

def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))

def tile_at(t):
    if t < 0.55:
        return lerp(hexc(W), hexc(M), t / 0.55)
    return lerp(hexc(M), hexc(D), (t - 0.55) / 0.45)

def f_at(t):
    return lerp(hexc(FW), hexc(FE), t)

def seg_d(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    L = vx * vx + vy * vy
    t = 0.0 if L == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / L))
    dx, dy = px - (ax + t * vx), py - (ay + t * vy)
    return math.hypot(dx, dy)

def arc_d(px, py, cx, cy, r, a0, a1):
    dx, dy = px - cx, py - cy
    ang = math.atan2(dy, dx)
    if a0 <= ang <= a1:
        return abs(math.hypot(dx, dy) - r)
    ends = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in (a0, a1)]
    return min(math.hypot(px - ex, py - ey) for ex, ey in ends)

def rr_d(px, py, x, y, w, h, r):
    qx, qy = abs(px - (x + w / 2)) - (w / 2 - r), abs(py - (y + h / 2)) - (h / 2 - r)
    return math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - r

def render(size, radius_frac, ink_scale=1.0, waves=True):
    """Draw the brand tile in a 40x40 space, supersampled 3x3 per pixel."""
    px = bytearray()
    ss = 3
    half_f = 1.8            # stroke half-width of the "F"
    half_w = 1.0            # stroke half-width of the sound waves
    cx = cy = 20.0
    for y in range(size):
        for x in range(size):
            acc = [0.0, 0.0, 0.0, 0.0]
            for sy in range(ss):
                for sx in range(ss):
                    ux = (x + (sx + 0.5) / ss) / size * 40.0
                    uy = (y + (sy + 0.5) / ss) / size * 40.0
                    # scale the mark around the centre (for the maskable safe zone)
                    mx = cx + (ux - cx) / ink_scale
                    my = cy + (uy - cy) / ink_scale
                    tile = 1.0 if radius_frac == 0 else max(0.0, min(1.0, 0.5 - rr_d(ux, uy, 0, 0, 40, 40, 40 * radius_frac)))
                    if tile <= 0:
                        continue
                    col = tile_at(min(1.0, max(0.0, (ux + uy) / 80.0)))
                    # the F: stem + top bar (with the rounded corner) + middle arm
                    d = min(
                        seg_d(mx, my, 15.4, 29.0, 15.4, 14.8),
                        arc_d(mx, my, 17.2, 14.8, 1.8, math.pi, math.pi * 1.5),
                        seg_d(mx, my, 17.2, 11.6, 26.6, 11.6),
                        seg_d(mx, my, 15.4, 20.4, 22.8, 20.4),
                    )
                    f = max(0.0, min(1.0, half_f + 0.5 - d))
                    fcol = f_at(min(1.0, max(0.0, (ux + uy) / 80.0)))
                    col = lerp(col, fcol, f)
                    if waves:
                        wd = min(
                            arc_d(mx, my, 24.6, 20.0, 3.9, -math.pi / 3, math.pi / 3),
                            arc_d(mx, my, 24.6, 20.0, 8.0, -math.pi / 3, math.pi / 3),
                        )
                        w = max(0.0, min(1.0, half_w + 0.5 - wd)) * 0.75
                        col = lerp(col, (255, 255, 255), w)
                    acc[0] += col[0] * tile
                    acc[1] += col[1] * tile
                    acc[2] += col[2] * tile
                    acc[3] += 255.0 * tile
            n = ss * ss
            px += bytes(int(round(min(255.0, c / n))) for c in acc)
    return bytes(px)

def png(size, rgba):
    raw = b"".join(b"\x00" + rgba[y * size * 4:(y + 1) * size * 4] for y in range(size))
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))

out = pathlib.Path("/home/user/faimess-doc/public")
jobs = [
    ("favicon-32.png", 32, 13 / 40, 1.0, False),
    ("apple-touch-icon.png", 180, 0.0, 0.92, True),
    ("icon-192.png", 192, 13 / 40, 1.0, True),
    ("icon-512.png", 512, 13 / 40, 1.0, True),
    ("icon-maskable-512.png", 512, 0.0, 0.78, True),
]
for name, size, radius, scale, waves in jobs:
    data = png(size, render(size, radius, scale, waves))
    (out / name).write_bytes(data)
    print(f"{name:28} {size}x{size}  {len(data) / 1024:6.2f} KB")
