<script setup lang="ts">
// The invitation sheet: Figma Frame 244, 375 x 9866.
// One component per band of the frame, in Figma order; each one positions its own
// children relative to its own top, so inserting a band never renumbers the others.
// Band map and asset inventory: ../../../SLICING.md
import HeroSection from '../sections/HeroSection.vue'
import QuoteSection from '../sections/QuoteSection.vue'
import InviteSection from '../sections/InviteSection.vue'
import GroomSection from '../sections/GroomSection.vue'
import DividerSection from '../sections/DividerSection.vue'
import BrideSection from '../sections/BrideSection.vue'
import CountdownSection from '../sections/CountdownSection.vue'
import TheDaySection from '../sections/TheDaySection.vue'
import AkadSection from '../sections/AkadSection.vue'
import ResepsiSection from '../sections/ResepsiSection.vue'
import GiftSection from '../sections/GiftSection.vue'
import RsvpSection from '../sections/RsvpSection.vue'
import WishSection from '../sections/WishSection.vue'
import GallerySection from '../sections/GallerySection.vue'
import FooterSection from '../sections/FooterSection.vue'
</script>

<template>
  <div class="sheet">
    <HeroSection />
    <QuoteSection />
    <InviteSection />
    <GroomSection />
    <DividerSection />
    <BrideSection />
    <CountdownSection />
    <TheDaySection />
    <AkadSection />
    <ResepsiSection />
    <GiftSection />
    <RsvpSection />
    <WishSection />
    <GallerySection />
    <FooterSection />
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
  /*
   * Frame 244's base plate (2695:162) is a single colour across all 14.8M pixels,
   * so it is this background rather than a 19732px-tall asset.
   */
  background: #f3ece2;
}

.sheet > * {
  --px: 0.26667cqw;
}
</style>
