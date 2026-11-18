type Props = {
  /** Fundo do cartão inteiro (a cor do hábito, fraca). */
  base: string
  /** Cor que enche da esquerda para a direita conforme o progresso. */
  fill: string
  ratio: number
}

/** Fundo do cartão em pílula: cor fraca sempre, e o progresso enchendo por cima. */
export function CardFill({ base, fill, ratio }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full transition-colors"
      style={{ backgroundColor: base }}
    >
      <div
        className="h-full transition-[width,background-color] duration-500 ease-out"
        style={{ width: `${ratio * 100}%`, backgroundColor: fill }}
      />
    </div>
  )
}
