<script setup lang="ts">
/*
 * Figma Frame 244 band "gift", y 6021-6967. Coords are band-local design px.
 *
 * Three cards on a 153px pitch (2712:186 @181, 2712:194 @334, 2712:202 @487 — all
 * band-local). Each card is Group 240: a flat #f7f3dc plate + #4d4d2d tab (2712:187,
 * not in the generated LAYERS table because it repeats per-account and the API's
 * account count isn't fixed to 3), a BCA logo raster (2712:193), and two live TEXT
 * rows nested inside a Frame that itself reports position relative to ITS OWN parent
 * rather than the frame — see SLICING.md's "9 nodes report parent-relative y" trap:
 * 2712:191/192 (card 1), 2712:199/200 (card 2), 2712:207 (card 3) are all affected.
 * Their absolute band-local y is the enclosing Frame223/198/206's own y plus that
 * offset, which is what `lines()` below reconstructs positionally instead.
 *
 * The copy-icon nodes 2712:209/210/211 ARE in gift.ts (z175-177) but at x160,
 * y166/287/471 — off the card entirely (the tab they belong on is at x309-353, and
 * card 1 alone spans y181-291, so y166 is above the card). They are skipped here
 * regardless, because the button has to be interactive; the real one is placed from
 * the tab's own geometry (Rectangle 136, x309 w44, vertically centred on the card).
 */
import { computed, onUnmounted, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/gift'

import cardPlate from '../../assets/gift/parts/2712-187.webp'
import bcaLogo from '../../assets/gift/parts/2712-193.webp'
import copyIcon from '../../assets/gift/parts/2712-209.webp'

type Account = {
  bank_name?: string
  account_number?: string
  account_name?: string
  /** Design-only: card 3 is a postal address rather than an account. */
  address?: string[]
}

const CARD_TOP = 181 // band-local y of card 1 (Group 241); the rest follow on a 153 pitch
const PITCH = 153

/*
 * Frame 244's own three cards, so an unconfigured render matches the reference.
 * The design repeats the same BCA account twice — its mock data, not a mistake here.
 */
const FALLBACK: Account[] = [
  { bank_name: 'BCA', account_number: '8715154435', account_name: 'Muhammad Arif' },
  { bank_name: 'BCA', account_number: '8715154435', account_name: 'Muhammad Arif' },
  { address: ['Alamat', '65, Jalan Raya Tanjung Barat'], account_name: 'Muhammad Arif' },
]

const { el, shown } = useReveal()
const { gift } = useWedding()

/*
 * The API's rekening rows are accounts only — there is no address field. The row
 * whose bank is `kado` carries a postal address in account_number, and renders as
 * the design's card 3 (same convention as template-3's GiftSection).
 */
const isKado = (bank?: string) => (bank || '').trim().toLowerCase() === 'kado'

const accounts = computed<Account[]>(() => {
  const live = (gift.value as any[])
    .map((g) => {
      const number = (g.account_number || '').trim()
      const name = g.account_name
      return isKado(g.bank_name)
        ? { address: ['Alamat', number], account_name: name, account_number: number }
        : { bank_name: g.bank_name, account_number: number, account_name: name }
    })
    .filter((a) => a.account_number || a.account_name)
  return live.length ? live : FALLBACK
})

const isBca = (a: Account) => (a.bank_name || '').trim().toUpperCase() === 'BCA'

/** What a card prints, and where — the address variant sets three lines, higher up. */
function lines(a: Account): { top: number; leading: number; rows: string[] } {
  if (a.address) {
    return { top: 22, leading: 18, rows: [...a.address, `A/n ${a.account_name ?? ''}`] }
  }
  return {
    top: 38,
    leading: 19,
    rows: [`No. Rekening : ${a.account_number ?? ''}`, `A/n ${a.account_name ?? ''}`],
  }
}

const copyable = (a: Account) => !!a.account_number
const copyLabel = (a: Account) => (a.address ? 'alamat' : 'nomor rekening')

const copied = ref(-1)
let clear = 0

async function copy(a: Account, i: number) {
  const text = a.account_number ?? ''
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Secure-context-only API; invitations opened from chat apps over plain http
    // hit this often enough that it is the common case, not the edge one.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = i
  window.clearTimeout(clear)
  clear = window.setTimeout(() => (copied.value = -1), 1800)
}
onUnmounted(() => window.clearTimeout(clear))

const cardTop = (i: number) => CARD_TOP + i * PITCH
const px = (n: number) => `calc(${n} * var(--px))`
</script>

<template>
  <section :ref="el" class="gift" :class="{ 'is-in': shown }" aria-labelledby="gift-heading">
    <BandArt :layers="LAYERS" :skip="['2712:209', '2712:210', '2712:211']" :shown="shown" />

    <!-- 2712:185 — Comtic Hiden 20/28, #9e0f0f. No fontsource; --font-heading-script substitutes. -->
    <h2 id="gift-heading" class="gift__heading">Wedding<br />Gift</h2>
    <!-- 2712:208 — EB Garamond 11/22, #000000. -->
    <p class="gift__body">
      Bagi Bapak/Ibu/Saudara/i yang berkenan memberikan tanda kasih sebagai bentuk perhatian dan
      dukungan, dapat menyampaikannya melalui fitur yang telah kami sediakan di bawah ini. Setiap
      tanda kasih yang diberikan akan kami terima dengan penuh rasa syukur dan penghargaan.
    </p>

    <div
      v-for="(a, i) in accounts"
      :key="i"
      class="gift__card"
      :style="{ top: px(cardTop(i)), '--in': `${600 + i * 200}ms` }"
    >
      <img :src="cardPlate" alt="" class="gift__plate" width="327" height="110" />

      <img v-if="isBca(a)" :src="bcaLogo" alt="BCA" class="gift__logo" />
      <p v-else-if="a.bank_name" class="gift__bank">{{ a.bank_name }}</p>

      <p
        class="gift__lines"
        :style="{ top: px(lines(a).top), lineHeight: px(lines(a).leading) }"
      >
        <span v-for="(row, r) in lines(a).rows" :key="r">{{ row }}</span>
      </p>

      <!--
        Replaces 2712:209/210/211 (skipped above): positioned from Rectangle 136's own
        geometry (the tab, x309 w44) rather than the generated table's off-card x/y.
      -->
      <button
        v-if="copyable(a)"
        type="button"
        class="gift__copy"
        @click="copy(a, i)"
      >
        <img :src="copyIcon" alt="" width="21" height="21" />
        <span class="gift__sr">{{
          copied === i
            ? `${copyLabel(a)} disalin`
            : `Salin ${copyLabel(a)} ${a.account_number}`
        }}</span>
      </button>
    </div>

    <p class="gift__sr" aria-live="polite">
      {{ copied >= 0 ? `${copyLabel(accounts[copied])} disalin ke papan klip` : '' }}
    </p>
  </section>
</template>

<style scoped>
.gift {
  position: relative;
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.gift > * {
  position: absolute;
  margin: 0;
}

.gift img {
  pointer-events: none;
}

.gift__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.gift__heading,
.gift__body,
.gift__card {
  opacity: 0;
  transition:
    opacity 1200ms ease-out var(--in, 0ms),
    transform 1600ms cubic-bezier(0.16, 1, 0.3, 1) var(--in, 0ms);
}

.gift.is-in .gift__heading,
.gift.is-in .gift__body,
.gift.is-in .gift__card {
  opacity: 1;
  transform: none;
}

.gift__heading {
  --in: 0ms;
  z-index: 174;
  left: calc(30 * var(--px));
  top: 0;
  width: calc(230 * var(--px));
  transform: translateY(calc(14 * var(--px)));
  font-family: var(--font-heading-script);
  font-size: calc(20 * var(--px));
  line-height: calc(28 * var(--px));
  color: var(--crimson-title);
}

.gift__body {
  --in: 250ms;
  z-index: 174;
  left: calc(26 * var(--px));
  top: calc(72 * var(--px));
  width: calc(324 * var(--px));
  transform: translateY(calc(12 * var(--px)));
  font-family: var(--font-quote);
  font-size: calc(11 * var(--px));
  line-height: calc(22 * var(--px));
  color: #000000;
}

.gift__card {
  z-index: 174;
  left: 0;
  width: calc(375 * var(--px));
  height: calc(110 * var(--px));
  transform: translateY(calc(20 * var(--px)));
}

.gift__card > * {
  position: absolute;
}

.gift__plate {
  top: 0;
  left: calc(26 * var(--px));
  width: calc(327 * var(--px));
  height: calc(110 * var(--px));
}

.gift__logo {
  top: calc(15 * var(--px));
  left: calc(42 * var(--px));
  width: calc(60 * var(--px));
  height: calc(19.5 * var(--px));
}

.gift__bank {
  top: calc(15 * var(--px));
  left: calc(42 * var(--px));
  margin: 0;
  font-family: var(--font-quote);
  font-size: calc(15 * var(--px));
  line-height: calc(19.5 * var(--px));
  font-weight: 600;
  color: #844711;
}

/* 2712:191/192/199/200/207 — EB Garamond 14, #844711. Top/leading come from the variant. */
.gift__lines {
  left: calc(42 * var(--px));
  width: calc(260 * var(--px));
  margin: 0;
  font-family: var(--font-quote);
  font-size: calc(14 * var(--px));
  color: #844711;
}

.gift__lines span {
  display: block;
}

/*
 * The tab (Rectangle 136) is x309-353, vertically centred on the 110-tall card
 * (centre y 55). The 21x21 icon keeps its exact box; the button is padded out to a
 * 44px touch target, which costs nothing visually since the padding sits inside the
 * tab and stays transparent.
 */
.gift__copy {
  z-index: 176;
  left: calc(309 * var(--px));
  top: calc(33 * var(--px));
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(44 * var(--px));
  height: calc(44 * var(--px));
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.gift__copy img {
  width: calc(21 * var(--px));
  height: calc(21 * var(--px));
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.gift__copy:hover img,
.gift__copy:focus-visible img {
  transform: scale(1.12);
}

.gift__copy:active img {
  transform: scale(0.94);
}

.gift__copy:focus-visible {
  outline: calc(2 * var(--px)) solid #f7f3dc;
  outline-offset: calc(-4 * var(--px));
  border-radius: calc(6 * var(--px));
}

@media (prefers-reduced-motion: reduce) {
  .gift__heading,
  .gift__body,
  .gift__card {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .gift__copy img {
    transition: none;
  }
}
</style>
