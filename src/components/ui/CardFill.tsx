/** Fundo pastel que enche o cartão da esquerda para a direita conforme o progresso. */
export function CardFill({ ratio, color }: { ratio: number; color: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      <div
        className="h-full transition-[width] duration-500 ease-out"
        style={{ width: `${ratio * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}
