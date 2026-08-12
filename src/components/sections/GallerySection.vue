<script setup lang="ts">
/*
 * Figma Frame 244 band "gallery", y 8414-9053. Coords are band-local design px.
 *
 * 2712:279 "Group 249" (z188 in gallery.ts) is a single flattened 371x384 raster:
 * a rounded main-photo mask, two nav circles, and four rounded thumbnail masks,
 * all painted with the design's own mock couple photos already baked in — same
 * shape as template-3's gallery plate. It has to come apart here because photos
 * are live data, so it is skipped and rebuilt as a real interactive carousel using
 * the mask geometry recovered from its children (Rectangle 118 x5, all radius 29):
 *
 *   main   x32.05 y74  w307.59 h288.73
 *   nav L  x11.39 y196.63 w40.39 h41.28  fill #dbd0af
 *   nav R  x325.12 y196.63 (same size)
 *   thumbs x 41.49 / 114.78 / 188.07 / 261.36, y370.14, w68.82 h70.86  fill #d9d9d9
 *
 * With no gallery photos configured there is nothing to carousel between, so the
 * fallback re-slices 2712:279's own asset via CSS background-position instead of
 * shipping five new cropped files — pixel-identical to the design, no new assets.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/gallery'

import plate from '../../assets/gallery/parts/2712-279.webp'

const PLATE_W = 371
const PLATE_H = 384
// Each slot's offset into the plate image, in the plate's own local px.
const MAIN_OFFSET = { x: 29.05, y: 4 }
const THUMB_XS = [41.49, 114.78, 188.07, 261.36]
const THUMB_OFFSET_X = [38.49, 111.78, 185.07, 258.36]
const THUMB_OFFSET_Y = 300.14

const { el, shown } = useReveal()
const { gallery } = useWedding()

const photos = computed(() =>
  (gallery.value as any[])
    .map((g) => ({ src: g.image_url as string, caption: (g.caption as string) || '' }))
    .filter((p) => !!p.src),
)
const hasPhotos = computed(() => photos.value.length > 0)

const active = ref(0)
watch(photos, () => (active.value = 0))
const current = computed(() => photos.value[active.value])

function step(delta: number) {
  const n = photos.value.length
  if (n) active.value = (active.value + delta + n) % n
}

function thumbIndex(i: number) {
  return i % Math.max(photos.value.length, 1)
}

/** CSS to crop the flattened plate down to one slot, used only when no photos are configured. */
function spriteStyle(offX: number, offY: number) {
  return {
    backgroundImage: `url(${plate})`,
    backgroundSize: `calc(${PLATE_W} * var(--px)) calc(${PLATE_H} * var(--px))`,
    backgroundPosition: `calc(${-offX} * var(--px)) calc(${-offY} * var(--px))`,
  }
}

const zoomed = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
let opener: HTMLElement | null = null

function preview(e: MouseEvent, index?: number) {
  if (!hasPhotos.value) return
  opener = e.currentTarget as HTMLElement
  if (index !== undefined) active.value = index
  zoomed.value = true
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') zoomed.value = false
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
}

watch(zoomed, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
  await nextTick()
  ;(open ? closeButton.value : opener)?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <section :ref="el" class="gallery" :class="{ 'is-in': shown }" aria-labelledby="gallery-heading">
    <BandArt :layers="LAYERS" :skip="['2712:279']" :shown="shown" />

    <!-- 2712:304 — Comtic Hiden 20/42, #9e0f0f. -->
    <h2 id="gallery-heading" class="gallery__heading">Wedding Gallery</h2>

    <div class="gallery__stage">
      <template v-if="hasPhotos">
        <button class="gallery__main" type="button" aria-label="Perbesar foto" @click="preview($event)">
          <img :src="current.src" :alt="current.caption || 'Foto mempelai'" />
        </button>

        <button
          class="gallery__nav gallery__nav--prev"
          type="button"
          aria-label="Foto sebelumnya"
          @click="step(-1)"
        />
        <button
          class="gallery__nav gallery__nav--next"
          type="button"
          aria-label="Foto berikutnya"
          @click="step(1)"
        />

        <button
          v-for="(x, i) in THUMB_XS"
          :key="i"
          class="gallery__thumb"
          type="button"
          :style="{ left: `calc(${x} * var(--px))` }"
          :aria-label="`Lihat foto ${thumbIndex(i) + 1}`"
          :aria-current="thumbIndex(i) === active"
          @click="preview($event, thumbIndex(i))"
        >
          <img :src="photos[thumbIndex(i)].src" alt="" />
        </button>
      </template>

      <template v-else>
        <div class="gallery__main gallery__main--static" :style="spriteStyle(MAIN_OFFSET.x, MAIN_OFFSET.y)" />
        <div
          v-for="(x, i) in THUMB_XS"
          :key="i"
          class="gallery__thumb gallery__thumb--static"
          :style="{ left: `calc(${x} * var(--px))`, ...spriteStyle(THUMB_OFFSET_X[i], THUMB_OFFSET_Y) }"
        />
      </template>
    </div>

    <Teleport to="body">
      <div v-if="zoomed && current" class="gl-lightbox" role="dialog" aria-modal="true">
        <button ref="closeButton" class="gl-lightbox__close" type="button" aria-label="Tutup" @click="zoomed = false">
          &times;
        </button>
        <button class="gl-lightbox__step gl-lightbox__step--prev" type="button" aria-label="Foto sebelumnya" @click="step(-1)">
          &#8249;
        </button>
        <img class="gl-lightbox__photo" :src="current.src" :alt="current.caption || 'Foto mempelai'" />
        <button class="gl-lightbox__step gl-lightbox__step--next" type="button" aria-label="Foto berikutnya" @click="step(1)">
          &#8250;
        </button>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.gallery__heading {
  position: absolute;
  z-index: 190;
  top: calc(13 * var(--px));
  left: calc(50 * var(--px));
  width: calc(291 * var(--px));
  margin: 0;
  opacity: 0;
  transform: translateY(calc(14 * var(--px)));
  transition:
    opacity 1100ms ease-out,
    transform 1500ms cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(42 * var(--px));
  text-align: center;
  color: var(--crimson-title);
}

.gallery.is-in .gallery__heading {
  opacity: 1;
  transform: none;
}

.gallery__stage {
  position: absolute;
  z-index: 188;
  top: 0;
  left: 0;
  width: calc(375 * var(--px));
  height: calc(639 * var(--px));
  opacity: 0;
  transform: translateY(calc(34 * var(--px))) scale(0.94);
  transition:
    opacity 1200ms ease-out 200ms,
    transform 1400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms;
}

.gallery.is-in .gallery__stage {
  opacity: 1;
  transform: none;
}

.gallery__main,
.gallery__thumb {
  position: absolute;
  padding: 0;
  border: 0;
  overflow: hidden;
  border-radius: calc(29 * var(--px));
  background: #d9d9d9;
  cursor: pointer;
}

.gallery__main {
  top: calc(74 * var(--px));
  left: calc(32.05 * var(--px));
  width: calc(307.59 * var(--px));
  height: calc(288.73 * var(--px));
}

.gallery__main--static,
.gallery__thumb--static {
  cursor: default;
  background-repeat: no-repeat;
}

.gallery__main img,
.gallery__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 10%;
}

.gallery__nav {
  position: absolute;
  top: calc(196.63 * var(--px));
  width: calc(40.39 * var(--px));
  height: calc(41.28 * var(--px));
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #dbd0af;
  cursor: pointer;
}

.gallery__nav--prev {
  left: calc(11.39 * var(--px));
}

.gallery__nav--next {
  left: calc(325.12 * var(--px));
}

.gallery__thumb {
  top: calc(370.14 * var(--px));
  width: calc(68.82 * var(--px));
  height: calc(70.86 * var(--px));
}

.gallery__main:focus-visible,
.gallery__thumb:focus-visible,
.gallery__nav:focus-visible {
  outline: 2px solid var(--olive);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .gallery__heading,
  .gallery__stage {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.gl-lightbox {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: rgb(24 18 14 / 0.92);
}

.gl-lightbox__photo {
  max-width: min(100%, 560px);
  max-height: 86vh;
  object-fit: contain;
  border-radius: 12px;
}

.gl-lightbox__close,
.gl-lightbox__step {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.14);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.gl-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
