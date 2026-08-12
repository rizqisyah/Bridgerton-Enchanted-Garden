<script setup lang="ts">
// Figma Frame 244 band "invite", y 1251-1342. Coords are band-local design px.
// Text-only band -- no plate art of its own; the garden/spires seen behind it in the
// bandspec crop belong to the neighbouring hero/groom bands and bleed into this strip.
import { useReveal } from '../../composables/useReveal'

const BAND_HEIGHT = 91

const { el, shown } = useReveal(0.15)
</script>

<template>
  <section :ref="el" class="invite" :class="{ 'is-in': shown }" aria-label="Undangan">
    <!-- 2699:209 -- Ibarra Real Nova 13/20 Medium Italic, #5c5050. Design's own boilerplate copy. -->
    <p class="invite__text">
      Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/I untuk menghadiri
      acara
      <br />
      Pernikahan kami:
    </p>
  </section>
</template>

<style scoped>
.invite {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.invite > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
}

.invite__text {
  opacity: 0;
  transform: translateY(calc(10 * var(--px)));
  transition:
    opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 1800ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
  --delay: 70ms;
  z-index: 1;
  left: calc(9 * var(--px));
  top: 0;
  width: calc(358 * var(--px));
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: calc(13 * var(--px));
  line-height: calc(20 * var(--px));
  color: #5c5050;
}

.invite.is-in .invite__text {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .invite__text {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
