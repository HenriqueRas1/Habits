/** Cor hexadecimal (#rrggbb) com opacidade de 0 a 1, no formato #rrggbbaa. */
export function withAlpha(hex: string, alpha: number): string {
  const aa = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex.slice(0, 7).toLowerCase()}${aa}`
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

const DARK = '#111827'
const LIGHT = '#ffffff'

/** Texto (escuro ou branco) com mais contraste sobre a cor cheia do hábito. */
export function readableTextOn(hex: string): typeof DARK | typeof LIGHT {
  const l = luminance(hex)
  const onWhite = 1.05 / (l + 0.05)
  const onDark = (l + 0.05) / (luminance(DARK) + 0.05)
  return onWhite >= onDark ? LIGHT : DARK
}
