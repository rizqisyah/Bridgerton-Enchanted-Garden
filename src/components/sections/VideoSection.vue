<template>
  <div
    v-if="videoUrl"
    id="videoSectionContainer"
    class="video-section-wrapper"
    data-section="video"
  >
    <div class="video-container">
      <iframe
        v-if="embedUrl"
        class="video-embed"
        :src="embedUrl"
        title="Wedding video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; mute"
        allowfullscreen
      ></iframe>
      <video
        v-else
        class="video-element"
        :src="videoUrl"
        loop
        muted
        controls
        autoplay
        playsinline
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWedding } from '../../composables/useWedding'

const props = defineProps<{
  videoUrl?: string
}>()

const { wedding } = useWedding()

const videoUrl = computed(() => props.videoUrl || wedding.value?.video_url || '')

const embedUrl = computed(() => {
  const url = videoUrl.value
  if (!url) return ''

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${yt[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1`

  return ''
})
</script>

<style scoped>
.video-section-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background: #000;
  box-sizing: border-box;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.video-embed,
.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
}
</style>
