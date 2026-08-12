// Generated — do not hand-edit. Figma Frame 243 (2684:108), 375 x 725.
// `z` is Figma child order, which IS the paint order.
//
// x/y/w/h are NOT Figma's reported bounds. Figma clips every export to the frame,
// so a node that bleeds off an edge comes back narrower than it claims, and several
// nodes here are rotated, which makes their reported bounds lie outright. Positions
// are the template-match against .figma-tmp/frame243-full.png where that matched
// (scripts/locate.py, err < 40), and derived from the clip edge otherwise.
const modules = import.meta.glob('../assets/opening/parts/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const parts = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]),
) as Record<string, string>

export type CoverLayer = {
  z: number
  id: string
  src: string
  x: number
  y: number
  w: number
  h: number
}

export const COVER_LAYERS: CoverLayer[] = [
  { z: 1, id: '2687:128', src: parts['2687-128'], x: 0, y: 34, w: 375, h: 691 },
  { z: 2, id: '2693:129', src: parts['2693-129'], x: 0, y: 431, w: 375, h: 198 },
  { z: 3, id: '2694:130', src: parts['2694-130'], x: 0, y: 537, w: 375, h: 188 },
  { z: 4, id: '2695:161', src: parts['2695-161'], x: 56, y: 466, w: 265, h: 259 },
  { z: 5, id: '2689:140', src: parts['2689-140'], x: 0, y: 637, w: 121, h: 88 },
  { z: 6, id: '2694:131', src: parts['2694-131'], x: 95, y: 651, w: 80, h: 74 },
  { z: 7, id: '2694:132', src: parts['2694-132'], x: 298, y: 656, w: 80, h: 69 },
  { z: 8, id: '2694:133', src: parts['2694-133'], x: 26, y: 672, w: 80, h: 53 },
  { z: 9, id: '2694:134', src: parts['2694-134'], x: 342, y: 654, w: 80, h: 71 },
  { z: 10, id: '2689:141', src: parts['2689-141'], x: 270, y: 634, w: 105, h: 91 },
  { z: 11, id: '2689:142', src: parts['2689-142'], x: 179, y: 661, w: 148, h: 64 },
  { z: 12, id: '2689:143', src: parts['2689-142'], x: 61, y: 661, w: 148, h: 64 },
  { z: 13, id: '2689:144', src: parts['2689-144'], x: 114, y: 637, w: 148, h: 88 },
  { z: 14, id: '2685:141', src: parts['2685-141'], x: 0, y: 53, w: 375, h: 669 },
  { z: 19, id: '2688:129', src: parts['2688-129'], x: 327, y: 550, w: 48, h: 175 },
  { z: 20, id: '2688:130', src: parts['2688-130'], x: 43, y: 550, w: 43, h: 175 },
  { z: 21, id: '2688:131', src: parts['2688-131'], x: 285, y: 601, w: 90, h: 124 },
  { z: 22, id: '2688:133', src: parts['2688-133'], x: 92, y: 592, w: 92, h: 133 },
  { z: 23, id: '2688:134', src: parts['2688-134'], x: 0, y: 231, w: 47, h: 210 },
  { z: 24, id: '2688:135', src: parts['2688-135'], x: 318, y: 231, w: 57, h: 210 },
  { z: 25, id: '2689:138', src: parts['2689-138'], x: 318, y: 231, w: 43, h: 210 },
  { z: 26, id: '2689:139', src: parts['2689-139'], x: 0, y: 288, w: 39, h: 210 },
  { z: 28, id: '2689:136', src: parts['2689-136'], x: 340, y: 543, w: 35, h: 147 },
  { z: 29, id: '2689:137', src: parts['2689-137'], x: 0, y: 540, w: 38, h: 152 },
  { z: 30, id: '2689:145', src: parts['2689-145'], x: 283, y: 626, w: 67, h: 98 },
  { z: 31, id: '2689:146', src: parts['2689-146'], x: 62, y: 626, w: 67, h: 98 },
  { z: 32, id: '2690:148', src: parts['2690-148'], x: 39, y: 651, w: 91, h: 74 },
  { z: 33, id: '2690:149', src: parts['2690-149'], x: 332, y: 646, w: 91, h: 79 },
  { z: 34, id: '2692:126', src: parts['2692-126'], x: 241, y: 683, w: 57, h: 42 },
  { z: 35, id: '2692:127', src: parts['2692-127'], x: 78, y: 680, w: 57, h: 45 },
  { z: 36, id: '2695:150', src: parts['2695-150'], x: 118, y: 104, w: 141, h: 174 },
  { z: 38, id: '2695:154', src: parts['2695-154'], x: 174, y: 662, w: 99, h: 63 },
  { z: 39, id: '2695:155', src: parts['2695-155'], x: 199, y: 663, w: 99, h: 62 },
  { z: 40, id: '2695:156', src: parts['2695-156'], x: 145, y: 642, w: 99, h: 83 },
  { z: 41, id: '2695:157', src: parts['2695-157'], x: 66, y: 261, w: 66, h: 132 },
  { z: 42, id: '2695:158', src: parts['2695-158'], x: 315, y: 261, w: 60, h: 132 },
]
