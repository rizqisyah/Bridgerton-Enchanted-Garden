<script setup lang="ts">
// Figma Frame 244 band "groom", y 1342-2158. Coords are band-local design px.
import { computed, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { parentLine } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/groom'

const { el, shown } = useReveal(0.15)
const { groom } = useWedding()

/*
 * 2699:211 is the design's illustrated portrait; 2699:212 (z63/z64) is the ornate
 * plate painted ABOVE it, and the transparent hole in that plate is what crops the
 * portrait. The aperture below was measured off the plate's own alpha, the same way
 * HeroSection's was, so a real photo can take the illustration's place when the API
 * has one. photo_url is a cross-origin upload host, so a 404 there would leave a
 * broken image inside the frame -- fall back to the illustration if it fails to load.
 */
const photoFailed = ref(false)
const photo = computed(() =>
  !photoFailed.value ? ((groom.value?.photo_url as string) || '') : '',
)
const artSkip = computed(() => (photo.value ? ['2699:211'] : []))

// 2699:214 is one text node, "Ahmad \nSoetrisno Budianto, S.Pd" -- first name on its
// own line, the rest of the name below. Fallback is the design's exact node text.
const groomName = computed(() => {
  const name = groom.value?.name?.trim()
  if (!name) return 'Ahmad \nSoetrisno Budianto, S.Pd'
  const sp = name.indexOf(' ')
  return sp === -1 ? name : `${name.slice(0, sp)} \n${name.slice(sp + 1)}`
})
const parents = computed(
  () => parentLine(groom.value) || 'Putra Pertama dari  Bapak Hasbih Muhammad  & Ibu Siti Nurhamidin',
)
</script>

<template>
  <section :ref="el" class="groom" :class="{ 'is-in': shown }" aria-labelledby="groom-heading">
    <BandArt :layers="LAYERS" :skip="artSkip" :shown="shown" />

    <img
      v-if="photo"
      :src="photo"
      alt="Foto mempelai"
      class="groom__photo"
      width="250"
      height="348"
      @error="photoFailed = true"
    />

    <!-- 2699:214 -- Comtic Hiden 13/23, #ad2124. No fontsource for Comtic Hiden; see report. -->
    <h2 id="groom-heading" class="groom__name">{{ groomName }}</h2>
    <!-- 2699:244 -- Ibarra Real Nova 16/20 Medium Italic, #5c5050. -->
    <p class="groom__parents">{{ parents }}</p>
  </section>
</template>

<style scoped>
.groom {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.groom > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
  text-align: center;
}

.groom__name,
.groom__parents {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1, 0.28, 1) var(--delay, 0ms);
}

.groom.is-in .groom__name,
.groom.is-in .groom__parents {
  opacity: 1;
  transform: none;
}

/* The alpha hole in 2699:212, in band-local design px. */
.groom__photo {
  position: absolute;
  z-index: 57;
  left: calc(63 * var(--px));
  top: calc(172 * var(--px));
  width: calc(250 * var(--px));
  height: calc(348 * var(--px));
  object-fit: cover;
}

.groom__name {
  --delay: 110ms;
  z-index: 150;
  left: calc(62 * var(--px));
  top: calc(34 * var(--px));
  width: calc(254 * var(--px));
  white-space: pre-line;
  /* Comtic Hiden has no webfont; --font-heading-script is the substitute. */
  font-family: var(--font-heading-script);
  font-size: calc(13 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson);
}

.groom__parents {
  --delay: 190ms;
  z-index: 151;
  left: calc(22 * var(--px));
  top: calc(706 * var(--px));
  width: calc(331 * var(--px));
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: calc(16 * var(--px));
  line-height: calc(20 * var(--px));
  color: #5c5050;
}

@media (prefers-reduced-motion: reduce) {
  .groom__name,
  .groom__parents {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
