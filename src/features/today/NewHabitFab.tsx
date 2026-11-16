import { Link } from 'react-router'

/** Botão flutuante "+" no celular e no tablet (no PC, o botão fica no topo da Hoje). */
export function NewHabitFab() {
  return (
    <Link
      to="/habits/new"
      aria-label="Novo hábito"
      className="bg-brand-600 hover:bg-brand-700 fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 flex size-14 items-center justify-center rounded-full text-white shadow-lg lg:hidden"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </Link>
  )
}
