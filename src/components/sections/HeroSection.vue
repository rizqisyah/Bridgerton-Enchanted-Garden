<script setup lang="ts">
// Figma Frame 244 band "hero", y 0–709. Coords are band-local design px.
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/hero'

const { el, shown } = useReveal(0.15)
const { wedding, coupleNickname } = useWedding()

/*
 * z23 (2695:173) is the couple PORTRAIT, not artwork — the design's stock illustration.
 * A real couple's invitation has to show their own photo, so when the API supplies one
 * it is drawn into the frame's aperture instead. The aperture was measured off the alpha
 * hole in the ornate frame (2695:172, z25, which paints ABOVE this and does the cropping).
 */
const couplePhoto = computed(
  () => (wedding.value?.image_cover as string) || (wedding.value?.image_bg1 as string) || '',
)
const heroSkip = computed(() => (couplePhoto.value ? ['2695:173'] : []))
</script>

<template>
  <section :ref="el" class="hero" :class="{ 'is-in': shown }" aria-labelledby="hero-heading">
    <BandArt :layers="LAYERS" :skip="heroSkip" :shown="shown" />

    <img
      v-if="couplePhoto"
      :src="couplePhoto"
      alt="Foto mempelai"
      class="hero__photo"
      width="166"
      height="256"
    />

    <!-- 2695:171 — Charoly Demo 32/28, #ad2124. -->
    <h2 id="hero-heading" class="hero__couple">{{ coupleNickname }}</h2>
    <!-- 2695:170 — Mohave 20/30, #72703d. -->
    <p class="hero__kicker">Wedding Invitation</p>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.hero > * {
  position: absolute;
  margin: 0;
  text-align: center;
}

/* The aperture in 2695:172, in band-local design px. */
.hero__photo {
  z-index: 23;
  left: calc(102 * var(--px));
  top: calc(273 * var(--px));
  width: calc(166 * var(--px));
  height: calc(256 * var(--px));
  object-fit: cover;
}

.hero__couple,
.hero__kicker {
  opacity: 0;
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  transition:
    opacity 1900ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 2600ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
}

.hero.is-in .hero__couple,
.hero.is-in .hero__kicker {
  opacity: 1;
  transform: none;
}

.hero__couple {
  --delay: 240ms;
  z-index: 60;
  left: calc(45 * var(--px));
  top: calc(69 * var(--px));
  width: calc(289 * var(--px));
  font-family: var(--font-display-alt);
  font-size: calc(32 * var(--px));
  font-weight: 400;
  line-height: calc(28 * var(--px));
  text-transform: uppercase;
  color: var(--crimson);
}

.hero__kicker {
  --delay: 380ms;
  z-index: 60;
  left: calc(53 * var(--px));
  top: calc(131 * var(--px));
  width: calc(269 * var(--px));
  font-family: var(--font-caps);
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--olive);
}

@media (prefers-reduced-motion: reduce) {
  .hero__couple,
  .hero__kicker {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
