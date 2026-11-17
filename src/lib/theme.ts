export type Theme = 'light' | 'dark' | 'system'

const HINT_KEY = 'theme-hint'

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/** Liga ou desliga a classe .dark no <html> e ajusta a cor da barra do sistema. */
export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#0f172a' : '#4f46e5')
}

/**
 * Último tema usado neste aparelho, só para evitar um "flash" claro ao abrir o app.
 * A fonte da verdade é o perfil no Supabase.
 */
export function readThemeHint(): Theme {
  try {
    const value = localStorage.getItem(HINT_KEY)
    return value === 'dark' || value === 'system' ? value : 'light'
  } catch {
    return 'light'
  }
}

export function saveThemeHint(theme: Theme) {
  try {
    localStorage.setItem(HINT_KEY, theme)
  } catch {
    // Sem armazenamento (aba privada): só perde o atalho; o tema vem do perfil.
  }
}

/** Reaplica o tema "Sistema" quando o aparelho troca entre claro e escuro. */
export function watchSystemTheme(theme: Theme): () => void {
  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!query || theme !== 'system') return () => undefined
  const onChange = () => applyTheme('system')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
