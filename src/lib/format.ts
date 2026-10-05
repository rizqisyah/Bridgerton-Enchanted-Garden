/*
 * Event date/time formatting for the acara bands (Akad, Resepsi, and the countdown
 * that follows them). The API gives `event_date` as a date string and `event_time`
 * as a range, and Frame 242 prints them in a very specific shape:
 *
 *   Saturday,            <- English weekday, on its own line
 *   19 April 2029        <- day month year
 *   10.00 WIB - 12.00 WIB
 *
 * that is what these return.
 */
const RANGE_SEPARATORS = ['|', 's/d', ' - ', '-', '–']

export type EventDate = { weekday: string; date: string }
export type DateParts = { y: number; m: number; d: number }

// First three letters of Indonesian and English month names (and common short forms)
const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, peb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7,
  agu: 8, ags: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, nop: 11, des: 12, dec: 12,
}

const valid = (p: DateParts): DateParts | null => {
  const t = new Date(p.y, p.m - 1, p.d)
  return t.getFullYear() === p.y && t.getMonth() === p.m - 1 && t.getDate() === p.d ? p : null
}

/*
 * The admin's acara date is a free-text field, so real rows hold "2029-04-19" (autofill),
 * "Sabtu, 19 April 2029", "Saturday, 19 April 2029", "April 19, 2029" or "19-04-2029"
 * alike. Reads the calendar day out of any of those, without a time zone: a bare ISO date
 * handed to `new Date` is UTC midnight and lands on the previous day west of Greenwich.
 */
export function parseDateParts(raw?: string | null): DateParts | null {
  const s = (raw || '').trim()
  if (!s) return null
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return valid({ y: +m[1], m: +m[2], d: +m[3] })
  // Day first, as written in Indonesia: 19-04-2029, 19/04/2029, 19.04.2029
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/)
  if (m) return valid({ y: +m[3], m: +m[2], d: +m[1] })
  // Named month in either language and either order, weekday optional
  const words = s.toLowerCase().replace(/[,.]/g, ' ').split(/\s+/)
  const month = words.map((w) => MONTHS[w.slice(0, 3)]).find(Boolean)
  const year = words.find((w) => /^\d{4}$/.test(w))
  const day = words.find((w) => /^\d{1,2}$/.test(w))
  if (month && year && day) return valid({ y: +year, m: month, d: +day })
  const loose = new Date(s)
  return Number.isNaN(loose.getTime())
    ? null
    : { y: loose.getFullYear(), m: loose.getMonth() + 1, d: loose.getDate() }
}

export function formatEventDate(raw?: string | null, lang: string = 'indonesia'): EventDate | null {
  const p = parseDateParts(raw)
  if (!p) return null
  const d = new Date(p.y, p.m - 1, p.d)
  const locale = lang === 'english' ? 'en-GB' : 'id-ID'
  return {
    weekday: d.toLocaleDateString(locale, { weekday: 'long' }),
    date: d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

/**
 * The instant the countdown counts to: `event_date` at `event_time`'s start.
 *
 * Built in the GUEST'S local zone, not WIB. The payload carries no offset -- the
 * design's "WIB" is a literal in its own copy, not data -- so there is nothing to
 * pin to, and a guest-local reading is the one a bare `new Date(...)` gives. A
 * guest abroad therefore sees the countdown reach zero at their own local
 * wall-clock time, which is a choice, not an oversight; pinning to +07:00 would
 * need the API to say so.
 *
 * Missing time means midnight local, the same anchor `formatEventDate` uses.
 */
export function parseEventStart(date?: string | null, time?: string | null): Date | null {
  const p = parseDateParts(date)
  if (!p) return null
  const sep = time ? RANGE_SEPARATORS.find((s) => time.includes(s)) : undefined
  const start = sep && time ? time.split(sep)[0] : time
  const t = (start ?? '').trim().match(/^(\d{1,2})[.:](\d{2})/)
  const at = new Date(
    p.y,
    p.m - 1,
    p.d,
    t ? Number(t[1]) : 0,
    t ? Number(t[2]) : 0,
  )
  return Number.isNaN(at.getTime()) ? null : at
}

export type Remaining = { days: number; hours: number; minutes: number; seconds: number }

/** Whole units left until `target`, clamped at zero once it has passed. */
export function remainingUntil(target: Date | null, now: number = Date.now()): Remaining {
  const ms = target ? target.getTime() - now : 0
  if (!target || ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  }
}

/** '10:00:00' -> '10.00'. Anything unparseable comes back as given. */
function clockOf(part: string): string {
  const m = part.trim().match(/^(\d{1,2})[.:](\d{2})/)
  return m ? `${m[1].padStart(2, '0')}.${m[2]}` : part.trim()
}

/*
 * The API writes the zone into `event_time` itself ("10.00 - 12.00 WIB"), and clockOf
 * keeps only HH.MM, so pull the zone out first and put it back once at the end.
 * WITA before WIT, or "WITA" would match as "WIT".
 */
const ZONE = /\s*\b(WITA|WIB|WIT)\b\.?/gi

export function formatEventTime(raw?: string | null, lang: string = 'indonesia'): string {
  if (!raw) return ''
  const zone = raw.match(ZONE)?.[0].trim().replace(/\.$/, '').toUpperCase()
  const bare = raw.replace(ZONE, '').trim()
  const tail = zone ? ` ${zone}` : ''
  const sep = RANGE_SEPARATORS.find((s) => bare.includes(s))
  if (!sep) return `${clockOf(bare)}${tail}`
  const [from, to] = bare.split(sep)
  // An end of midnight is how the API says "no end time".
  const end = clockOf(to ?? '')
  if (!end || end === '00.00' || end === '23.59') return `${clockOf(from)} - ${lang === 'english' ? 'Finish' : 'Selesai'}${tail}`
  return `${clockOf(from)} - ${end}${tail}`
}

/*
 * "2 hari lalu" — the wish list's timestamps. The design prints Indonesian relative
 * time, and unlike the dates above it does not switch to English.
 */
const AGO: [seconds: number, idUnit: string, enUnit: string][] = [
  [60, 'menit', 'minutes'],
  [3600, 'jam', 'hours'],
  [86400, 'hari', 'days'],
  [2592000, 'bulan', 'months'],
  [31536000, 'tahun', 'years'],
]

export function relativeTime(value?: string | Date | null, now: number = Date.now(), lang: string = 'indonesia'): string {
  if (!value) return ''
  /*
   * The API sends MySQL-style "2026-07-28 10:00:00" — a space, no T, no zone. Chromium
   * parses that; WebKit returns NaN, which would blank every timestamp on iPhone. The
   * ISO form is understood by both, so normalise before parsing. A bare date with no
   * zone is read as local time by both engines, which is what the guest expects.
   */
  const at =
    value instanceof Date
      ? value
      : new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value) ? value.replace(' ', 'T') : value)
  if (Number.isNaN(at.getTime())) return ''

  // Under a minute, and also anything in the future: a guest's clock skewed ahead of
  // the server would otherwise read "-3 menit lalu".
  const secs = Math.floor((now - at.getTime()) / 1000)
  if (secs < 60) return lang === 'english' ? 'just now' : 'baru saja'

  for (let i = AGO.length - 1; i >= 0; i--) {
    const [step, idUnit, enUnit] = AGO[i]
    if (secs >= step) {
      const val = Math.floor(secs / step)
      if (lang === 'english') {
        return `${val} ${val === 1 ? enUnit.slice(0, -1) : enUnit} ago`
      }
      return `${val} ${idUnit} lalu`
    }
  }
  return lang === 'english' ? 'just now' : 'baru saja'
}

/*
 * "09. 09. 26" — the glimpse band's date plate. Neither of the formats above produces it:
 * two-digit day, month and YEAR, separated by ". " with the trailing dot on the first two.
 * The design's own string is 09. 09. 26 for a 2026-09-09 wedding, so the last field is the
 * year, not the day repeated.
 */
export function formatShortDate(raw?: string | null): string {
  if (!raw) return ''
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}. ${m[2]}. ${m[1].slice(2)}`
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}. ${p(d.getMonth() + 1)}. ${String(d.getFullYear()).slice(2)}`
}

/*
 * The "Putra Pertama dari Bapak Tono & Ibu Ratna" line under a name. getHome has no
 * `parents` field -- the components read one and always fell through to the design copy.
 * It ships the pieces separately as `child_of` + `father_name` + `mother_name`, any of
 * which can be blank, so join whatever is there and let the caller supply the fallback.
 */
export function parentLine(p?: {
  child_of?: string | null
  father_name?: string | null
  mother_name?: string | null
} | null, lang: string = 'indonesia'): string {
  if (!p) return ''
  const prefix = (p.child_of || '').trim()
  const parentConjunction = lang === 'english' ? 'and' : '&'
  const parents = [p.father_name, p.mother_name].map((s) => (s || '').trim()).filter(Boolean).join(` ${parentConjunction} `)
  // `child_of` on real data is often the whole sentence already; don't repeat the parents.
  if (prefix && parents && prefix.includes(parents)) return prefix
  return [prefix, parents].filter(Boolean).join(' ').trim()
}
