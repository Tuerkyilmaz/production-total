export function truncateHoverSummary (text: string | undefined, max = 70): string {
  const s = (text ?? '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max).trimEnd()} ...`
}
