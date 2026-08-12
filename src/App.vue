<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CoverSection from './components/cover/CoverSection.vue'
import { usePreloadAssets } from './composables/usePreloadAssets'
import { useWedding } from './composables/useWedding'

const { guest, wedding, groom, bride, refetch } = useWedding()
const { coverLoaded, preloadCover, preloadInviteBody } = usePreloadAssets()

const opened = ref(false)

/*
 * Frame 243 prints "Nama Tamu" and "Ahmad & Salma", so an unconfigured render matches
 * the design instead of falling through to whatever wedding the default slug points at.
 */
const guestName = computed(() => guest.value?.name || 'Nama Tamu')
const coupleName = computed(() => {
  if (wedding.value?.title) return wedding.value.title
  if (groom.value?.name && bride.value?.name) {
    return `${groom.value.name.split(' ')[0]} & ${bride.value.name.split(' ')[0]}`
  }
  return 'Ahmad & Salma'
})

/*
 * The cover animates 36 layers in over 1.3s. Holding the reveal until they are decoded
 * keeps a real phone from assembling the scene out of half-loaded images.
 */
onMounted(() => {
  refetch()
  preloadCover()
})

function open() {
  opened.value = true
  preloadInviteBody()
}
</script>

<template>
  <main>
    <CoverSection
      v-if="!opened"
      :guest-name="guestName"
      :couple-name="coupleName"
      :ready="coverLoaded"
      @open="open"
    />
    <!-- Frame 244 (2695:163) body lands here, band by band. -->
    <p v-else class="todo">Invitation body — Frame 244, not sliced yet.</p>
  </main>
</template>

<style scoped>
.todo {
  padding: 4rem 1.5rem;
  text-align: center;
  font-family: var(--font-serif);
  color: var(--crimson-deep);
}
</style>
