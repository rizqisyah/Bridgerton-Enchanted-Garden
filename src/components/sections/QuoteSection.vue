<script setup lang="ts">
// Figma Frame 244 band "quote", y 709-1251. Coords are band-local design px.
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/quote'

const { el, shown } = useReveal(0.15)
const { quoteText, quoteVerse } = useWedding()
</script>

<template>
  <section :ref="el" class="quote" :class="{ 'is-in': shown }" aria-labelledby="quote-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2697:201 -- Roben Elegante 10/13 Script, #4b4742. No fontsource for Roben Elegante; see report. -->
    <p id="quote-heading" class="quote__text">&ldquo;{{ quoteText }}&rdquo;</p>
    <!-- 2697:200 -- Roben Elegante 13/48 Script, #3b3835. -->
    <p class="quote__verse">{{ quoteVerse }}</p>
  </section>
</template>

<style scoped>
.quote {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.quote > * {
  position: absolute;
  margin: 0;
}

.quote__text,
.quote__verse {
  opacity: 0;
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  transition:
    opacity 1900ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms),
    transform 2600ms cubic-bezier(0.16, 1.02, 0.28, 1) var(--delay, 0ms);
}

.quote.is-in .quote__text,
.quote.is-in .quote__verse {
  opacity: 1;
  transform: none;
}

.quote__text {
  --delay: 240ms;
  z-index: 250;
  left: calc(48 * var(--px));
  top: calc(65 * var(--px));
  width: calc(230 * var(--px));
  text-align: left;
  /* Roben Elegante has no webfont; --font-quote (EB Garamond) is the closest stand-in on hand. */
  font-family: var(--font-quote);
  font-size: calc(10 * var(--px));
  line-height: calc(13 * var(--px));
  color: #4b4742;
}

.quote__verse {
  --delay: 380ms;
  z-index: 251;
  left: calc(16 * var(--px));
  top: calc(162 * var(--px));
  width: calc(185 * var(--px));
  text-align: center;
  font-family: var(--font-quote);
  font-size: calc(13 * var(--px));
  line-height: calc(48 * var(--px));
  color: #3b3835;
}

@media (prefers-reduced-motion: reduce) {
  .quote__text,
  .quote__verse {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
