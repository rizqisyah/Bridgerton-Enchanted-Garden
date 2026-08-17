# Slicing notes — "adat jawa" Figma file, template 4

Template 4 comes from **two** frames on Page 1 of the Figma file **adat jawa** — the same
file templates 2 and 3 were cut from, a different pair of frames:

| Frame | Node | Size | What it is | Assets |
|-------|------|------|------------|--------|
| Frame 243 | `2684:108` | 375 × 725 | Opening cover — chateau garden, A&S monogram, "Click to open" | `src/assets/opening/` |
| Frame 244 | `2695:163` | 375 × 9866 | The scrolling invitation behind it | every other `src/assets/*` |

The file's frames come in cover/body pairs, x-adjacent: 241+242 became template 3, 243+244
is this one. Frame 244 is 1117px taller than template 3's Frame 242, so **do not assume
template 3's section blueprint transfers** — derive the bands from `frame244-zorder.json`.

Design direction: cream paper, olive green, crimson, gold-brown. A European chateau with a
formal garden, calla lilies and hedges. Couple in the design: **Ahmad & Salma**. All copy is
data-driven via `useWedding()`, so those are placeholders.

## Reference files

| File | What it is |
|------|------------|
| `.figma-ref/frame244-zorder.json` | **Frame 244's 226 direct children in Figma child order** — the only file that carries z-order. Read this before building any band |
| `.figma-ref/frame244-layout.json` | All 307 nodes incl. nested: id, type, name, parent, depth, frame-local x/y/w/h, `text`, and `styles` |
| `.figma-ref/frame244-raw.json` | Untouched `get_node` dump — regenerate the layout from this rather than re-querying Figma |
| `.figma-ref/frame243-raw.json` | Same, for the cover |
| `.figma-ref/frame243-layout.json` | Cover: 67 nodes, plus `liveText` and `dropCandidates` blocks |
| `.figma-ref/frame243-assets.json` | Which node became which webp, what deduped, what was dropped empty |
| `.figma-ref/frame244-assets.json` | Same, for the body: 199 nodes → 168 webp across 14 sections |

`get_node` already returns **frame-local** coordinates. Do not subtract the frame origin.

## The thing that will bite you: exported bounds are not node bounds

Figma's reported node bounds and the size it actually exports disagree in two directions,
and both happen all over this file:

- **Clipped.** Figma clips every export to the frame. A node that bleeds off an edge comes
  back narrower than it claims — the backdrop `2687:128` reports 593×691 at x −109 and
  exports 375×691. Its true x is 0, not −109.
- **Expanded.** A rotated node, or one with a blur, exports a bbox *larger* than the node.
  Figma grows it around the node's centre, so re-centre it: `x = fx + fw/2 − exportW/2`.
- **Reported bounds can lie outright.** Three cover nodes report an x past the right edge
  (`2695:158` at 447) yet render visibly — rotation puts them somewhere else entirely.

`src/lib/coverLayers.ts` is generated, not hand-written. Every position is either a template
match against the Figma render (`scripts/locate.py`, err < 40 = real match) or derived from
the clip/expansion rule above. Regenerate it rather than nudging numbers by hand.

Verify a band by screenshotting and differencing against the Figma render:

```sh
npm run dev &                       # port 5176
node scripts/shot.mjs 5176          # writes .figma-tmp/web-*.png
```

The cover currently sits at **4.9 mean abs delta** against `frame243-full.png` once the
status bar and the text nodes are masked out.

## Fonts — six of the twelve have no webfont

Frame 243 uses 4 families, Frame 244 uses 10, and these have no fontsource package:

| Figma family | Used for | Substitute in use |
|---|---|---|
| Taldose Script | cover "The Wedding Of" | Playball |
| Norveil Fantasy Demo | cover couple name, 48px | Almendra Display |
| Charoly Demo | body couple name (`2695:171`, `2712:322`) | Cinzel Decorative |
| Activists | divider "And" — one node | Cinzel Decorative, shared |
| Comtic Hiden | **every band heading**, 11 nodes | Sacramento |
| Roben Elegante | the quote block | EB Garamond |

Each substitute is one token in `tokens.css` — `--font-script`, `--font-display`,
`--font-display-alt`, `--font-heading-script`, `--font-quote` — so swapping in a licensed
file means changing that one value and nothing else. **Never bake the type into
an image to dodge this** — every text node stays live so `useWedding()` can drive it.

Available upstream and already correct: Ibarra Real Nova, Jost, Cormorant Garamond,
EB Garamond, Libre Caslon Condensed, Mohave.

## Traps recorded during the dump

- **9 nodes in Frame 244 report parent-relative y, not frame-local** — `2712:191, 2712:192,
  2712:199, 2712:200, 2712:207` (inside gift group `2712:183` @ 6021) and `2712:263, 2712:262,
  2729:126` (inside wish group `2712:235` @ 7496). Because the layout is y-sorted they surface
  at the top of the file looking like hero content. Resolve them against their ancestor.
- `2712:286` reports y 8464.56 while its group starts at 8488 — a ~23px bleed above the
  parent, the rotated-bounds trap again.
- **`2712:321` is a TEXT_PATH with no `characters`.** Its string ("The Wedding Of") survives
  only in `name`. Anything iterating TEXT nodes for copy will silently miss it.
- **Node names lie.** `2712:304` and `2712:330` are both named "Heading 2 ⏵ Konfirmasi
  Kehadiran" while their actual text is "Wedding Gallery" and "Thank You !". Key off ids.
- `section` in `frame244-zorder.json` is **derived from heading y positions, not verified
  against a render**. Treat it as a hint.
- **A flat-colour layer defeats `locate.py`.** Cream matches cream anywhere, so a blurred
  `#f3ece2` plate scores under `GOOD_ERR` at a position 200px from where it belongs. That is
  how the four haze plates over the portrait hedges (`2699:207/208` groom, `2699:249/250`
  bride) landed below the hedge instead of over it — the hedge rendered at full saturation
  and the portraits lost their halo. They are in `TRUST_CLIP`, which `gen_band.py` now
  honours **before** the first `locate` hit, not only in the clip branch.
- **Both-edges-bleed breaks the clip rule.** `2695:181` reports x 197 w 224 and exports 197
  wide; the rule read that as right-clipped and pinned it to 375−197=178, stacking it on its
  own twin `2695:180` at x 176 and leaving the frame's left third bare under the urns. 197
  wide means x 0. Same failure as `2712:333`, same fix: `PIN_X`.

### Dropped from the cover

| Node | Why |
|---|---|
| `2684:117` | iOS status bar instance, not design |
| `2684:109` | `#d9d9d9` base plate, fully covered by the backdrop |
| `2684:112`, `2695:159` | export came back empty (149 bytes, fully transparent) |
| `2689:143` | byte-identical to `2689:142`, deduped to one asset |

## Design mode

`DESIGN_MODE` lives in `src/lib/api.ts` — at the boundary, not in a composable. It is on
unless `VITE_LIVE_DATA=1`, and it does three things: `getHome` is never called, so every
band renders Frame 243/244's own content; `submitRsvp` and `submitUcapan` throw instead of
posting; and a wish submitted in this state is answered locally so the form still works
end to end.

It has to sit at the boundary because `RsvpSection` imports `submitRsvp` directly. A guard
that lived only in `useWedding` let that POST straight through to production.

Design-mode wishes are held in a module ref, **not** in `state.data`. Seeding `state.data`
to hold them would make `wedding` non-null and every band would abandon its design fallback
mid-session.

## Two traps that cost real time

**A positioned wrapper eats the coordinate system.** Every band child is `position: absolute`
in design px against the band. Wrapping children in a plain `<div>` makes that div the
containing block, and since it has no offsets of its own everything inside lands against a
zero-size box. This rendered the whole countdown blank. Use `<template v-for>`.

**z-index is the GLOBAL Figma order.** `BandArt` sets each layer's z inline from
`frame244-zorder.json`, and inline beats a rule. Anything a band draws on top needs its own
node's real global z — hero tops out at z48, but countdown's art runs to z118 and footer's to
z205. A z of 60 copied from `HeroSection` puts the control underneath the art.

It bit twice more after that: bride's two text nodes carried hero's z60 while bride's art
runs to z105, so both lines rendered *through* a translucent willow sheet and read as washed
out rather than hidden — they are z107/z108. `DividerSection`'s "And" carried z1 against a
real z109 and sat under the groom band's foliage bleed. Neither looked like a z bug; both
looked like an opacity bug.

## Deployment

`VITE_DEFAULT_SLUG` must be set per deployment — without it `src/lib/api.ts` falls back to
`demo-envelop`, which is a *different* wedding and will render the wrong couple.

## Bands

`scripts/gen_band.py` generates `src/lib/bands/<band>.ts`, one placement table per band, and
`BandArt` renders a table. Bands **overlap** in the design — hero's art runs to y 978 while
quote starts at 709 — so a band's height is the distance to the *next* band's top, and `z`
stays the **global** Figma child order. Every band shares one stacking context, which is what
keeps cross-band layering correct after the split. Do not give a band `z-index`, or it becomes
its own context and the global order stops working.

### Off-frame nodes: occluded is not absent

22 nodes report a box lying wholly outside the 375px frame. They are rotated, so their bounds
are fiction, but Figma still exported pixels for them and most land back inside the frame as
mirrored decorations. `gen_band.py` searches the full frame width for those (`rescue()`).

When that search *fails*, the layer is either buried under later layers or genuinely absent —
and `locate.py` cannot tell the two apart, because it scores over all of a layer's opaque
pixels and a mostly-buried layer scores badly even where it belongs. Dropping every failure
took the sheet from 8.97 to 13.43 mean abs delta. So a failed search falls back to the clip
rule, and only `PAINTS_NOTHING` is dropped — three layers that paint an artifact the render
does not have (`2712:161` laid a dark moss mound across the Wedding Gift heading).

`rescue()` runs for any export Figma clipped, not only the wholly-outside ones — a clipped
export means the node bleeds, and in this file a bleeding node is usually a rotated one. But
the search always finds *some* least-bad spot, so it only wins when it scores under 15 **and**
beats where the clip rule put it by 3. Even that is not enough on its own: `2695:182`, hero's
375×516 backdrop, is buried under most of its band, so it scores badly where it belongs and
the search moved it 479px down — hero 4.32 → 9.20, quote 4.00 → 8.83. It is pinned in
`TRUST_CLIP`. Both exception sets carry the numbers that put each entry there.

`PIN_X` is the third exception set. The clip rule guesses *which* edge cut an export, and
for a node bleeding past both it guesses wrong: `2712:333` reports x 175 w 268 and exports
175 wide, so the rule read it as right-clipped and pinned it to `375-175 = 200` — stacking
the left half of a mirrored vine pair on top of its own mirror and leaving the frame's left
third bare under the Thank You copy. It is the left one: pinning x to 0 took gallery 8.53 ->
4.69 and footer 7.54 -> 6.81.

Measure them **one at a time**. All four moss mounds share the same rotated 475×159.65 source
(`c2a52e8a`), which makes them look like a set, but the fourth (`2706:144`) is genuinely
visible: dropping it took akad from 7.62 to 8.58 and the sheet from 8.15 to 8.24. It stays.

`2699:240` / `2699:256` (the same rotated leaf sprig, groom and bride) are the other two
drops: both re-centre onto open paper where the render draws nothing at all, and the leaf
read as a foreign object floating over the willow. Groom 7.21 -> 6.99, bride 6.52 -> 6.44.

### Checking a band

```sh
npm run dev &                       # port 5176
node scripts/shot.mjs 5176
```

Screenshot the running sheet and difference it against `.figma-tmp/exports244/frame244-full.png`.
Scroll the **window**, not `.desktop-right-column` — that column only scrolls at >=768px, and
below that the bands never reveal, which reads as a blank sheet rather than a scroll bug.

Current state, mean abs delta per band:

| band | delta | band | delta | band | delta |
|---|---|---|---|---|---|
| hero | 4.3 | bride | 6.4 | gift | 6.7 |
| quote | 4.0 | countdown | 3.6 | rsvp | 3.3 |
| invite | 4.0 | theday | 3.0 | wish | 9.1 |
| groom | 6.9 | akad | 7.6 | gallery | 4.7 |
| divider | 8.7 | resepsi | 10.9 | footer | 6.8 |

Whole sheet **6.56**. Worst three: resepsi, wish, divider. This is a relative signal across bands, not an absolute fidelity score:
it carries every deliberate deviation from the render — substitute fonts, the live countdown
where the design bakes a "0 Hari 0 Jam" plate, the live wish list where it bakes a raster of
mock comments, and the live gallery where it bakes a mock carousel.
