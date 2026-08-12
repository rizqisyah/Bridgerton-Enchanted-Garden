#!/usr/bin/env python3
"""Generate one placement table per band of Frame 244.

Same job the cover's `coverLayers.ts` does, done for all 14 bands at once.
Two things make this more than a coordinate dump:

1. Figma's reported bounds and the size it actually exports disagree in both
   directions -- see "exported bounds are not node bounds" in SLICING.md. Every
   layer is reconciled per axis against the real export, then template-matched
   against the 1x frame render, and the match wins wherever it fires.

2. Bands overlap. `section` in frame244-zorder.json is derived from heading
   positions, so hero's art runs to y 978 while quote starts at 709. A band's
   height is therefore the distance to the NEXT band's top, not the extent of
   its own children -- children that overrun simply paint past the boundary,
   which is what the design does anyway. `z` stays the global Figma child order
   so cross-band stacking survives the split.

    python3 scripts/gen_band.py            # every band
    python3 scripts/gen_band.py hero quote # just these

Writes src/lib/bands/<section>.ts and prints a per-band summary.
"""
import json
import os
import pathlib
import sys

from PIL import Image

os.environ.setdefault("LOCATE_REF", ".figma-tmp/exports244/frame244-full.png")
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import locate  # noqa: E402  -- must follow the LOCATE_REF default above

FRAME_W, FRAME_H = 375, 9866
SCALE = 2
GOOD_ERR = 40.0  # locate.py's own threshold for "this is a real match"
OUT_DIR = pathlib.Path("src/lib/bands")

# Rotated nodes whose reported bounds are fiction AND which no position in the frame
# matches. They are buried in the design, so drawing them anywhere paints an artifact
# the render does not have -- 2712:161 put a dark moss mound across the Wedding Gift
# heading. Every other off-frame node is merely occluded, which is not the same thing:
# dropping those wholesale took the sheet from 8.97 to 13.43 mean abs delta.
#
# Measured one at a time, not as a set. All four moss mounds share the same rotated
# 475x159.65 source (c2a52e8a), but the fourth, 2706:144, is genuinely visible:
# dropping it took akad from 7.62 to 8.58 and the sheet from 8.15 to 8.24, so it stays.
# Add to this list only with a before/after delta for that node alone.
PAINTS_NOTHING = {"2706:145", "2712:160", "2712:161"}


def reconcile(pos, node_size, exp_size, frame_size):
    """Reconcile one axis of a Figma node against the size Figma actually exported."""
    if exp_size > node_size:
        # Export grew: a blur or a rotation widened the render bbox, and Figma
        # grows it around the node's centre, so re-centre rather than pin the corner.
        return round(pos + node_size / 2 - exp_size / 2)
    if exp_size < node_size:
        # Export shrank: Figma clipped it at the frame edge the node bleeds past.
        if pos < 0:
            return 0
        if pos + node_size > frame_size:
            return frame_size - exp_size
    return round(pos)


def rescue(path, hint_y, span=700, step=8):
    """Search the whole frame width for a layer whose reported box is off-frame.

    A node reported wholly outside the 375px frame is rotated, so its bounds are
    fiction -- but Figma still exported pixels for it, which means it renders
    SOMEWHERE. Most are mirrored decorations that land back inside the frame.
    A few are buried under later layers and never show at all; those must be
    dropped, or we paint something the design does not.

    Returns (x, y, err) for the best position within +/-span of the reported y.
    """
    im = locate.load_asset(path)
    pts = locate.opaque_points(im, 400)
    if not pts:
        return None
    ref = Image.open(locate.REF).convert("RGB")
    rp = ref.load()

    def score(ox, oy):
        return sum(
            abs(rp[x + ox, y + oy][0] - r)
            + abs(rp[x + ox, y + oy][1] - g)
            + abs(rp[x + ox, y + oy][2] - b)
            for x, y, (r, g, b) in pts
        ) / len(pts)

    y_lo = max(0, hint_y - span)
    y_hi = min(ref.height - im.height, hint_y + span)
    x_hi = ref.width - im.width
    if y_hi < y_lo or x_hi < 0:
        return None
    best = min(
        (score(ox, oy), ox, oy)
        for oy in range(y_lo, y_hi + 1, step)
        for ox in range(0, x_hi + 1, step)
    )
    err, bx, by = best
    for oy in range(max(y_lo, by - step), min(y_hi, by + step) + 1):
        for ox in range(max(0, bx - step), min(x_hi, bx + step) + 1):
            sc = score(ox, oy)
            if sc < err:
                err, bx, by = sc, ox, oy
    return bx, by, err


def band_tops(children):
    """Band top = its first child's y; band height runs to the next band's top."""
    firsts = {}
    for c in children:
        s = c["section"]
        firsts[s] = min(firsts.get(s, c["y"]), c["y"])
    ordered = sorted(firsts.items(), key=lambda kv: kv[1])
    spans = {}
    for i, (name, top) in enumerate(ordered):
        nxt = ordered[i + 1][1] if i + 1 < len(ordered) else FRAME_H
        spans[name] = (round(top), round(nxt - top))
    return spans, [name for name, _ in ordered]


def main():
    zorder = json.load(open(".figma-ref/frame244-zorder.json"))
    children = zorder["children"] if isinstance(zorder, dict) else zorder
    assets = json.load(open(".figma-ref/frame244-assets.json"))["nodes"]

    spans, order = band_tops(children)
    wanted = sys.argv[1:] or order
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for name in wanted:
        if name not in spans:
            print(f"!! no such band: {name}")
            continue
        top, height = spans[name]
        rows, matched, dropped = [], 0, []

        for c in children:
            if c["section"] != name:
                continue
            if c["id"] in PAINTS_NOTHING:
                dropped.append(f"{c['id']} (z{c['z']}, buried in the design)")
                continue
            a = assets.get(c["id"])
            if not a:
                continue  # TEXT, dropped empty, or a group we walked into
            path = f"src/assets/{a['asset']}"
            if not pathlib.Path(path).exists():
                print(f"!! missing asset for {c['id']}: {path}")
                continue
            im = Image.open(path)
            scale = a.get("assetScale", SCALE)
            w, h = im.width // scale, im.height // scale

            found, err = locate.locate(path, max(0, round(c["x"])), max(0, round(c["y"])))
            if found and found[4] < GOOD_ERR:
                x, y = found[0], found[1]
                matched += 1
            elif c["x"] >= FRAME_W or c["x"] + c["w"] <= 0:
                # Reported wholly outside the frame: the bounds are fiction, so the
                # render is the only authority. Match it or drop it.
                hit = rescue(path, max(0, round(c["y"])))
                if hit and hit[2] < GOOD_ERR:
                    x, y = hit[0], hit[1]
                    matched += 1
                else:
                    # A high error here means occluded OR absent -- locate.py cannot tell
                    # them apart, and guessing "absent" and dropping the layer measurably
                    # hurt the render. Fall through to the clip rule; only the layers in
                    # PAINTS_NOTHING below are actually dropped.
                    x = reconcile(c["x"], c["w"], w, FRAME_W)
                    y = reconcile(c["y"], c["h"], h, FRAME_H)
            else:
                x = reconcile(c["x"], c["w"], w, FRAME_W)
                y = reconcile(c["y"], c["h"], h, FRAME_H)
            rows.append((c["z"], c["id"], a["asset"], x, y - top, w, h))

        rows.sort(key=lambda r: r[0])
        if not rows:
            # A text-only band (invite, divider) has no placement table to generate;
            # an empty module would just be an unused import.
            print(f"{name:10} y {top:5}..{top + height:5} h {height:5}  text-only, no table")
            (OUT_DIR / f"{name}.ts").unlink(missing_ok=True)
            continue
        body = f"""// Generated by scripts/gen_band.py — do not hand-edit.
// Figma Frame 244 (2695:163) band "{name}": y {top}..{top + height}, height {height} design px.
// x/y are band-local design px; `z` is the GLOBAL Figma child order, so layers still
// stack correctly against the bands above and below this one.
//
// Positions are NOT Figma's reported bounds — see "exported bounds are not node bounds"
// in SLICING.md. Regenerate rather than nudging numbers by hand.
import type {{ BandLayer }} from '../bandLayer'

export const BAND_TOP = {top}
export const BAND_HEIGHT = {height}

export const LAYERS: BandLayer[] = [
"""
        for z, nid, asset, x, y, w, h in rows:
            mod = asset.replace("/", "_").replace("-", "_").replace(".webp", "")
            body += (
                f"  {{ z: {z}, id: '{nid}', src: assets['{asset}'],"
                f" x: {x}, y: {y}, w: {w}, h: {h} }},\n"
            )
            del mod
        body += "]\n"

        header = """import { assets } from '../bandAssets'

"""
        (OUT_DIR / f"{name}.ts").write_text(header + body)
        print(f"{name:10} y {top:5}..{top + height:5} h {height:5}  {len(rows):3} layers  {matched:3} matched")
        for d in dropped:
            print(f"           dropped: {d}")


if __name__ == "__main__":
    main()
