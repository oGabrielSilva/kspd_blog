export function formatDate(date: Date, local: 'pt-BR' | 'en' = 'en') {
  return date.toLocaleDateString(local, {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'narrow',
  })
}
