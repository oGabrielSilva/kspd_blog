export function minimizeText(desc: string | null, size = 100) {
  if (!desc) return ''
  if (desc.length > size) return desc.slice(0, size) + '...'
  return desc
}
