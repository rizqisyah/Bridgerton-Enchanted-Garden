<script setup lang="ts">
/*
 * Figma Frame 244 band "wish", y 7496-8414. Coords are band-local design px.
 *
 * Group 2712:257 holds the heading plus two real form frames: 2712:260 "Input"
 * (Nama) and 2712:261 "Textarea" (Give your wish) — flat #ffffff plates at radius
 * 10 with 1px strokes, no live text of their own beyond an italic 50%-black
 * placeholder string, so they ship as a real <input>/<textarea>. The round send
 * icon (2729:126) sits inside the textarea's own box at its declared offset
 * (x250 y3 relative to the textarea) and becomes the submit button.
 *
 * 2729:127 ("vdsvdsv 1", z224 in wish.ts) is the wishes PANEL — but it is a single
 * flattened 327x532 raster baking in four mock comment cards AND a "Show more
 * comments" pill, with no TEXT nodes behind any of it (unlike gift's cards, which
 * are live groups). It is mock content the same way the RSVP form's pre-filled
 * plates are, so it is skipped here and rebuilt as a live, scrollable list — new
 * wishes posted through sendWish have to actually appear, which a raster can't do.
 * The card colours below are read off the render's own pixels (sampled from
 * wish.png), not off a Figma TEXT node — none exists to sample instead.
 */
import { computed, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { DESIGN_MODE } from '../../lib/api'
import { relativeTime } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/wish'

import sendIcon from '../../assets/wish/parts/2729-126.webp'

type Wish = {
  id?: string | number
  guest_name?: string
  message?: string
  created_at?: string | null
  /** Design-only: the reference cards print an absolute date with no timestamp behind it. */
  time?: string
}

/* Frame 244's own four cards, transcribed off wish.png — an unconfigured render matches it. */
const FALLBACK: Wish[] = [
  {
    id: 'd1',
    guest_name: 'Woro & Suami',
    time: '24 Jun 2026, 10:10',
    message:
      'Dear mba Pungky dan mas Mike selamat atas pernikahannya💐 smoga selalu bahagia dan menjadi keluarga yg samawa.. Aamiin YRA🤲 Mohon maaf y mba aku g bisa dtg🙏 InsyaAllah kalau ada rezekinya nnt bisa ketemuan🥰',
  },
  {
    id: 'd2',
    guest_name: 'Tante Titin & Bani',
    time: '23 Jun 2026, 16:07',
    message: 'Untuk Pungky dan Mike selamat menikah, semoga langgeng dan bahagia selalu.',
  },
  {
    id: 'd3',
    guest_name: 'Yanna & Suami',
    time: '23 Jun 2026, 10:56',
    message: 'Congrats to Mike & Paulina, semoga selalu bahagia & diberkahi Allah..Aamiin! Yana & Seto',
  },
  {
    id: 'd4',
    guest_name: 'Putri & Widi',
    time: '22 Jun 2026, 20:55',
    message: 'Dear Paulina and Michael, wishing you a wonderful wedding, blessed marriage, full of love and laughter.',
  },
  /* Past the render's own 4 cards — held back behind "Show more comments" so the pill has
     something real to reveal instead of sitting there as decoration. */
  {
    id: 'd5',
    guest_name: 'Rian & Keluarga',
    time: '21 Jun 2026, 09:32',
    message: 'Selamat menempuh hidup baru Ahmad & Salma, semoga sakinah mawaddah warahmah🤍',
  },
  {
    id: 'd6',
    guest_name: 'Dewi Anggraini',
    time: '20 Jun 2026, 19:14',
    message: 'Barakallahu lakuma wa baraka alaikuma, happy wedding!',
  },
]

const WISH_PAGE_SIZE = 4

const { el, shown } = useReveal()
const { wishes, sendWish, guest } = useWedding()

const list = computed<Wish[]>(() => {
  const live = (wishes.value as Wish[]).filter((w) => w.guest_name || w.message)
  if (!live.length) return FALLBACK
  /*
   * In design mode the only live wishes are ones posted in this session, and they
   * must not wipe out the design's own cards -- the band is meant to look like the
   * frame. Newest first, then the design's four. With real data the API list is
   * authoritative and the fallback drops out.
   */
  return DESIGN_MODE ? [...live, ...FALLBACK] : live
})

const shownCount = ref(WISH_PAGE_SIZE)
const visible = computed(() => list.value.slice(0, shownCount.value))
const hasMore = computed(() => shownCount.value < list.value.length)
const showMore = () => {
  shownCount.value += WISH_PAGE_SIZE
}

const stamp = (w: Wish) => w.time ?? relativeTime(w.created_at)

const name = ref(String((guest.value as any)?.name ?? ''))
const message = ref('')
const submitting = ref(false)
const error = ref('')
const sent = ref(false)

async function submit() {
  if (!name.value.trim()) {
    error.value = 'Nama wajib diisi.'
    return
  }
  if (!message.value.trim()) {
    error.value = 'Ucapan wajib diisi.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await sendWish({ guest_name: name.value.trim(), message: message.value.trim() })
    message.value = ''
    sent.value = true
  } catch (err: any) {
    error.value = err?.message || 'Gagal mengirim ucapan. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section :ref="el" class="wish" :class="{ 'is-in': shown }" aria-labelledby="wish-heading">
    <BandArt :layers="LAYERS" :skip="['2729:127']" :shown="shown" />

    <!-- 2712:258 — Comtic Hiden 20/42, #9e0f0f. -->
    <h2 id="wish-heading" class="wish__heading">Wedding Wish</h2>

    <form class="wish__form" novalidate @submit.prevent="submit">
      <label class="wish__sr" for="wish-name">Nama</label>
      <input
        id="wish-name"
        v-model="name"
        class="wish__field wish__field--name"
        type="text"
        placeholder="Nama"
        autocomplete="name"
        required
      />

      <label class="wish__sr" for="wish-message">Ucapan</label>
      <textarea
        id="wish-message"
        v-model="message"
        class="wish__field wish__field--message"
        placeholder="Give your wish"
        required
      ></textarea>
      <button class="wish__send" type="submit" :disabled="submitting" aria-label="Kirim ucapan">
        <img :src="sendIcon" alt="" width="33" height="33" />
      </button>

      <p v-if="error" class="wish__error" role="alert">{{ error }}</p>
    </form>

    <p class="wish__sr" aria-live="polite">{{ sent ? 'Ucapan Anda sudah terkirim.' : '' }}</p>

    <!-- Replaces 2729:127 (skipped above): a live list instead of a raster, "Show more
         comments" (also baked into that raster) rebuilt as a real button that pages
         the list in, instead of the scrollbar the raster's fixed-height box implied. -->
    <div class="wish__panel">
      <ul class="wish__list">
        <li v-for="(w, i) in visible" :key="w.id ?? i" class="wish__card">
          <p class="wish__row">
            <span class="wish__name">{{ w.guest_name }}</span>
            <span class="wish__time">{{ stamp(w) }}</span>
          </p>
          <p class="wish__message">{{ w.message }}</p>
        </li>
      </ul>
      <button v-if="hasMore" type="button" class="wish__more" @click="showMore">
        Show more comments
      </button>
    </div>
  </section>
</template>

<style scoped>
.wish {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.wish > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
}

.wish img {
  pointer-events: none;
}

.wish__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.wish__heading,
.wish__form,
.wish__panel {
  opacity: 0;
  transition:
    opacity 1100ms ease-out var(--in, 0ms),
    transform 1500ms cubic-bezier(0.16, 1, 0.3, 1) var(--in, 0ms);
}

.wish.is-in .wish__heading,
.wish.is-in .wish__form,
.wish.is-in .wish__panel {
  opacity: 1;
  transform: none;
}

.wish__heading {
  --in: 0ms;
  z-index: 187;
  top: 0;
  left: calc(69 * var(--px));
  width: calc(238.5 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  /* Spec's 42px line-height is Comtic Hiden's own metric; Sacramento (the
     substitute, no fontsource for Comtic Hiden) carries far less internal
     leading at the same size, so 42 stacks ~6px of blank half-leading above
     the ink. Tightened to the substitute's natural leading, same fix as
     FooterSection's heading. */
  line-height: calc(30 * var(--px));
  text-align: center;
  color: var(--crimson-title);
}

.wish__form {
  --in: 200ms;
  z-index: 187;
  top: 0;
  left: 0;
  width: calc(375 * var(--px));
  height: calc(130 * var(--px));
  transform: translateY(calc(10 * var(--px)));
}

.wish__form > * {
  position: absolute;
}

.wish__field {
  padding: calc(7 * var(--px)) calc(12 * var(--px));
  border: calc(1 * var(--px)) solid;
  border-radius: calc(10 * var(--px));
  background: #ffffff;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: calc(16 * var(--px));
  line-height: calc(22.4 * var(--px));
  color: #4d4d2d;
}

.wish__field::placeholder {
  color: rgb(0 0 0 / 0.5);
}

.wish__field:focus-visible {
  outline: calc(2 * var(--px)) solid #4d4d2d;
  outline-offset: calc(2 * var(--px));
}

.wish__field--name {
  top: calc(44 * var(--px));
  left: calc(39 * var(--px));
  width: calc(286 * var(--px));
  height: calc(29 * var(--px));
  border-color: #496c59;
}

.wish__field--message {
  top: calc(86 * var(--px));
  left: calc(39 * var(--px));
  width: calc(286 * var(--px));
  height: calc(43 * var(--px));
  padding-right: calc(48 * var(--px));
  border-color: #5b7d4a;
  resize: none;
}

/* 2729:126 — a 33x33 circle sitting inside the textarea's own box, x250 y3 relative to it. */
.wish__send {
  top: calc(89 * var(--px));
  left: calc(289 * var(--px));
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(33 * var(--px));
  height: calc(33 * var(--px));
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.wish__send img {
  width: 100%;
  height: 100%;
}

.wish__send:hover:not(:disabled),
.wish__send:focus-visible {
  transform: scale(1.06);
}

.wish__send:active:not(:disabled) {
  transform: scale(0.94);
}

.wish__send:disabled {
  cursor: progress;
  opacity: 0.7;
}

.wish__error {
  top: calc(132 * var(--px));
  left: calc(39 * var(--px));
  width: calc(286 * var(--px));
  font-family: var(--font-serif);
  font-size: calc(12 * var(--px));
  line-height: calc(14 * var(--px));
  text-align: center;
  color: #7a2f2f;
}

/*
 * 2729:127's own raster ran x24 y145 w327 h532 (measured off wish.png: cards start
 * y152, last card ends y624, the button itself spans y635-670, x44-328). A fixed
 * 500px scroller doesn't match that — the render shows 4 cards and a pill in normal
 * flow with no scrollbar, so height is auto here and the list grows into it instead.
 */
.wish__panel {
  --in: 400ms;
  z-index: 224;
  top: calc(145 * var(--px));
  left: calc(24 * var(--px));
  width: calc(327 * var(--px));
  transform: translateY(calc(20 * var(--px)));
}

.wish__list {
  display: flex;
  flex-direction: column;
  /*
   * The band is a fixed 918px box, and the panel starts at y145 -- so a list that
   * grows (every "Show more", every wish posted in-session) used to paint straight
   * over the gallery band below. Capped at the render's own panel height, 532, which
   * is what its four default cards occupy: at rest there is nothing to scroll and the
   * band still matches the frame, and only the 5th card onward scrolls. 145 + 532
   * leaves 241 of the band's 773 usable rows for the pill and the error line.
   */
  max-height: calc(532 * var(--px));
  overflow-y: auto;
  overscroll-behavior: contain;
  /* ~7px between cards in the render (measured gaps: 6, 8, 7px). */
  gap: calc(7 * var(--px));
  margin: 0;
  /* 15px each side lands the cards at x39 — the same left edge as the Nama/textarea
     fields above, which is exactly what the render does. */
  padding: 0 calc(15 * var(--px));
  list-style: none;
}

/* Colour and padding sampled off wish.png's own pixels — there is no TEXT node behind
   these mock cards. Vertical padding measured ~19px top / ~17px bottom around the name
   row and message text in card 2 of the render. */
.wish__card {
  padding: calc(18 * var(--px)) calc(16 * var(--px));
  border-radius: calc(14 * var(--px));
  background: #f4e7d4;
}

.wish__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: calc(8 * var(--px));
  margin: 0;
}

.wish__name {
  font-family: var(--font-body);
  font-size: calc(14 * var(--px));
  line-height: calc(20 * var(--px));
  font-weight: 700;
  color: var(--olive);
}

.wish__time {
  flex: none;
  font-family: var(--font-quote);
  font-size: calc(11 * var(--px));
  line-height: calc(20 * var(--px));
  color: #8a8060;
}

.wish__message {
  margin: calc(4 * var(--px)) 0 0;
  font-family: var(--font-quote);
  font-size: calc(13 * var(--px));
  line-height: calc(18 * var(--px));
  color: #3a3020;
  overflow-wrap: break-word;
}

/* Rebuilds the pill baked into 2729:127 — its colour is sampled off wish.png the same
   way the card background is; there's no TEXT/fill node behind it to read a token from.
   margin-top tuned against the render's own button position (measured y635, x44-328). */
.wish__more {
  display: block;
  width: 100%;
  margin: calc(30 * var(--px)) 0 0;
  padding: calc(9 * var(--px)) 0;
  border: 0;
  border-radius: calc(999 * var(--px));
  background: #788064;
  font-family: var(--font-sans);
  font-size: calc(14 * var(--px));
  line-height: calc(18 * var(--px));
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.wish__more:hover,
.wish__more:focus-visible {
  transform: scale(1.02);
}

.wish__more:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .wish__heading,
  .wish__form,
  .wish__panel {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .wish__send,
  .wish__more {
    transition: none;
  }
}
</style>
