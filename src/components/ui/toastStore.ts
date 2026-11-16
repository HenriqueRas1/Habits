import { create } from 'zustand'

type ToastState = {
  message: string | null
  id: number
}

export const useToastStore = create<ToastState>(() => ({ message: null, id: 0 }))

export function showToast(message: string) {
  useToastStore.setState((s) => ({ message, id: s.id + 1 }))
}

export function hideToast() {
  useToastStore.setState({ message: null })
}
