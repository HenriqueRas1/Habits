/** "12 h 30 min", "45 min" */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = Math.round(total % 60)
  return h > 0 ? `${h} h${m > 0 ? ` ${m} min` : ''}` : `${m} min`
}
