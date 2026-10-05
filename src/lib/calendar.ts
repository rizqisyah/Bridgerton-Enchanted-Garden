/*
 * "Simpan ke Kalender": a Google Calendar event-template link for one acara.
 *
 * The event's own wall-clock time is kept and pinned to its Indonesian zone with `ctz`
 * (WIB unless the time says WITA/WIT), so a guest abroad gets the ceremony at the right
 * moment rather than at the same digits in their own zone. A range ("08.00 - 10.00",
 * "08:00 s/d 10:00") gives the end; an open end ("08.00 - Selesai") or no time at all
 * falls back to two hours / the whole day.
 */

const ZONES: Record<string, string> = { WIB: 'Asia/Jakarta', WITA: 'Asia/Makassar', WIT: 'Asia/Jayapura' }
const RANGE_SEPARATORS = ['|', 's/d', ' - ', '-', '–']
const DEFAULT_HOURS = 2

export type CalendarEvent = {
  title?: string | null
  event_date?: string | null
  event_time?: string | null
  location_name?: string | null
  address?: string | null
}

const pad = (n: number) => String(n).padStart(2, '0')
const clock = (s: string | undefined) => s?.trim().match(/^(\d{1,2})[.:](\d{2})/)

export function googleCalendarUrl(evt: CalendarEvent, coupleName: string, pageUrl: string): string {
  const d = (evt.event_date || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!d) return ''
  const [y, m, day] = [Number(d[1]), Number(d[2]), Number(d[3])]

  const time = evt.event_time || ''
  const zone = time.match(/\b(WITA|WIB|WIT)\b/i)?.[1].toUpperCase() || 'WIB'
  const bare = time.replace(/\b(WITA|WIB|WIT)\b\.?/gi, '').trim()
  const sep = RANGE_SEPARATORS.find((s) => bare.includes(s))
  const [from, to] = sep ? bare.split(sep) : [bare, '']
  const start = clock(from)

  let dates: string
  if (!start) {
    // No usable time: an all-day entry (end date is exclusive)
    const next = new Date(Date.UTC(y, m - 1, day + 1))
    dates = `${y}${pad(m)}${pad(day)}/${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`
  } else {
    // Wall-clock arithmetic in UTC fields; `ctz` below says which zone the digits mean
    const begin = new Date(Date.UTC(y, m - 1, day, Number(start[1]), Number(start[2])))
    const endClock = clock(to)
    let end = endClock ? new Date(Date.UTC(y, m - 1, day, Number(endClock[1]), Number(endClock[2]))) : null
    // "00.00" is how the API writes "no end time"; a range past midnight is not a real case
    if (!end || end <= begin) end = new Date(begin.getTime() + DEFAULT_HOURS * 3600_000)
    const stamp = (t: Date) =>
      `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`
    dates = `${stamp(begin)}/${stamp(end)}`
  }

  const title = [evt.title?.trim(), coupleName.trim()].filter(Boolean).join(' — ')
  const location = [evt.location_name?.trim(), evt.address?.trim()].filter(Boolean).join(', ')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Pernikahan',
    dates,
    ctz: ZONES[zone],
    details: pageUrl,
    location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
