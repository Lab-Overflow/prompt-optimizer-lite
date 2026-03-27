#!/usr/bin/env python3
"""Generate a 128x128 pixel-art PNG icon for Prompt Optimizer Lite."""
import struct
import zlib
import os

ICON_SIZE = 128
GRID = 16
SCALE = ICON_SIZE // GRID  # 8px per "pixel"

# Color palette (R, G, B, A)
T = (0, 0, 0, 0)            # transparent
P = (108, 92, 231, 255)      # purple (background)
PD = (90, 74, 210, 255)      # purple dark (border accent)
W = (255, 255, 255, 255)     # white (prompt symbol)
WS = (220, 215, 255, 255)    # white-soft (anti-alias)
G = (255, 217, 61, 255)      # gold (sparkle arms)
Y = (255, 247, 140, 255)     # yellow bright (sparkle center)

# Rounded-rect background mask (16x16)
BG_MASK = [
    "____PPPPPPPP____",
    "__PPPPPPPPPPPP__",
    "_PPPPPPPPPPPPPP_",
    "_PPPPPPPPPPPPPP_",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "_PPPPPPPPPPPPPP_",
    "_PPPPPPPPPPPPPP_",
    "__PPPPPPPPPPPP__",
    "____PPPPPPPP____",
]


def build_grid():
    grid = [[T] * GRID for _ in range(GRID)]

    # 1) Fill background
    for y in range(GRID):
        for x in range(GRID):
            if BG_MASK[y][x] == "P":
                grid[y][x] = P

    # 2) Darker border ring for depth
    border_pixels = [
        # top edge
        (0,4),(0,5),(0,6),(0,7),(0,8),(0,9),(0,10),(0,11),
        (1,2),(1,3),(1,12),(1,13),
        (2,1),(3,1),(12,1),(13,1),
        (14,2),(14,3),(14,12),(14,13),
        (15,4),(15,5),(15,6),(15,7),(15,8),(15,9),(15,10),(15,11),
        (2,14),(3,14),(12,14),(13,14),
    ]
    for r, c in border_pixels:
        if grid[r][c] != T:
            grid[r][c] = PD

    # 3) ">" chevron — 2px wide strokes
    chevron = [
        (4, 3), (4, 4),
        (5, 4), (5, 5),
        (6, 5), (6, 6),
        (7, 6), (7, 7),     # tip
        (8, 5), (8, 6),
        (9, 4), (9, 5),
        (10, 3), (10, 4),
    ]
    for r, c in chevron:
        grid[r][c] = W

    # soft glow pixels beside chevron
    glow = [
        (4, 5), (7, 8), (10, 5),
    ]
    for r, c in glow:
        grid[r][c] = WS

    # 4) "_" cursor
    for c in (7, 8, 9):
        grid[11][c] = W

    # 5) Sparkle 1 — diamond centered at (5, 11)
    grid[4][11] = G
    grid[5][10] = G
    grid[5][11] = Y
    grid[5][12] = G
    grid[6][11] = G

    # 6) Sparkle 2 — smaller, centered at (10, 12)
    grid[10][12] = G
    grid[11][12] = Y
    grid[12][12] = G

    # 7) Tiny sparkle dot at (7, 13)
    grid[7][13] = G

    return grid


def scale_grid(grid):
    """Scale 16×16 grid → 128×128 flat RGBA list."""
    pixels = []
    for gy in range(GRID):
        row = []
        for gx in range(GRID):
            row.extend([grid[gy][gx]] * SCALE)
        for _ in range(SCALE):
            pixels.extend(row)
    return pixels


def write_png(filename, width, height, pixels):
    """Write a minimal valid PNG from flat RGBA pixel list."""

    def chunk(ctype, data):
        body = ctype + data
        crc = struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + body + crc

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))

    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: None
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw.extend((r, g, b, a))

    idat = chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    iend = chunk(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(signature + ihdr + idat + iend)


if __name__ == "__main__":
    grid = build_grid()
    pixels = scale_grid(grid)

    project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    icon_path = os.path.join(project_root, "icon.png")

    write_png(icon_path, ICON_SIZE, ICON_SIZE, pixels)
    print(f"Generated: {icon_path} ({ICON_SIZE}x{ICON_SIZE})")
