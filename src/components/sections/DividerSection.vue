<script setup lang="ts">
// Figma Frame 244 band "divider", y 2158-2249. Coords are band-local design px.
// Text-only band -- no plate art of its own; the foliage seen behind it in the
// bandspec crop belongs to the neighbouring groom/bride bands and bleeds into this strip.
import { useReveal } from '../../composables/useReveal'

const BAND_HEIGHT = 91

const { el, shown } = useReveal(0.15)
</script>

<template>
  <section :ref="el" class="divider" :class="{ 'is-in': shown }">
    <!-- 2699:276 -- Activists (high-contrast swash display), 64/48, #5a6a52. Design's own connector word. -->
    <p class="divider__and">And</p>
  </section>
</template>

<style scoped>
.divider {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.divider > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
}

/* Activists is now self-hosted, so the word runs at the Figma spec's own 64/48. */
.divider__and {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1, 0.28, 1) var(--delay, 0ms);
  --delay: 70ms;
  /* 2699:276's global Figma order. z1 put it under the groom band's foliage bleed. */
  z-index: 109;
  left: calc(95 * var(--px));
  /* 6 is the spec, but Activists' line box sits 5px lower than Figma's at 64/48 --
     ink-box measured against the render, glyph size and width already match. */
  top: calc(1 * var(--px));
  width: calc(185 * var(--px));
  text-align: center;
  font-family: var(--font-and);
  font-size: calc(64 * var(--px));
  line-height: calc(48 * var(--px));
  color: #5a6a52;
}

.divider.is-in .divider__and {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .divider__and {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
