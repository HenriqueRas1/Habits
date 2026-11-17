/** Toca um bipe curto (fim da contagem regressiva). Silencioso se o navegador não deixar. */
export function beep() {
  try {
    const AudioCtx = window.AudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
    osc.onended = () => void ctx.close()
  } catch {
    // Sem áudio (navegador bloqueou ou não suporta): o aviso na tela basta.
  }
}
