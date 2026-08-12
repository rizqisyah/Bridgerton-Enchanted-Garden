<script setup lang="ts">
/*
 * Figma Frame 244 band "rsvp", y 6967-7496. Coords are band-local design px.
 *
 * Group 2712:223 "RSVP" (x35 w305 h425) holds three "Input" frames — 2712:234
 * (Nama), 2712:233 (No Hp), 2712:229 (Kehadiran) — each a flat #ffffff plate at
 * radius 10 with a 1px stroke and no TEXT node inside: pictures of form controls.
 * They are not in rsvp.ts (only the doves, 2712:303, made it into the generated
 * table) and are rebuilt here as real controls. The design draws Kehadiran as an
 * empty box with no dropdown affordance; a native <select> is the deviation, same
 * one template-3's RsvpSection took, because an empty box offers no way in.
 *
 * The Send rectangle (2712:227, #767f62 fill) and its label (2712:228) are live —
 * the design's own button, not a plate — so they render as a real <button>.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { submitRsvp } from '../../lib/api'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/rsvp'

const { el, shown } = useReveal()
const { slug, guestCode, guest } = useWedding()

const name = ref('')
const phone = ref('')
const attendance = ref('')
const submitting = ref(false)
const sent = ref(false)
const error = ref('')
const thanksEl = ref<HTMLElement | null>(null)

/* Per invitation AND per guest link: `?to=` distinguishes two guests on one phone. */
const storageKey = computed(() => `rsvp_${slug.value}_${guestCode.value || 'general'}`)

function readStore(): boolean {
  try {
    return localStorage.getItem(storageKey.value) === 'true'
  } catch {
    return false
  }
}

onMounted(() => {
  sent.value = readStore()
})

watch(
  guest,
  (g: any) => {
    if (g?.has_rsvp) sent.value = true
    const known = g?.name ?? g?.guest_name
    if (known && !name.value) name.value = String(known)
  },
  { immediate: true },
)

async function submit() {
  if (!name.value.trim()) {
    error.value = 'Nama wajib diisi.'
    return
  }
  if (!attendance.value) {
    error.value = 'Pilih kehadiran terlebih dahulu.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await submitRsvp(slug.value, {
      guest_name: name.value.trim(),
      phone: phone.value.trim(),
      attendance_status: attendance.value,
      guest_count: attendance.value === 'hadir' ? 1 : 0,
    })
    try {
      localStorage.setItem(storageKey.value, 'true')
    } catch {
      // Losing the receipt only means the form comes back on reload.
    }
    sent.value = true
    await nextTick()
    thanksEl.value?.focus()
  } catch (err: any) {
    error.value = err?.message || 'Gagal mengirim konfirmasi. Coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section :ref="el" class="rsvp" :class="{ 'is-in': shown }" aria-labelledby="rsvp-heading">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 2712:226 — Comtic Hiden 20/38, #9e0f0f. -->
    <h2 id="rsvp-heading" class="rsvp__heading">Rsvp</h2>
    <!-- 2712:225 — EB Garamond 16/20, #631818. -->
    <p class="rsvp__body">
      Kehadiran Bapak/Ibu/Saudara/i akan menjadi kehormatan besar bagi kami dan keluarga. Mohon
      konfirmasi kehadiran Anda melalui formulir reservasi di bawah:
    </p>

    <p class="rsvp__sr" aria-live="polite">
      {{ sent ? 'Konfirmasi kehadiran Anda sudah kami terima.' : '' }}
    </p>

    <p v-if="sent" ref="thanksEl" class="rsvp__thanks" tabindex="-1">
      <span class="rsvp__thanks-title">Terima Kasih!</span>
      <span>Konfirmasi kehadiran Anda sudah kami terima.</span>
    </p>

    <form v-else class="rsvp__form" novalidate @submit.prevent="submit">
      <label class="rsvp__label rsvp__label--name" for="rsvp-name">Nama:</label>
      <input
        id="rsvp-name"
        v-model="name"
        class="rsvp__field rsvp__field--name"
        type="text"
        autocomplete="name"
        required
      />

      <label class="rsvp__label rsvp__label--phone" for="rsvp-phone">No Hp:</label>
      <input
        id="rsvp-phone"
        v-model="phone"
        class="rsvp__field rsvp__field--phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
      />

      <label class="rsvp__label rsvp__label--attend" for="rsvp-attend">Kehadiran</label>
      <select
        id="rsvp-attend"
        v-model="attendance"
        class="rsvp__field rsvp__field--attend"
        required
      >
        <option value=""></option>
        <option value="hadir">Hadir</option>
        <option value="tidak_hadir">Tidak Hadir</option>
      </select>

      <p v-if="error" class="rsvp__error" role="alert">{{ error }}</p>

      <button class="rsvp__send" type="submit" :disabled="submitting">
        {{ submitting ? 'Mengirim...' : 'Send' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.rsvp {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.rsvp > * {
  /* Above every sliced layer: BandArt sets z inline, which beats a rule. */
  z-index: 900;
  position: absolute;
  margin: 0;
}

.rsvp img {
  pointer-events: none;
}

.rsvp__sr {
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.rsvp__heading,
.rsvp__body,
.rsvp__form,
.rsvp__thanks {
  z-index: 186;
  opacity: 0;
  transition:
    opacity 1100ms ease-out var(--in, 0ms),
    transform 1500ms cubic-bezier(0.16, 1, 0.3, 1) var(--in, 0ms);
}

.rsvp.is-in .rsvp__heading,
.rsvp.is-in .rsvp__body,
.rsvp.is-in .rsvp__form,
.rsvp.is-in .rsvp__thanks {
  opacity: 1;
  transform: none;
}

.rsvp__heading {
  --in: 0ms;
  top: 0;
  left: calc(35 * var(--px));
  width: calc(305 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(38 * var(--px));
  text-align: center;
  color: var(--crimson-title);
}

.rsvp__body {
  --in: 200ms;
  top: calc(44 * var(--px));
  left: calc(72 * var(--px));
  width: calc(231 * var(--px));
  transform: translateY(calc(30 * var(--px))) scale(0.9);
  font-family: var(--font-quote);
  font-size: calc(16 * var(--px));
  line-height: calc(20 * var(--px));
  text-align: center;
  color: #631818;
}

.rsvp__form,
.rsvp__thanks {
  --in: 350ms;
  top: 0;
  left: 0;
  width: calc(375 * var(--px));
  height: calc(425 * var(--px));
  transform: translateY(calc(10 * var(--px)));
}

.rsvp__form > *,
.rsvp__thanks > * {
  position: absolute;
}

/* 2712:231/232/230 — Cormorant Garamond Bold 16/22, #631818. */
.rsvp__label {
  font-family: var(--font-body);
  font-size: calc(16 * var(--px));
  line-height: calc(22 * var(--px));
  font-weight: 700;
  color: #631818;
}

.rsvp__label--name {
  top: calc(174 * var(--px));
  left: calc(54 * var(--px));
}

.rsvp__label--phone {
  top: calc(239 * var(--px));
  left: calc(54 * var(--px));
}

.rsvp__label--attend {
  top: calc(302 * var(--px));
  left: calc(56 * var(--px));
}

/*
 * The three plates are flat #ffffff, radius 10. 16px, not smaller: --px is 1.0 at a
 * 375 container, and mobile Safari zooms the page on focus below 16px, which would
 * throw the whole pixel-positioned band off screen.
 */
.rsvp__field {
  height: calc(36 * var(--px));
  padding: 0 calc(12 * var(--px));
  border: calc(1 * var(--px)) solid #566b4c;
  border-radius: calc(10 * var(--px));
  background: #ffffff;
  font-family: var(--font-quote);
  font-size: calc(16 * var(--px));
  color: #4d4d2d;
}

.rsvp__field:focus-visible {
  outline: calc(2 * var(--px)) solid #566b4c;
  outline-offset: calc(2 * var(--px));
}

.rsvp__field--name {
  top: calc(197 * var(--px));
  left: calc(55 * var(--px));
  width: calc(261.22 * var(--px));
}

.rsvp__field--phone {
  top: calc(262 * var(--px));
  left: calc(54 * var(--px));
  width: calc(261.22 * var(--px));
}

.rsvp__field--attend {
  top: calc(325 * var(--px));
  left: calc(55 * var(--px));
  width: calc(258 * var(--px));
  border-color: #4d4d2d;
}

/* 2712:227 rectangle, #767f62 fill, radius 6. */
.rsvp__send {
  top: calc(393 * var(--px));
  left: calc(126 * var(--px));
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(115 * var(--px));
  height: calc(32 * var(--px));
  padding: 0;
  border: 0;
  border-radius: calc(6 * var(--px));
  background: #767f62;
  font-family: var(--font-sans);
  font-size: calc(13 * var(--px));
  line-height: calc(17 * var(--px));
  color: #ffffff;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.rsvp__send:hover:not(:disabled),
.rsvp__send:focus-visible {
  transform: scale(1.04);
}

.rsvp__send:active:not(:disabled) {
  transform: scale(0.97);
}

.rsvp__send:disabled {
  cursor: progress;
  opacity: 0.7;
}

.rsvp__error {
  top: calc(360 * var(--px));
  left: calc(55 * var(--px));
  width: calc(261 * var(--px));
  font-family: var(--font-quote);
  font-size: calc(12 * var(--px));
  line-height: calc(14 * var(--px));
  text-align: center;
  color: #7a2f2f;
}

.rsvp__thanks:focus-visible {
  outline: calc(2 * var(--px)) solid #566b4c;
  outline-offset: calc(4 * var(--px));
}

.rsvp__thanks > span {
  left: calc(55 * var(--px));
  width: calc(265 * var(--px));
  font-family: var(--font-quote);
  font-size: calc(16 * var(--px));
  line-height: calc(22 * var(--px));
  text-align: center;
  color: #631818;
}

.rsvp__thanks > span.rsvp__thanks-title {
  top: calc(174 * var(--px));
  font-family: var(--font-script);
  font-size: calc(34 * var(--px));
  line-height: calc(38 * var(--px));
}

.rsvp__thanks > span + span {
  top: calc(220 * var(--px));
}

@media (prefers-reduced-motion: reduce) {
  .rsvp__heading,
  .rsvp__body,
  .rsvp__form,
  .rsvp__thanks {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .rsvp__send {
    transition: none;
  }
}
</style>
