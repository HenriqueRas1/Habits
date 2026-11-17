import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, readThemeHint } from './lib/theme.ts'

// Antes do primeiro desenho: evita piscar claro quando o tema salvo é escuro.
applyTheme(readThemeHint())

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root não encontrado')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
