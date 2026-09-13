const dateFmt = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const wonFmt = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

const numFmt = new Intl.NumberFormat('ko-KR')

export function formatDate(value) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return dateFmt.format(d)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return dateTimeFmt.format(d)
}

export function formatWon(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return wonFmt.format(Number(amount))
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return numFmt.format(Number(value))
}

export function formatPct(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(digits)}%`
}

export function nid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function nowIso() {
  return new Date().toISOString()
}
