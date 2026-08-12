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
    <!-- 2699:276 -- Activists (high-contrast swash display; shares --font-display-alt with the body couple name rather than pulling in a 7th family) 64/48, #5a6a52. Design's own connector word. -->
    <p class="divider__and">And</p>
  </section>
</template>

<style scoped>
.divider {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.divider > * {
  position: absolute;
  margin: 0;
}

.divider__and {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1500ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
  --delay: 120ms;
  z-index: 1;
  left: calc(95 * var(--px));
  top: 0;
  width: calc(185 * var(--px));
  text-align: center;
  /* Activists (high-contrast swash display; shares --font-display-alt with the body couple name rather than pulling in a 7th family) has no webfont; --font-display (Almendra Display) is the closest display stand-in on hand. */
  font-family: var(--font-display-alt);
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
