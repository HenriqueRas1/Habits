import { useState } from 'react'
import { PromptDialog } from '../../components/ui/PromptDialog.tsx'
import type { ActiveTimer } from '../../types/domain.ts'
import { TimerButton } from '../timers/TimerButton.tsx'
import type { HabitDay } from './habitDay.ts'
import type { DayActions } from './useDayActions.ts'

type Props = {
  day: HabitDay
  actions: DayActions
  isToday: boolean
  /** Timer em andamento deste hábito (só hábitos de tempo). */
  timer?: ActiveTimer
}

/** O controle principal do cartão: check para metas de check, − e + para quantidade e tempo. */
export function CardControl({ day, actions, isToday, timer }: Props) {
  const { habit } = day
  const [askMinutes, setAskMinutes] = useState(false)

  if (habit.goal_kind === 'check') {
    const done = day.doneEntries.length > 0
    return (
      <button
        type="button"
        aria-pressed={done}
        aria-label={`${habit.name}: ${
          done
            ? `feito ${isToday ? 'hoje' : 'neste dia'}, toque para desmarcar`
            : 'marcar como feito'
        }`}
        onClick={actions.toggleCheck}
        className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
          done ? 'border-current' : 'bg-surface/70'
        }`}
        style={done ? undefined : { borderColor: `${habit.color}99` }}
      >
        {done && (
          <svg
            viewBox="0 0 24 24"
            className="animate-pop size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden
          >
            <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {habit.goal_kind === 'duration' && isToday && (
        <TimerButton
          habit={habit}
          timer={timer}
          doneToday={day.doneEntries.reduce((sum, e) => sum + Number(e.value), 0)}
          date={day.date}
        />
      )}
      <StepButton
        label={`${habit.name}: desfazer o último registro`}
        disabled={day.doneEntries.length === 0}
        onClick={actions.removeLast}
        color={habit.color}
      >
        −
      </StepButton>
      <StepButton
        label={
          habit.goal_kind === 'duration'
            ? `${habit.name}: adicionar minutos`
            : `${habit.name}: adicionar 1`
        }
        onClick={() => (habit.goal_kind === 'duration' ? setAskMinutes(true) : actions.add(1))}
        color={habit.color}
        filled
      >
        +
      </StepButton>
      {askMinutes && (
        <PromptDialog
          title={habit.name}
          label="Quantos minutos?"
          type="number"
          min={1}
          confirmLabel="Adicionar"
          onConfirm={(v) => actions.add(Number(v))}
          onClose={() => setAskMinutes(false)}
        />
      )}
    </div>
  )
}

function StepButton(props: {
  label: string
  onClick: () => void
  color: string
  disabled?: boolean
  filled?: boolean
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className={`flex size-10 items-center justify-center rounded-full border-2 text-xl font-semibold text-slate-700 transition-all active:scale-90 disabled:opacity-30 ${
        props.filled ? 'bg-surface' : 'bg-surface/60'
      }`}
      style={{ borderColor: `${props.color}99` }}
    >
      {props.children}
    </button>
  )
}
