import { useEffect, useState } from 'react'
import { loadConversations } from '../../lib/api'
import type { ConversationSummary } from '../../lib/types'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { ConfirmDialog } from './ConfirmDialog'
import { Trash2 } from 'lucide-react'

interface Props {
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => void
  refreshKey: number
}

export function ConversationSidebar({ activeId, onSelect, onNewChat, onDelete, refreshKey }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    loadConversations().then(setConversations)
  }, [refreshKey])

  function handleConfirmDelete() {
    if (confirmingId) {
      onDelete(confirmingId)
      setConfirmingId(null)
    }
  }

  return (
    <div className="w-64 border-r flex flex-col h-screen bg-slate-900 text-slate-100">
      <div className="p-3 border-b border-slate-700">
        <Button onClick={onNewChat} className="w-full bg-indigo-600 hover:bg-indigo-500">
          + New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <div
            key={c._id}
            className={cn(
              'group flex items-center border-b border-slate-800 hover:bg-slate-800 transition-colors',
              c._id === activeId && 'bg-slate-800'
            )}
          >
            <button
              onClick={() => onSelect(c._id)}
              className={cn(
                'flex-1 text-left px-3 py-2 text-sm truncate',
                c._id === activeId && 'font-medium text-indigo-300'
              )}
            >
              {c.firstMessage || 'New conversation'}
            </button>
            <button
              onClick={() => setConfirmingId(c._id)}
              className="px-2 py-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-slate-500 p-3">No conversations yet</p>
        )}
      </div>

      {confirmingId && (
        <ConfirmDialog
          title="Delete conversation?"
          message="This will permanently delete this conversation and all its messages. This can't be undone."
          onCancel={() => setConfirmingId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}