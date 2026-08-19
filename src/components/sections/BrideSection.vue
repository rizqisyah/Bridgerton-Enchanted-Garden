<script setup lang="ts">
// Figma Frame 244 band "bride", y 2249-3046. Coords are band-local design px.
import { computed, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { parentLine } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/bride'

const { el, shown } = useReveal(0.15)
const { bride } = useWedding()

/*
 * 2699:251 is the design's illustrated portrait; 2699:254 (z64) is the ornate plate
 * painted ABOVE it, and the transparent hole in that plate is what crops the portrait.
 * The aperture below was measured off the plate's own alpha, the same way HeroSection's
 * was, so a real photo can take the illustration's place when the API has one.
 * photo_url is a cross-origin upload host, so a 404 there would leave a broken image
 * inside the frame -- fall back to the illustration if it fails to load.
 */
const photoFailed = ref(false)
const photo = computed(() =>
  !photoFailed.value ? ((bride.value?.photo_url as string) || '') : '',
)
const artSkip = computed(() => (photo.value ? ['2699:251'] : []))

// Frame 244 prints the short name on its own line, then the full name/title
// below it — the design's own strings are the fallback for an unconfigured render.
const nickname = computed(() => bride.value?.nickname?.trim() || 'Salma')
const fullName = computed(() => bride.value?.name?.trim() || 'Putri Kartika, S.E')
const parents = computed(
  () => parentLine(bride.value) || 'Putri Pertama dari  Bapak Harith Satyo\n& Ibu Nuri Mulyana',
)
</script>

<template>
  <section :ref="el" class="bride" :class="{ 'is-in': shown }" aria-labelledby="bride-heading">
    <BandArt :layers="LAYERS" :skip="artSkip" :shown="shown" />

    <img
      v-if="photo"
      :src="photo"
      alt="Foto mempelai"
      class="bride__photo"
      width="250"
      height="348"
      @error="photoFailed = true"
    />

    <!-- 2699:247 — Comtic Hiden 13/23, #ad2124. -->
    <h2 id="bride-heading" class="bride__name">
      <span>{{ nickname }}</span>
      <span>{{ fullName }}</span>
    </h2>

    <!-- 2699:275 — Ibarra Real Nova 16/20 Medium Italic, #5c5050. -->
    <p class="bride__parents">{{ parents }}</p>
  </section>
</template>

<style scoped>
.bride {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.bride > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
  text-align: center;
}

.bride__name,
.bride__parents {
  opacity: 0;
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1, 0.28, 1) var(--delay, 0ms);
}

.bride.is-in .bride__name,
.bride.is-in .bride__parents {
  opacity: 1;
  transform: none;
}

/* The alpha hole in 2699:254, in band-local design px. */
.bride__photo {
  position: absolute;
  z-index: 58;
  left: calc(60 * var(--px));
  top: calc(172 * var(--px));
  width: calc(250 * var(--px));
  height: calc(348 * var(--px));
  object-fit: cover;
}

.bride__name {
  --delay: 110ms;
  /* 2699:247's own global Figma order — see SLICING.md, "z-index is the GLOBAL order". */
  z-index: 108;
  left: calc(87 * var(--px));
  top: calc(40 * var(--px));
  width: calc(205 * var(--px));
  font-family: var(--font-heading-script);
  font-size: calc(13 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson);
}

.bride__name span {
  display: block;
}

.bride__parents {
  --delay: 190ms;
  /* 2699:275, above bride's z105 willow sheet. z60 put the line underneath it. */
  z-index: 107;
  left: calc(22 * var(--px));
  top: calc(690 * var(--px));
  width: calc(331 * var(--px));
  white-space: pre-line;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: calc(16 * var(--px));
  line-height: calc(20 * var(--px));
  color: #5c5050;
}

@media (prefers-reduced-motion: reduce) {
  .bride__name,
  .bride__parents {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
