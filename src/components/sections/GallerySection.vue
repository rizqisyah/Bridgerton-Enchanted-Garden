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
 * With no live gallery configured, the plate's own 5 baked photos (main crop + 4
 * thumb crops) become the slide set: nav buttons and the lightbox cycle through
 * them by re-slicing 2712:279 via CSS background-position, scaled up where a
 * thumb crop has to fill the bigger main/lightbox frame — no new assets shipped.
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

// Design mode (no live gallery): the plate's own baked photos become the slide set —
// slide 0 is the pixel-perfect main crop, slides 1-4 are the four thumbnail crops
// stretched up into the main frame. Real button/lightbox nav, no new assets.
const FALLBACK_COUNT = THUMB_XS.length + 1
const slideCount = computed(() => (hasPhotos.value ? photos.value.length : FALLBACK_COUNT))

const active = ref(0)
watch(photos, () => (active.value = 0))
const current = computed(() => photos.value[active.value])

function step(delta: number) {
  const n = slideCount.value
  if (n) active.value = (active.value + delta + n) % n
}

function thumbIndex(i: number) {
  return i % Math.max(photos.value.length, 1)
}

/** CSS to crop the flattened plate down to one slot at its own native size. */
function spriteStyle(offX: number, offY: number) {
  return {
    backgroundImage: `url(${plate})`,
    backgroundSize: `calc(${PLATE_W} * var(--px)) calc(${PLATE_H} * var(--px))`,
    backgroundPosition: `calc(${-offX} * var(--px)) calc(${-offY} * var(--px))`,
    backgroundRepeat: 'no-repeat',
  }
}

/**
 * The thumb crop's own rounded-rect mask (radius 29 on a ~69px box) leaves its bounding
 * box's corners transparent. Stretching that box straight into the ~307px main frame would
 * bleed those transparent corners in as visible wedges, so inset past the mask's curve first
 * (the largest safe rect inside a radius-r rounded corner is inset by r*(1-1/sqrt2)) and
 * scale it uniformly to cover the target box, centred, like object-fit: cover.
 */
function coverCrop(offX: number, offY: number, srcW: number, srcH: number, boxW: number, boxH: number) {
  const inset = 9 // ~= 29 * (1 - 1/sqrt2), the thumb mask's corner radius
  const sx0 = offX + inset
  const sy0 = offY + inset
  const sw = srcW - inset * 2
  const sh = srcH - inset * 2
  const scale = Math.max(boxW / sw, boxH / sh)
  const cx = sx0 + sw / 2
  const cy = sy0 + sh / 2
  return { scale, bgX: boxW / 2 - cx * scale, bgY: boxH / 2 - cy * scale }
}

/** Same crop, scaled up to cover a bigger box (band-local design px), no transparent bleed. */
function spriteStyleFit(offX: number, offY: number, srcW: number, srcH: number, boxW: number, boxH: number) {
  const { scale, bgX, bgY } = coverCrop(offX, offY, srcW, srcH, boxW, boxH)
  return {
    backgroundImage: `url(${plate})`,
    backgroundSize: `calc(${PLATE_W * scale} * var(--px)) calc(${PLATE_H * scale} * var(--px))`,
    backgroundPosition: `calc(${bgX} * var(--px)) calc(${bgY} * var(--px))`,
    backgroundRepeat: 'no-repeat',
  }
}

/** Same crop again, scaled to a fixed plain-px box — for the Teleported lightbox, which
 *  sits outside .sheet's DOM subtree and so can't read --px. */
function spriteStyleFitPx(offX: number, offY: number, srcW: number, srcH: number, boxW: number, boxH: number) {
  const { scale, bgX, bgY } = coverCrop(offX, offY, srcW, srcH, boxW, boxH)
  return {
    backgroundImage: `url(${plate})`,
    backgroundSize: `${PLATE_W * scale}px ${PLATE_H * scale}px`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundRepeat: 'no-repeat',
  }
}

function fallbackMainStyle(idx: number) {
  if (idx <= 0) return spriteStyle(MAIN_OFFSET.x, MAIN_OFFSET.y)
  const t = idx - 1
  return spriteStyleFit(THUMB_OFFSET_X[t], THUMB_OFFSET_Y, 68.82, 70.86, 307.59, 288.73)
}

function fallbackLightboxStyle(idx: number) {
  if (idx <= 0) return spriteStyleFitPx(MAIN_OFFSET.x, MAIN_OFFSET.y, 307.59, 288.73, 300, 280)
  const t = idx - 1
  return spriteStyleFitPx(THUMB_OFFSET_X[t], THUMB_OFFSET_Y, 68.82, 70.86, 300, 280)
}

const zoomed = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
const lightboxRef = ref<HTMLDivElement | null>(null)
let opener: HTMLElement | null = null

/** Opens the lightbox on the currently active photo — the main photo button only. */
function preview(e: MouseEvent) {
  opener = e.currentTarget as HTMLElement
  zoomed.value = true
}

/** Thumbnail click: just selects, matching "thumbnails select the main photo". */
function select(index: number) {
  active.value = index
}

function trapFocus(e: KeyboardEvent) {
  const box = lightboxRef.value
  if (!box) return
  const focusables = box.querySelectorAll<HTMLElement>('button')
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!box.contains(document.activeElement)) {
    e.preventDefault()
    first.focus()
    return
  }
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') zoomed.value = false
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'Tab') trapFocus(e)
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
      <button class="gallery__main" type="button" aria-label="Perbesar foto" @click="preview($event)">
        <img v-if="hasPhotos" :src="current?.src" :alt="current?.caption || 'Foto mempelai'" />
        <span v-else class="gallery__sprite" :style="fallbackMainStyle(active)" />
      </button>

      <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Foto sebelumnya" @click="step(-1)">
        <span aria-hidden="true">&lsaquo;</span>
      </button>
      <button class="gallery__nav gallery__nav--next" type="button" aria-label="Foto berikutnya" @click="step(1)">
        <span aria-hidden="true">&rsaquo;</span>
      </button>

      <button
        v-for="(x, i) in THUMB_XS"
        :key="i"
        class="gallery__thumb"
        type="button"
        :style="{ left: `calc(${x} * var(--px))` }"
        :aria-label="`Lihat foto ${hasPhotos ? thumbIndex(i) + 1 : i + 1}`"
        :aria-current="hasPhotos ? thumbIndex(i) === active : active === i + 1"
        @click="select(hasPhotos ? thumbIndex(i) : i + 1)"
      >
        <img v-if="hasPhotos" :src="photos[thumbIndex(i)].src" alt="" />
        <span v-else class="gallery__sprite" :style="spriteStyle(THUMB_OFFSET_X[i], THUMB_OFFSET_Y)" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="zoomed"
        ref="lightboxRef"
        class="gl-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Pratinjau foto"
        @click.self="zoomed = false"
      >
        <button ref="closeButton" class="gl-lightbox__close" type="button" aria-label="Tutup" @click="zoomed = false">
          &times;
        </button>
        <button class="gl-lightbox__step gl-lightbox__step--prev" type="button" aria-label="Foto sebelumnya" @click="step(-1)">
          &#8249;
        </button>
        <img v-if="hasPhotos" class="gl-lightbox__photo" :src="current?.src" :alt="current?.caption || 'Foto mempelai'" />
        <div
          v-else
          class="gl-lightbox__photo gl-lightbox__photo--sprite"
          role="img"
          aria-label="Foto mempelai"
          :style="fallbackLightboxStyle(active)"
        />
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
  /* Comtic Hiden's line box lands 2-4px below Figma's: these three headings are
     component instances whose text is centred in a taller auto-layout box, so the
     spec's 41.6 leading is not the whole story. Measured ink-box delta against the
     render, not guessed. */
  top: calc(9 * var(--px));
  left: calc(50 * var(--px));
  width: calc(291 * var(--px));
  margin: 0;
  opacity: 0;
  transform: translateY(calc(30 * var(--px))) scale(0.9);
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

.gallery__main img,
.gallery__thumb img,
.gallery__sprite {
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
  color: var(--crimson-title);
  font-size: calc(20 * var(--px));
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 200ms ease,
    transform 200ms ease;
}

.gallery__nav:hover {
  background: #cdbf92;
  transform: scale(1.08);
}

.gallery__nav:active {
  transform: scale(0.94);
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
  transition: transform 200ms ease;
}

.gallery__thumb:hover {
  transform: scale(1.05);
}

.gallery__thumb[aria-current='true'] {
  outline: 2px solid var(--crimson-title);
  outline-offset: 2px;
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

.gl-lightbox__photo--sprite {
  width: 300px;
  height: 280px;
  max-width: min(80vw, 300px);
  max-height: 60vh;
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
  transition: background-color 200ms ease;
}

.gl-lightbox__close:hover,
.gl-lightbox__step:hover {
  background: rgb(255 255 255 / 0.28);
}

.gl-lightbox__close:focus-visible,
.gl-lightbox__step:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.gl-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .gallery__nav,
  .gallery__thumb,
  .gl-lightbox__close,
  .gl-lightbox__step {
    transition: none;
  }
}
</style>
