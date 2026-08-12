<script setup lang="ts">
// Figma Frame 244 band "resepsi", y 4946-6021. Coords are band-local design px.
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { formatEventDate, formatEventTime } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/resepsi'

const { el, shown } = useReveal(0.15)
const { acara } = useWedding()

/*
 * Same positional read as AkadSection: `acara` carries no type/category field, so
 * Resepsi is index 1 (Akad is index 0), mirroring template-3's CeremonyBand. If
 * the list is empty or has a single entry, `event` is null and every field below
 * falls back to Frame 244's own placeholder copy.
 */
const event = computed(() => (acara.value as any[])[1] ?? null)

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
  <section :ref="el" class="resepsi" :class="{ 'is-in': shown }" aria-labelledby="resepsi-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2712:172 -- Comtic Hiden 20/23, var(--crimson-heading). No fontsource for Comtic Hiden; see report. -->
    <h2 id="resepsi-heading" class="resepsi__heading">Resepsi Nikah</h2>
    <!-- 2712:173 -- Libre Caslon Condensed 15/23 Italic, #000. -->
    <p class="resepsi__date">{{ dateText }}</p>
    <!-- 2712:174 -->
    <p class="resepsi__time">{{ timeText }}</p>
    <!-- 2712:175 -->
    <p class="resepsi__venue">{{ venueText }}</p>
    <!-- 2712:176 -- Libre Caslon Condensed 11/23 Italic, #000. -->
    <p class="resepsi__address">{{ addressText }}</p>

    <!-- Pill art is 2712:177, painted by BandArt above (z168). 2712:178 is the live label. -->
    <a v-if="mapsUrl" class="resepsi__maps" :href="mapsUrl" target="_blank" rel="noopener noreferrer">Maps</a>
    <span v-else class="resepsi__maps resepsi__maps--off">Maps</span>
  </section>
</template>

<style scoped>
.resepsi {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.resepsi > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
  text-align: center;
}

.resepsi__heading,
.resepsi__date,
.resepsi__time,
.resepsi__venue,
.resepsi__address,
.resepsi__maps {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
}

.resepsi.is-in .resepsi__heading,
.resepsi.is-in .resepsi__date,
.resepsi.is-in .resepsi__time,
.resepsi.is-in .resepsi__venue,
.resepsi.is-in .resepsi__address,
.resepsi.is-in .resepsi__maps {
  opacity: 1;
  transform: none;
}

.resepsi__heading {
  --delay: 70ms;
  z-index: 158;
  left: calc(60 * var(--px));
  top: calc(442 * var(--px));
  width: calc(243 * var(--px));
  /* Comtic Hiden has no webfont; --font-heading-script is the substitute. */
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(23 * var(--px));
  color: var(--crimson-heading);
}

.resepsi__date {
  --delay: 120ms;
  z-index: 160;
  left: calc(60 * var(--px));
  top: calc(487 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.resepsi__time {
  --delay: 160ms;
  z-index: 162;
  left: calc(60 * var(--px));
  top: calc(537 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.resepsi__venue {
  --delay: 210ms;
  z-index: 164;
  left: calc(64 * var(--px));
  top: calc(587 * var(--px));
  width: calc(243 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(15 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.resepsi__address {
  --delay: 250ms;
  z-index: 166;
  left: calc(80 * var(--px));
  top: calc(610 * var(--px));
  width: calc(203 * var(--px));
  font-family: var(--font-condensed);
  font-style: italic;
  font-size: calc(11 * var(--px));
  line-height: calc(23 * var(--px));
  color: #000;
}

.resepsi__maps {
  --delay: 300ms;
  z-index: 170;
  left: calc(156 * var(--px));
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

.resepsi.is-in .resepsi__maps {
  transform: none;
}

.resepsi__maps:hover,
.resepsi__maps:focus-visible {
  filter: brightness(1.08);
  transform: translateY(calc(-1 * var(--px)));
}

.resepsi__maps:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

.resepsi__maps--off {
  cursor: default;
}

@media (prefers-reduced-motion: reduce) {
  .resepsi__heading,
  .resepsi__date,
  .resepsi__time,
  .resepsi__venue,
  .resepsi__address,
  .resepsi__maps {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
