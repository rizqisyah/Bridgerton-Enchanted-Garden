<script setup lang="ts">
// Figma Frame 244 band "akad", y 3958-4946. Coords are band-local design px.
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { formatEventDate, formatEventTime } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/akad'

const { el, shown } = useReveal(0.15)
const { acara } = useWedding()

/*
 * `acara` is a flat, ordered list with no type/category field to key off, so this
 * mirrors template-3's CeremonyBand: positional index into the list. Index 0 is
 * Akad, 1 is Resepsi (see ResepsiSection.vue). An empty list, or a list with only
 * one entry, leaves `event` null and every field below falls back to the design's
 * own copy -- nothing breaks, the card just prints Frame 244's placeholder wedding.
 */
const event = computed(() => (acara.value as any[])[0] ?? null)

const when = computed(() => formatEventDate(event.value?.event_date))
const dateText = computed(() => (when.value ? `${when.value.weekday}, ${when.value.date}` : 'Minggu, 2 Agustus 2026'))
const timeText = computed(() => formatEventTime(event.value?.event_time) || '12.00 - 13.00 WIB')
const venueText = computed(() => event.value?.location_name || 'Kediaman Mempelai Wanita')
const addressText = computed(
  () =>
    event.value?.address ||
    'Jl. Melati Raya No. 27, RT 004/RW 006, Kelurahan Cikini, Kecamatan Menteng, Jakarta Pusat, DKI Jakarta 10330',
)
const mapsUrl = computed(() => event.value?.maps_url || '')
</script>

<template>
  <section :ref="el" class="akad" :class="{ 'is-in': shown }" aria-labelledby="akad-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2706:158 -- Comtic Hiden 20/23, var(--crimson-heading). No fontsource for Comtic Hiden; see report. -->
    <h2 id="akad-heading" class="akad__heading">Akad Nikah</h2>
    <!-- 2706:159 -- Libre Caslon Condensed 15/23 Italic, #000. -->
    <p class="akad__date">{{ dateText }}</p>
    <!-- 2706:160 -->
    <p class="akad__time">{{ timeText }}</p>
    <!-- 2706:161 -->
    <p class="akad__venue">{{ venueText }}</p>
    <!-- 2706:162 -- Libre Caslon Condensed 11/23 Italic, #000. -->
    <p class="akad__address">{{ addressText }}</p>

    <!-- Pill art is 2706:163, painted by BandArt above (z167). 2706:164 is the live label. -->
    <a v-if="mapsUrl" class="akad__maps" :href="mapsUrl" target="_blank" rel="noopener noreferrer">Maps</a>
    <span v-else class="akad__maps akad__maps--off">Maps</span>
  </section>
</template>

<style scoped>
.akad {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.akad > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
  text-align: center;
}

.akad__heading,
.akad__date,
.akad__time,
.akad__venue,
.akad__address,
.akad__maps {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
}

.akad.is-in .akad__heading,
.akad.is-in .akad__date,
.akad.is-in .akad__time,
.akad.is-in .akad__venue,
.akad.is-in .akad__address,
.akad.is-in .akad__maps {
  opacity: 1;
  transform: none;
}

.akad__heading {
  --delay: 70ms;
  z-index: 157;
  left: calc(66 * var(--px));
  top: calc(442 * var(--px));
  width: calc(243 * var(--px));
  /* Comtic Hiden has no webfont; --font-heading-script is the substitute. */
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson-heading);
}

.akad__date {
  --delay: 120ms;
  z-index: 159;
  left: calc(66 * var(--px));
  top: calc(487 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.akad__time {
  --delay: 160ms;
  z-index: 161;
  left: calc(66 * var(--px));
  top: calc(537 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.akad__venue {
  --delay: 210ms;
  z-index: 163;
  left: calc(70 * var(--px));
  top: calc(587 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.akad__address {
  --delay: 250ms;
  z-index: 165;
  left: calc(86 * var(--px));
  top: calc(610 * var(--px));
  width: calc(203 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(11 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.akad__maps {
  --delay: 300ms;
  z-index: 169;
  left: calc(162 * var(--px));
  top: calc(698 * var(--px));
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(51 * var(--px));
  height: calc(22 * var(--px));
  border-radius: calc(6 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(11 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
  text-decoration: none;
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 240ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 240ms ease-out;
}

.akad.is-in .akad__maps {
  transform: none;
}

.akad__maps:hover,
.akad__maps:focus-visible {
  filter: brightness(1.08);
  transform: translateY(calc(-1 * var(--px)));
}

.akad__maps:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

.akad__maps--off {
  cursor: default;
}

@media (prefers-reduced-motion: reduce) {
  .akad__heading,
  .akad__date,
  .akad__time,
  .akad__venue,
  .akad__address,
  .akad__maps {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
