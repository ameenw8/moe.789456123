import * as React from "react"

import { cn } from "@/lib/utils"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 3000

type ToasterToast = Omit<ToastProps, "open" | "onOpenChange"> & {
  action?: React.ReactNode
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type State = {
  toasts: ToasterToast[]
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: { type: "ADD_TOAST"; toast: ToasterToast } | { type: "DISMISS_TOAST"; toastId: string } | { type: "REMOVE_TOAST"; toastId: string }) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      }
      break
    case "DISMISS_TOAST":
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
    case "REMOVE_TOAST":
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
  }
  listeners.forEach((listener) => listener(memoryState))
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId()
  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id },
  })
  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", toastId: id })
  }, TOAST_REMOVE_DELAY)
  return { id, dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }) }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
