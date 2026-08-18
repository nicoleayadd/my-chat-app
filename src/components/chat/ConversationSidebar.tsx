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
    <div className="w-64 border-r flex flex-col h-screen bg-gray-50">
      <div className="p-3 border-b">
        <Button onClick={onNewChat} className="w-full">+ New Chat</Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm truncate border-b border-gray-100 hover:bg-gray-100',
              c._id === activeId && 'bg-gray-200 font-medium'
            )}
          >
            {c.firstMessage || 'New conversation'}
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-gray-400 p-3">No conversations yet</p>
        )}
      </div>
    </div>
  )
}