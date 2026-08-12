<script setup lang="ts">
import type { BandLayer } from '../../lib/bandLayer'

const props = withDefaults(
  defineProps<{
    layers: BandLayer[]
    /** Layer ids this band draws itself — an API photo standing in for a sliced plate. */
    skip?: string[]
    /** Whether the band has scrolled into view; layers hold still until it has. */
    shown?: boolean
    /** Stagger between layers, back to front. Capped so a 36-layer band still lands. */
    step?: number
  }>(),
  { skip: () => [], shown: true, step: 45 },
)

const visible = () => props.layers.filter((l) => !props.skip.includes(l.id))
</script>

<template>
  <img
    v-for="(layer, i) in visible()"
    :key="layer.id"
    class="band-art"
    :class="{ 'is-in': shown }"
    :src="layer.src"
    alt=""
    :width="layer.w"
    :height="layer.h"
    loading="lazy"
    decoding="async"
    :style="{
      zIndex: layer.z,
      left: `calc(${layer.x} * var(--px))`,
      top: `calc(${layer.y} * var(--px))`,
      width: `calc(${layer.w} * var(--px))`,
      height: `calc(${layer.h} * var(--px))`,
      transitionDelay: `${Math.min(i * step, 700)}ms`,
    }"
  />
</template>

<style scoped>
/*
 * Transition rather than animation: the band is gated on scrolling into view, and a
 * transition can be held in its start state by a class without the reflow tricks
 * pausing an animation needs.
 */
.band-art {
  position: absolute;
  max-width: none; /* several layers are authored wider than the 375px frame */
  opacity: 0;
  transform: translateY(calc(14 * var(--px)));
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.band-art.is-in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .band-art {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
