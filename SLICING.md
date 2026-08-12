# Slicing notes — "adat jawa" Figma file, template 4

Template 4 comes from **two** frames on Page 1 of the Figma file **adat jawa** — the same
file templates 2 and 3 were cut from, a different pair of frames:

| Frame | Node | Size | What it is | Assets |
|-------|------|------|------------|--------|
| Frame 243 | `2684:108` | 375 × 725 | Opening cover — chateau garden, A&S monogram, "Click to open" | `src/assets/opening/` |
| Frame 244 | `2695:163` | 375 × 9866 | The scrolling invitation behind it | not sliced yet |

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

## Fonts — five of the twelve have no webfont

Frame 243 uses 4 families, Frame 244 uses 10, and these have no fontsource package:

| Figma family | Used for | Substitute in use |
|---|---|---|
| Taldose Script | cover "The Wedding Of" | Playball |
| Norveil Fantasy Demo | cover couple name, 48px | Almendra Display |
| Charoly Demo | body couple name (`2695:171`, `2712:322`) | none yet |
| Activists | body | none yet |
| Comtic Hiden | body | none yet |
| Roben Elegante | body | none yet |

The substitutes are wired through `--font-script` / `--font-display` in `tokens.css`; swapping
in the real files means changing those two values and nothing else. **Never bake the type into
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

### Dropped from the cover

| Node | Why |
|---|---|
| `2684:117` | iOS status bar instance, not design |
| `2684:109` | `#d9d9d9` base plate, fully covered by the backdrop |
| `2684:112`, `2695:159` | export came back empty (149 bytes, fully transparent) |
| `2689:143` | byte-identical to `2689:142`, deduped to one asset |

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
rule, and only `PAINTS_NOTHING` is dropped: two layers verified by eye to paint an artifact
the render does not have (`2712:161` laid a dark moss mound across the Wedding Gift heading).
**Add to that set only with a before/after delta that justifies it.**

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
| hero | 4.3 | bride | 6.5 | gift | 10.5 |
| quote | 4.0 | countdown | 9.3 | rsvp | 3.3 |
| invite | 4.0 | theday | 11.4 | wish | 11.6 |
| groom | 7.2 | akad | 7.6 | gallery | 9.3 |
| divider | 8.7 | resepsi | 18.5 | footer | 7.9 |

Whole sheet **8.97**. Resepsi is the worst band and the obvious next thing to look at.
