import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Gera favicon, ícones do PWA (64/192/512 + maskable) e apple-touch-icon a partir de public/icon.svg.
// Rode com: npx pwa-assets-generator
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#4f46e5' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#4f46e5' } },
  },
  images: ['public/icon.svg'],
})
