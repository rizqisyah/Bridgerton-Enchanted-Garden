import { ref, computed, onMounted } from 'vue'
import { resolveSlug, getHome, submitUcapan } from '../lib/api'

const state = ref<{
  loading: boolean
  error: string | null
  data: any | null
}>({
  loading: true,
  error: null,
  data: null,
})

function applyTheme(themeData: any, weddingData: any) {
  const cfg = themeData?.theme_config
  let override = weddingData?.theme_override
  if (typeof override === 'string') {
    try {
      override = JSON.parse(override)
    } catch {
      override = {}
    }
  }
  override = override || {}

  const root = document.documentElement
  const colors = { ...(cfg?.colors || {}), ...(override?.colors || {}) }
  const fonts = { ...(cfg?.fonts || {}), ...(override?.fonts || {}) }

  if (colors.primary) root.style.setProperty('--maroon-title', colors.primary)
  if (colors.secondary) root.style.setProperty('--maroon-text', colors.secondary)
  if (colors.accent) root.style.setProperty('--gold', colors.accent)
  if (colors.bg_body) root.style.setProperty('--bg-body', colors.bg_body)

  if (fonts.script) root.style.setProperty('--font-script', fonts.script)
  if (fonts.hand) root.style.setProperty('--font-hand', fonts.hand)
}

// Module-level so every section shares one slug, one request and one message listener
const slug = ref(resolveSlug())
const guestCode = ref(new URLSearchParams(window.location.search).get('to') || '')
let inflight: Promise<void> | null = null

function fetchWeddingData(): Promise<void> {
  if (inflight) return inflight
  inflight = (async () => {
    state.value.loading = true
    state.value.error = null
    try {
      const data = await getHome(slug.value, guestCode.value)
      if (!data || !data.wedding) {
        throw new Error('Undangan ini bersifat privat dan hanya dapat diakses melalui link resmi.')
      }
      if (guestCode.value && !data.guest) {
        throw new Error('Undangan ini bersifat privat dan hanya dapat diakses melalui link resmi.')
      }
      state.value.data = data
      if (data?.theme || data?.wedding) {
        applyTheme(data.theme, data.wedding)
      }
    } catch (err: any) {
      console.error('Failed to load wedding data:', err)
      let msg = err instanceof Error ? err.message : 'Undangan ini bersifat privat dan hanya dapat diakses melalui link resmi.'
      if (msg.includes('404') || msg.includes('not found') || msg.includes('Request failed')) {
        msg = 'Undangan ini bersifat privat dan hanya dapat diakses melalui link resmi.'
      }
      // state.value.error = msg
      console.warn('Restricted access bypassed for preview:', msg)
    } finally {
      state.value.loading = false
      inflight = null
    }
  })()
  return inflight
}

/*
 * Live preview from the admin dashboard (App.tsx posts { type, wedding, theme, refetch }).
 * `wedding`/`theme` carry unsaved edits -- the Tema tab's sliders, colors, words -- and
 * are shown at once; `refetch` reloads content saved in other tabs (pengantin, acara...).
 * The older `payload.refetch` shape is still honoured.
 */
window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data
  if (msg?.type !== 'QINVI_PREVIEW_UPDATE') return
  if (msg.wedding || msg.theme) {
    let wedding = msg.wedding
    if (wedding && typeof wedding.theme_override === 'string') {
      try {
        wedding = { ...wedding, theme_override: JSON.parse(wedding.theme_override) }
      } catch {
        wedding = { ...wedding, theme_override: {} }
      }
    }
    const current = state.value.data || {}
    state.value.data = {
      ...current,
      ...(wedding ? { wedding: { ...(current.wedding || {}), ...wedding } } : {}),
      ...(msg.theme ? { theme: msg.theme } : {}),
    }
    applyTheme(state.value.data.theme, state.value.data.wedding)
  }
  if (msg.refetch || msg.payload?.refetch) fetchWeddingData()
})

export function useWedding() {
  onMounted(() => {
    if (!state.value.data) fetchWeddingData()
  })

  const wedding = computed(() => state.value.data?.wedding ?? null)
  const theme = computed(() => state.value.data?.theme ?? null)
  const guest = computed(() => state.value.data?.guest ?? null)
  const content = computed(() => state.value.data?.content ?? null)

  const pengantin = computed(() => content.value?.pengantin ?? state.value.data?.pengantin ?? [])
  const acara = computed(() => content.value?.acara ?? state.value.data?.acara ?? [])
  const gallery = computed(() => content.value?.gallery ?? state.value.data?.gallery ?? [])
  const gift = computed(() => content.value?.gift ?? content.value?.rekening ?? state.value.data?.gift ?? state.value.data?.rekening ?? [])
  const wishes = computed(() => content.value?.wishes ?? content.value?.ucapan ?? state.value.data?.wishes ?? state.value.data?.ucapan ?? [])

  const groom = computed(() => {
    return pengantin.value.find((p: any) =>
      p.type?.toLowerCase() === 'groom' || p.type?.toLowerCase() === 'pria'
    ) ?? pengantin.value[0] ?? null
  })

  const bride = computed(() => {
    return pengantin.value.find((p: any) =>
      p.type?.toLowerCase() === 'bride' || p.type?.toLowerCase() === 'wanita'
    ) ?? pengantin.value[1] ?? null
  })

  const coupleNickname = computed(() => {
    const orderGroomFirst = wedding.value?.order_groom_first ?? true
    const groomNick = groom.value?.nickname?.trim() || (groom.value?.name ? groom.value.name.split(' ')[0] : '')
    const brideNick = bride.value?.nickname?.trim() || (bride.value?.name ? bride.value.name.split(' ')[0] : '')
    if (groomNick && brideNick) {
      return orderGroomFirst ? `${groomNick} & ${brideNick}` : `${brideNick} & ${groomNick}`
    }
    if (wedding.value?.title) return wedding.value.title
    return 'Pengantin'
  })

  const parsedOverride = computed(() => {
    let override = wedding.value?.theme_override
    if (typeof override === 'string') {
      try {
        override = JSON.parse(override)
      } catch (e) {
        override = {}
      }
    }
    return override || {}
  })

  const quoteText = computed(() => {
    return parsedOverride.value?.words?.quote_text || 
           parsedOverride.value?.quote_text ||
           parsedOverride.value?.quote?.text ||
           'Dan di antara tanda-tanda (kebesaran-Nya) ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.'
  })

  const quoteVerse = computed(() => {
    return parsedOverride.value?.words?.quote_verse || 
           parsedOverride.value?.quote_verse ||
           parsedOverride.value?.quote?.verse ||
           'QS. Ar-Rum: 21'
  })

  /*
   * "Pengaturan Zoom & Posisi Foto Mempelai" in the admin's Tema tab: per-photo zoom and
   * focus point, saved as theme_override.foto_pria_transform / foto_wanita_transform.
   * Returned as the photo's own style -- object-position picks the focus, and the zoom
   * scales about that same point so the focus stays put while zooming.
   */
  const photoStyle = (key: 'foto_pria_transform' | 'foto_wanita_transform') =>
    computed(() => {
      const t = parsedOverride.value?.[key]
      if (!t || typeof t !== 'object') return {}
      const num = (v: unknown, fallback: number) => {
        const n = typeof v === 'number' ? v : parseFloat(v as string)
        return Number.isFinite(n) ? n : fallback
      }
      const scale = num(t.scale, 1)
      const x = num(t.x, 50)
      const y = num(t.y, 50)
      return {
        objectPosition: `${x}% ${y}%`,
        transformOrigin: `${x}% ${y}%`,
        transform: `scale(${scale})`,
      }
    })
  const groomPhotoStyle = photoStyle('foto_pria_transform')
  const bridePhotoStyle = photoStyle('foto_wanita_transform')

  const logoMempelai = computed(() => {
    let override = parsedOverride.value?.images?.logo_mempelai
    const config = theme.value?.theme_config?.images?.logo_mempelai
    return override || config || ''
  })

  const openingMessage = computed(() => {
    return parsedOverride.value?.words?.opening_message || ''
  })

  const closingMessage = computed(() => {
    return parsedOverride.value?.words?.footer_message || parsedOverride.value?.words?.closing_message || ''
  })

  const leftBackground = computed(() => {
    let override = parsedOverride.value?.backgrounds?.left_bg || parsedOverride.value?.images?.left_bg || parsedOverride.value?.images?.bg_desktop || parsedOverride.value?.images?.bg_left
    let config = theme.value?.theme_config?.backgrounds?.left_bg || theme.value?.theme_config?.images?.left_bg || theme.value?.theme_config?.images?.bg_desktop || theme.value?.theme_config?.images?.bg_left
    return override || config || wedding.value?.image_bg1 || wedding.value?.image_cover || ''
  })

  async function sendWish(payload: { guest_name: string; message: string }) {
    await submitUcapan(slug.value, payload)
    await fetchWeddingData()
  }

  return {
    slug,
    guestCode,
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    wedding,
    theme,
    guest,
    pengantin,
    acara,
    gallery,
    gift,
    wishes,
    groom,
    bride,
    coupleNickname,
    quoteText,
    quoteVerse,
    groomPhotoStyle,
    bridePhotoStyle,
    logoMempelai,
    openingMessage,
    closingMessage,
    leftBackground,
    lang: computed(() => wedding.value?.lang === 'english' ? 'english' : 'indonesia'),
    sendWish,
    refetch: fetchWeddingData,
  }
}
