export const AVATAR_COLORS = [
  '#3D7CDB',
  '#1B9A88',
  '#2F9E58',
  '#2186B8',
  '#6B52C7',
  '#4A62D4',
  '#C49A1A',
  '#6B8F2E',
  '#3E7FA3',
  '#8B57B5',
  '#2C8F6E',
  '#5A73B0',
  '#A07A3A',
]

export function avatarInitial(name) {
  const s = String(name || '').trim()
  if (!s) return '?'
  return [...s][0]
}

export function avatarColor(name) {
  const s = String(name || '')
  let sum = 0
  for (const ch of s) sum += ch.codePointAt(0)
  return AVATAR_COLORS[sum % 13]
}
