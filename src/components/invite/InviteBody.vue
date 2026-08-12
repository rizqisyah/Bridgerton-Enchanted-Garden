<script setup lang="ts">
// The invitation sheet: Figma Frame 244, 375 x 9866.
// One component per band of the frame; each one positions its own children
// relative to its own top, so inserting a band never renumbers the others.
// Band map and asset inventory: ../../../SLICING.md
import HeroSection from '../sections/HeroSection.vue'
</script>

<template>
  <div class="sheet">
    <!--
      Bands land here in Figma order, walking .figma-ref/frame244-zorder.json:
      hero, quote, invite, groom, divider, bride, countdown, theday, akad,
      resepsi, gift, rsvp, wish, gallery, footer.
    -->
    <HeroSection />
    <p class="sheet__placeholder">quote &rarr; footer: not sliced yet.</p>
  </div>
</template>

<style scoped>
/*
 * One design pixel = 1cqw / 3.75, same unit CoverSection uses. Declared once here
 * so every band inherits it and can place children in raw Figma coordinates.
 */
.sheet {
  container-type: inline-size;
  position: relative;
  /*
   * Full-bleed: the sheet fills its column edge to edge. The cap lives on
   * `.desktop-right-column` instead — capping it here would leave cream gutters
   * either side of the art between --card-max and the 768px breakpoint.
   */
  width: 100%;
  overflow: hidden;
  background: var(--paper);
}

.sheet > * {
  --px: 0.26667cqw;
}

.sheet__placeholder {
  padding: 6rem 1.5rem;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--crimson-deep);
}
</style>
