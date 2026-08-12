<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CoverSection from './components/cover/CoverSection.vue'
import { useWedding } from './composables/useWedding'

const { guest, coupleNickname, refetch } = useWedding()

const opened = ref(false)

/*
 * Frame 243 prints "Nama Tamu" as the placeholder, so an unconfigured render
 * matches the design instead of showing an empty line.
 */
const guestName = computed(() => guest.value?.name || 'Nama Tamu')

onMounted(refetch)
</script>

<template>
  <main>
    <CoverSection
      v-if="!opened"
      :guest-name="guestName"
      :couple-name="coupleNickname"
      @open="opened = true"
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
