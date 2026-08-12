<script setup lang="ts">
/*
 * Figma Frame 244 band "footer", y 9053-9866 — the frame's own bottom edge. Coords
 * are band-local design px. No node here needs to become a live control; the whole
 * chateau/garden/fountain scene ships as-is through footer.ts. Only the five TEXT
 * nodes are live:
 *
 *   2712:330 "Thank You !"           heading
 *   2712:323 the closing paragraph
 *   2712:321 TEXT_PATH "The Wedding Of" — no `characters`, the string survives only
 *            in `name` (see SLICING.md). Figma curves it along a path; this ships as
 *            a straight centred line, the same simplification HeroSection etc. never
 *            needed to make because their own script lines are already straight.
 *   2712:322 "Ahmad \n&\nSalma"     three lines, live from groom/bride
 *   2712:326 the vendor credit, on the olive bar (2712:325, painted by BandArt)
 */
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/footer'

const { el, shown } = useReveal()
const { groom, bride } = useWedding()

const groomFirst = computed(() => (groom.value?.name as string)?.split(' ')[0] || 'Ahmad')
const brideFirst = computed(() => (bride.value?.name as string)?.split(' ')[0] || 'Salma')
</script>

<template>
  <footer :ref="el" class="footer" :class="{ 'is-in': shown }" aria-labelledby="footer-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2712:330 — Comtic Hiden 24/42, #9e0f0f. -->
    <h2 id="footer-heading" class="footer__thanks">Thank You !</h2>
    <!-- 2712:323 — Ibarra Real Nova 14/20 Italic +1%, #000000. -->
    <p class="footer__body">
      Doa restu Bapak/Ibu/Saudara/i menjadi kebahagiaan bagi kami. Semoga Allah SWT memberkahi
      pernikahan kami. Terima kasih atas doa dan kasih sayangnya.<br />
      Wassalamu'alaikum warahmatullahi wabarakatuh.
    </p>

    <!-- 2712:321 TEXT_PATH, string only in `name`; #4d4d2d, rendered straight (see note above). -->
    <p class="footer__of">The Wedding Of</p>
    <!-- 2712:322 — Charoly Demo 40, #732222. No fontsource; --font-display-alt substitutes. -->
    <p class="footer__couple">{{ groomFirst }}<br />&amp;<br />{{ brideFirst }}</p>

    <!-- 2712:326 — Ibarra Real Nova 12, #ffffff, on the olive bar (2712:325, art). -->
    <p class="footer__credit">Created by @25ribuaja x Qinvi</p>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.footer > * {
  position: absolute;
  margin: 0;
  opacity: 0;
  transition:
    opacity 1100ms ease-out var(--in, 0ms),
    transform 1500ms cubic-bezier(0.16, 1, 0.3, 1) var(--in, 0ms);
}

.footer.is-in > * {
  opacity: 1;
  transform: none;
}

.footer__thanks {
  --in: 200ms;
  z-index: 191;
  top: 0;
  left: calc(40 * var(--px));
  width: calc(291 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-heading-script);
  font-size: calc(24 * var(--px));
  line-height: calc(42 * var(--px));
  text-align: center;
  color: var(--crimson-title);
}

.footer__body {
  --in: 380ms;
  z-index: 203;
  top: calc(37 * var(--px));
  left: calc(52 * var(--px));
  width: calc(256 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: calc(14 * var(--px));
  line-height: calc(20 * var(--px));
  letter-spacing: 0.01em;
  text-align: center;
  color: #000000;
}

.footer__of {
  --in: 900ms;
  z-index: 201;
  top: calc(419 * var(--px));
  left: calc(104 * var(--px));
  width: calc(167 * var(--px));
  transform: translateY(calc(10 * var(--px)));
  font-family: var(--font-script);
  font-size: calc(20 * var(--px));
  line-height: calc(24 * var(--px));
  text-align: center;
  color: #4d4d2d;
}

.footer__couple {
  --in: 1050ms;
  z-index: 202;
  top: calc(452 * var(--px));
  left: calc(108 * var(--px));
  width: calc(159 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-display-alt);
  font-size: calc(40 * var(--px));
  line-height: calc(40 * var(--px));
  text-align: center;
  color: #732222;
}

.footer__credit {
  --in: 1600ms;
  z-index: 205;
  top: calc(793 * var(--px));
  left: calc(66 * var(--px));
  width: calc(244 * var(--px));
  transform: translateY(calc(6 * var(--px)));
  font-family: var(--font-serif);
  font-size: calc(12 * var(--px));
  line-height: calc(18 * var(--px));
  text-align: center;
  color: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .footer > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
