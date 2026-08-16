<script setup lang="ts">
import { COVER_LAYERS } from '../../lib/coverLayers'

// `ready` gates the reveal on the 36 layers being decoded — see App.vue.
defineProps<{ guestName: string; coupleName: string; ready: boolean }>()
defineEmits<{ open: [] }>()

/*
 * The chateau backdrop and the deep garden layers get a longer, later rise than the
 * foreground florals so the scene assembles from the back forward. Everything else
 * is placed straight from the Figma table.
 */
const delayFor = (z: number) => Math.min(z * 38, 1080)
</script>

<template>
  <!-- Figma Frame 243 (2684:108), 375 x 725. Coords below are frame-local design px. -->
  <section class="cover">
    <div class="cover__frame" :class="{ 'cover__frame--ready': ready }">
      <img
        v-for="layer in COVER_LAYERS"
        :key="layer.id"
        class="cover__layer"
        :src="layer.src"
        alt=""
        :width="layer.w"
        :height="layer.h"
        :style="{
          zIndex: layer.z,
          left: `calc(${layer.x} * var(--px))`,
          top: `calc(${layer.y} * var(--px))`,
          width: `calc(${layer.w} * var(--px))`,
          height: `calc(${layer.h} * var(--px))`,
          animationDelay: `${delayFor(layer.z)}ms`,
        }"
      />

      <!-- Group 251 (2695:152) — z 17 in Figma child order. -->
      <p class="cover__eyebrow">The Wedding Of</p>
      <h1 class="cover__couple">{{ coupleName }}</h1>

      <!-- Group 250 (2695:151) — z 18. -->
      <p class="cover__dear">Dear Mr/ Mrs/ Ms</p>
      <p class="cover__guest">{{ guestName }}</p>

      <!-- 2695:153 — z 37, above the monogram, below the foreground florals. -->
      <button type="button" class="cover__open" @click="$emit('open')">Click to open</button>
    </div>
  </section>
</template>

<style scoped>
.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--paper);
}

/*
 * One design pixel = 1cqw / 3.75, so the whole composition scales as a unit
 * instead of reflowing. Width is driven purely by the viewport height so the
 * card always fills the screen exactly; on screens that are too narrow for
 * that width, `.cover`'s `overflow: hidden` crops the sides evenly. The
 * 725px-tall design on a 375px frame is squatter than real phones, so a
 * height-derived width is what closes the bottom gap. `overflow: hidden` is
 * what clips the layers that bleed past the 375px frame — several florals are
 * authored well outside it on purpose.
 */
.cover__frame {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  /* flex-shrink: 0 — otherwise the 430px column squashes the width-driven frame back down */
  flex: 0 0 auto;
  width: calc(100dvh * 375 / 725);
  aspect-ratio: 375 / 725;
  background: var(--paper);
}

.cover__frame > * {
  --px: 0.26667cqw; /* 100cqw / 375 */
  position: absolute;
  margin: 0;
  text-align: center;
  /*
   * Held until the layers are decoded. `animation-play-state` rather than `display`
   * so the images are still in the document and actually fetching while hidden.
   */
  visibility: hidden;
  animation-play-state: paused;
}

.cover__frame--ready > * {
  visibility: visible;
  animation-play-state: running;
}

.cover__layer {
  max-width: none; /* the bleeding layers are wider than the frame by design */
  animation: rise 2200ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

/*
 * `backwards`, not `forwards`: the end state is the element's normal state, so once
 * the animation finishes it stops applying and hover transitions get their transform back.
 */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(calc(18 * var(--px)));
  }
}

.cover__eyebrow,
.cover__couple,
.cover__dear,
.cover__guest,
.cover__open {
  animation: rise 2400ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms) backwards;
}

/* 2684:114 — Taldose Script 20/30, #72703d. */
.cover__eyebrow {
  --delay: 1100ms;
  z-index: 17;
  top: calc(288 * var(--px));
  left: calc(53 * var(--px));
  width: calc(269 * var(--px));
  font-family: var(--font-script);
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: var(--olive);
}

/* 2684:116 — Norveil Fantasy Demo 48/47, -6% tracking, #ad2124. */
.cover__couple {
  --delay: 1400ms;
  z-index: 17;
  top: calc(320 * var(--px));
  left: calc(43 * var(--px));
  width: calc(289 * var(--px));
  font-family: var(--font-display);
  font-size: calc(48 * var(--px));
  font-weight: 400;
  line-height: calc(47 * var(--px));
  letter-spacing: -0.06em;
  text-transform: uppercase;
  color: var(--crimson);
}

/* 2684:118 — Ibarra Real Nova 14 Medium Italic, #790707. */
.cover__dear {
  --delay: 1700ms;
  z-index: 18;
  top: calc(469 * var(--px));
  left: calc(92 * var(--px));
  width: calc(193 * var(--px));
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: calc(14 * var(--px));
  line-height: calc(25 * var(--px));
  color: var(--crimson-deep);
}

/* 2684:113 — Ibarra Real Nova 16 Medium Italic, #790707. */
.cover__guest {
  --delay: 1880ms;
  z-index: 18;
  top: calc(490 * var(--px));
  left: calc(107 * var(--px));
  width: calc(163 * var(--px));
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: calc(16 * var(--px));
  line-height: calc(25 * var(--px));
  color: var(--crimson-deep);
}

/* 2695:153 — Jost 15/30, +2% tracking, #ac6f28. */
.cover__open {
  --delay: 2100ms;
  z-index: 37;
  top: calc(540 * var(--px));
  left: calc(121 * var(--px));
  width: calc(133 * var(--px));
  border: 0;
  background: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: calc(15 * var(--px));
  line-height: calc(30 * var(--px));
  letter-spacing: 0.02em;
  color: var(--gold-brown);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease;
}

.cover__open:hover,
.cover__open:focus-visible {
  transform: translateY(calc(-2 * var(--px)));
  opacity: 0.82;
}

@media (prefers-reduced-motion: reduce) {
  .cover__frame > * {
    animation: none;
  }
}
</style>
