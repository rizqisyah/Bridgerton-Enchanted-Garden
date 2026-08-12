<script setup lang="ts">
// Figma Frame 244 band "theday", y 3746-3958. Coords are band-local design px.
// A one-line divider band (doves + willow) leading into the akad band below it.
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/theday'

const { el, shown } = useReveal(0.3)
</script>

<template>
  <section :ref="el" class="theday" :class="{ 'is-in': shown }" aria-labelledby="theday-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2706:128 — Comtic Hiden 24/23, #ad2124. Decorative divider copy, hardcoded. -->
    <h2 id="theday-heading" class="theday__heading">It&rsquo;s The Day&hellip;</h2>
  </section>
</template>

<style scoped>
.theday {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.theday > * {
  position: absolute;
  margin: 0;
}

.theday__heading {
  opacity: 0;
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) 200ms,
    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1) 200ms;
  z-index: 60;
  left: calc(36 * var(--px));
  top: calc(152 * var(--px));
  width: calc(275 * var(--px));
  font-family: var(--font-heading-script);
  font-size: calc(24 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson);
}

.theday.is-in .theday__heading {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .theday__heading {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
