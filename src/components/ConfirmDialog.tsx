import Window98 from './Window98'
import GlossyButton from './GlossyButton'

interface ConfirmDialogProps {
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title = 'confirm', message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <Window98 title={title} className="w-full max-w-xs">
        <p className="font-bubbly text-sm text-deep-purple mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <GlossyButton size="sm" color="lavender" onClick={onCancel}>
            cancel
          </GlossyButton>
          <GlossyButton size="sm" color="bubblegum" onClick={onConfirm}>
            yes, do it
          </GlossyButton>
        </div>
      </Window98>
    </div>
  )
}
