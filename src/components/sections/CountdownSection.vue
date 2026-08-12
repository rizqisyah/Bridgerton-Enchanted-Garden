<script setup lang="ts">
/*
 * Figma Frame 244 band "countdown", y 3046-3746. Coords are band-local design px.
 *
 * 2699:283 ("Screenshot 2026-07-31 153625 1") is a baked raster of the "0 Hari 0
 * Jam 0 Menit 0 Detik" grid — 96px tall RECTANGLE, no TEXT node behind it, same
 * shape as template-3's countdown bitmap. A countdown has to tick, so it is
 * skipped from BandArt and the four cells are live DOM instead. Cell centres and
 * row tops are measured off the bitmap's own ink (see bandspec/countdown.png);
 * there is no TEXT node to recover the digit/label font from, so both reuse
 * --font-quote (EB Garamond) and --font-body already loaded for this design.
 *
 * The button plate under "Add to Calender" (2699:287) is a single-fill rectangle
 * (#424c30, radius 13) — dropped from the sliced assets as a CSS background, not
 * an image, same rule as the page's base plate.
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { parseEventStart, remainingUntil } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/countdown'

const { el, shown } = useReveal(0.15)
const { acara } = useWedding()

const target = computed(() => {
  const e = (acara.value as any[])[0]
  return e ? parseEventStart(e.event_date, e.event_time) : null
})

// The design ships 0 0 0 0, so an unconfigured render matches the reference.
const now = ref(Date.now())
const left = computed(() => remainingUntil(target.value, now.value))

// Tick starts on reveal (see CountdownSection in template 3 for why): the band
// stays mounted for the whole scroll, so starting at setup would rewrite four
// cells a second the entire time the guest is nowhere near it.
let timer = 0
watch(
  shown,
  (on) => {
    if (!on || timer) return
    now.value = Date.now()
    timer = window.setInterval(() => (now.value = Date.now()), 1000)
  },
  { immediate: true },
)
onUnmounted(() => window.clearInterval(timer))

const CELLS = [
  { key: 'days' as const, label: 'Hari', cx: 139.5, digitTop: 290, labelTop: 356 },
  { key: 'hours' as const, label: 'Jam', cx: 248.5, digitTop: 290, labelTop: 356 },
  { key: 'minutes' as const, label: 'Menit', cx: 139.5, digitTop: 403, labelTop: 468 },
  { key: 'seconds' as const, label: 'Detik', cx: 248.5, digitTop: 403, labelTop: 468 },
]
const CELL_W = 110

function cellBox(cx: number) {
  return { left: `calc(${cx - CELL_W / 2} * var(--px))`, width: `calc(${CELL_W} * var(--px))` }
}
</script>

<template>
  <section
    :ref="el"
    class="countdown"
    :class="{ 'is-in': shown }"
    aria-labelledby="countdown-label"
  >
    <BandArt :layers="LAYERS" :skip="['2699:283']" :shown="shown" />

    <!-- 2699:282 — Comtic Hiden 20/23, #ad2124. Decorative divider copy, hardcoded. -->
    <h2 id="countdown-label" class="countdown__heading">Save <br />the Date&hellip;</h2>

    <p class="countdown__sr" aria-live="polite">
      {{ left.days }} hari {{ left.hours }} jam {{ left.minutes }} menit lagi
    </p>

    <div
      v-for="c in CELLS"
      :key="c.key"
      class="countdown__cell"
      aria-hidden="true"
    >
      <span class="countdown__value" :style="{ top: `calc(${c.digitTop} * var(--px))`, ...cellBox(c.cx) }">{{
        left[c.key]
      }}</span>
      <span class="countdown__caption" :style="{ top: `calc(${c.labelTop} * var(--px))`, ...cellBox(c.cx) }">{{
        c.label
      }}</span>
    </div>

    <!-- 2699:287 button plate, CSS background (single-fill, not a sliced asset). -->
    <div class="countdown__cal">
      <!-- 2699:288 — Libre Caslon Condensed 15/23 Italic, #ffffff. Decorative copy, hardcoded. -->
      <span class="countdown__cal-label">Add to Calender</span>
    </div>
  </section>
</template>

<style scoped>
.countdown {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.countdown > * {
  position: absolute;
  margin: 0;
}

.countdown__sr {
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.countdown__heading,
.countdown__cell,
.countdown__cal {
  opacity: 0;
  transform: translateY(calc(12 * var(--px)));
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms);
}

.countdown.is-in .countdown__heading,
.countdown.is-in .countdown__cell,
.countdown.is-in .countdown__cal {
  opacity: 1;
  transform: none;
}

.countdown__heading {
  --delay: 200ms;
  z-index: 60;
  left: calc(35 * var(--px));
  top: calc(56 * var(--px));
  width: calc(275 * var(--px));
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson);
}

.countdown__cell {
  --delay: 340ms;
  top: 0;
  left: 0;
  z-index: 60;
}

.countdown__cell > span {
  position: absolute;
  text-align: center;
  color: #623c2a;
}

.countdown__value {
  font-family: var(--font-quote);
  font-size: calc(42 * var(--px));
  line-height: calc(42 * var(--px));
  font-variant-numeric: lining-nums;
}

.countdown__caption {
  font-family: var(--font-body);
  font-size: calc(15 * var(--px));
  line-height: calc(18 * var(--px));
}

.countdown__cal {
  --delay: 460ms;
  z-index: 60;
  left: calc(125 * var(--px));
  top: calc(511 * var(--px));
  width: calc(138 * var(--px));
  height: calc(39 * var(--px));
  border-radius: calc(13 * var(--px));
  background: #424c30;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown__cal-label {
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .countdown__heading,
  .countdown__cell,
  .countdown__cal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
