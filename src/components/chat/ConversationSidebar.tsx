import { useEffect, useState } from 'react'
import { loadConversations } from '../../lib/api'
import type { ConversationSummary } from '../../lib/types'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface Props {
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  refreshKey: number
}

export function ConversationSidebar({ activeId, onSelect, onNewChat, refreshKey }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  useEffect(() => {
    loadConversations().then(setConversations)
  }, [refreshKey])

  return (
    <div className="w-64 border-r flex flex-col h-screen bg-slate-900 text-slate-100">
      <div className="p-3 border-b border-slate-700">
        <Button onClick={onNewChat} className="w-full bg-indigo-600 hover:bg-indigo-500">
          + New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm truncate border-b border-slate-800 hover:bg-slate-800 transition-colors',
              c._id === activeId && 'bg-slate-800 font-medium text-indigo-300'
            )}
          >
            {c.firstMessage || 'New conversation'}
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-slate-500 p-3">No conversations yet</p>
        )}
      </div>
    </div>
  )
}