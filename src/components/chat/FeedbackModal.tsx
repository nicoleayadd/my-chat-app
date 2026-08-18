import { useState } from 'react'

const REASONS = ['Not helpful', 'Factually incorrect', 'Too long / verbose', "Didn't follow instructions", 'Other']

interface Props {
  onCancel: () => void
  onSubmit: (reasons: string[], comment: string) => void
}

export function FeedbackModal({ onCancel, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [comment, setComment] = useState('')

  function toggleReason(reason: string) {
    setSelected((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-1">What went wrong?</h3>
        <p className="text-xs text-slate-500 mb-3">Select any that apply (optional)</p>

        <div className="space-y-2 mb-3">
          {REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(reason)}
                onChange={() => toggleReason(reason)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {reason}
            </label>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Additional comments (optional)"
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg p-2 mb-4 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selected, comment)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}