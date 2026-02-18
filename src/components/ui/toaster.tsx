import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 w-full max-w-sm" dir="rtl">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
            t.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-border bg-card text-card-foreground"
          )}
        >
          <div className="flex-1">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
