import { useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ConversationSidebar } from './ConversationSidebar'
import { getConversationId, startNewConversation, setActiveConversationId } from '../../lib/api'

export function ChatShell() {
  const [conversationId, setConversationId] = useState(getConversationId())
  const [refreshKey, setRefreshKey] = useState(0)
  const { messages, loading, error, send } = useChat(conversationId)

  function handleNewChat() {
    const id = startNewConversation()
    setConversationId(id)
  }

  function handleSelect(id: string) {
    setActiveConversationId(id)
    setConversationId(id)
  }

  async function handleSend(content: string) {
    await send(content)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <ConversationSidebar
        activeId={conversationId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        refreshKey={refreshKey}
      />
      <div className="flex flex-col flex-1 bg-white shadow-sm">
        <header className="border-b px-4 py-3 bg-indigo-600">
          <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
        </header>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 border-b border-red-100">
            {error}
          </div>
        )}
        <MessageList messages={messages} />
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}