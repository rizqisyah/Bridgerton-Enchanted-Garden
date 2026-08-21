<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import CoverSection from './components/cover/CoverSection.vue'
import InviteBody from './components/invite/InviteBody.vue'
import BottomNav from './components/sections/BottomNav.vue'
import { usePreloadAssets } from './composables/usePreloadAssets'
import { useWedding } from './composables/useWedding'

const { guest, wedding, coupleNickname, quoteText, quoteVerse, logoMempelai, error, bride, groom, leftBackground } = useWedding()
const { coverLoaded, preloadCover, preloadInviteBody } = usePreloadAssets()

const isOpen = ref(false)
// The column cannot scroll while the cover owns the screen, or a stray wheel event
// scrolls the invitation behind it before it has been opened.
const isLocked = ref(true)
const contentVisible = ref(false)

const guestName = computed(() => {
  if (guest.value?.guest_name) {
    return guest.value.guest_name
  }
  const urlParam = new URLSearchParams(location.search).get('to')
  return urlParam || 'Nama Tamu'
})

const leftTitle = computed(() => {
  const orderGroomFirst = wedding.value?.order_groom_first ?? true
  const brideName = bride.value?.nickname || (bride.value?.name ? bride.value.name.split(' ')[0] : '')
  const groomName = groom.value?.nickname || (groom.value?.name ? groom.value.name.split(' ')[0] : '')
  if (brideName && groomName) {
    return orderGroomFirst ? `${groomName} & ${brideName}` : `${brideName} & ${groomName}`
  }
  return coupleNickname.value
})

const leftSubtitle = computed(() => {
  return wedding.value?.theme_override?.words?.the_wedding_of || 'The Wedding Of'
})

const leftBackgroundStyle = computed(() => {
  const img = leftBackground.value
  return img ? { backgroundImage: `url(${img})` } : {}
})

/*
 * The cover animates 36 layers in over 1.3s. Holding the reveal until they are decoded
 * keeps a real phone from assembling the scene out of half-loaded images.
 */
onMounted(async () => {
  await preloadCover()
  preloadInviteBody()
})

async function openInvitation() {
  isOpen.value = true
  await nextTick()
  requestAnimationFrame(() => {
    contentVisible.value = true
  })
}

function onSplashLeave() {
  isLocked.value = false
}
</script>

<template>
  <main class="app-shell">
    <!-- Desktop only: the invitation is a 430px column, this fills the rest. -->
    <div class="desktop-left-column" :style="leftBackgroundStyle">
      <div class="left-overlay"></div>
      <div class="left-content">
        <div class="left-header">
          <p class="left-subtitle">{{ leftSubtitle }}</p>
          <h1 class="left-title">{{ leftTitle }}</h1>
        </div>
        <div class="left-quote-container">
          <p class="left-quote">&ldquo;{{ quoteText }}&rdquo;</p>
          <span class="left-quote-verse">{{ quoteVerse }}</span>
        </div>
      </div>
    </div>

    <div class="desktop-right-column" :class="{ 'is-locked': isLocked || error }">
      <!-- Error / Restricted State Overlay -->
      <div v-if="error" class="restricted-overlay">
        <div class="restricted-box">
          <div class="restricted-icon">🔒</div>
          <h2 class="restricted-title">Akses Terbatas</h2>
          <p class="restricted-message">{{ error }}</p>
        </div>
      </div>

      <template v-else>
        <Transition name="splash" @after-leave="onSplashLeave">
          <CoverSection
            v-if="!isOpen"
            :guest-name="guestName"
            :couple-name="leftTitle"
            :image-logo="logoMempelai"
            :ready="coverLoaded"
            @open="openInvitation"
          />
        </Transition>

        <div
          v-show="isOpen"
          id="invite"
          class="invitation-content"
          :class="{ 'is-visible': contentVisible }"
        >
          <InviteBody />
        </div>

        <BottomNav v-if="isOpen" />
      </template>
    </div>
  </main>
</template>

<style>
/*
 * The cover pushes past the viewer rather than sliding away — it reads as walking
 * through the gate into the garden, which then rises out of the blur behind it.
 */
.splash-leave-active {
  transition:
    opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 2.4s cubic-bezier(0.16, 1, 0.3, 1),
    filter 2.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  will-change: opacity, transform, filter;
}

.splash-leave-to {
  opacity: 0 !important;
  transform: scale(1.16) !important;
  filter: blur(14px) !important;
}

/* Held back 0.8s so the cover has visibly receded before this rises to meet it. */
.invitation-content {
  opacity: 0;
  transform: translateY(28px) scale(0.965);
  filter: blur(10px);
  transition:
    opacity 2.3s cubic-bezier(0.16, 1, 0.3, 1) 0.8s,
    transform 2.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s,
    filter 2.3s cubic-bezier(0.16, 1, 0.3, 1) 0.8s;
  will-change: opacity, transform, filter;
}

.invitation-content.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .splash-leave-active,
  .invitation-content {
    transition: opacity 0.2s linear !important;
  }

  .splash-leave-to {
    transform: none !important;
    filter: none !important;
  }

  .invitation-content {
    transform: none;
    filter: none;
  }
}

@media (min-width: 768px) {
  .app-shell {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #1a1a1a;
  }

  .desktop-left-column {
    display: flex;
    flex: 1;
    height: 100vh;
    position: relative;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: var(--olive);
    color: #fff;
    overflow: hidden;
  }

  .left-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1;
  }

  .left-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 60px;
  }

  .left-subtitle {
    margin-bottom: 16px;
    font-family: var(--font-script);
    font-size: 20px;
    letter-spacing: 0.06em;
    opacity: 0.9;
  }

  .left-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 56px;
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.04em;
    /* No uppercase: --font-display is Norveil Fantasy Demo now, whose capitals are a
       fraktur set and whose lowercase are the cap-height forms the design uses. */
    color: #f0d9a8;
  }

  .left-quote-container {
    max-width: 480px;
    margin-top: auto;
    margin-bottom: 40px;
  }

  .left-quote {
    margin-bottom: 12px;
    font-family: var(--font-serif);
    font-size: 15px;
    font-style: italic;
    line-height: 1.6;
    opacity: 0.9;
  }

  .left-quote-verse {
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    opacity: 0.8;
  }

  /* Exactly --card-max: the sheet fills it, so the art has no gutter beside it. */
  .desktop-right-column {
    width: var(--card-max);
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    background: var(--paper);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
  }

  .desktop-right-column.is-locked {
    overflow: hidden !important;
  }
}

@media (max-width: 767px) {
  .app-shell {
    width: 100%;
    overflow-x: hidden;
  }

  .desktop-left-column {
    display: none;
  }

  .desktop-right-column {
    width: 100%;
    overflow-x: hidden;
  }

  .desktop-right-column.is-locked {
    overflow: hidden !important;
    height: 100vh;
  }
}

/* Restricted access overlay */
.restricted-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: var(--paper, #efe7dc);
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}

.restricted-box {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(144, 2, 2, 0.2);
  border-radius: 24px;
  padding: 40px 24px;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(144, 2, 2, 0.1);
  animation: restrict-fade-in 0.6s ease-out forwards;
}

@keyframes restrict-fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.restricted-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: lock-bounce 2s ease-in-out infinite alternate;
}

@keyframes lock-bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-6px);
  }
}

.restricted-title {
  font-family: var(--font-serif);
  font-size: 24px;
  color: #900202;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.restricted-message {
  font-family: var(--font-sans);
  font-size: 14px;
  color: #961a1a;
  line-height: 1.6;
  margin: 0;
}
</style>
