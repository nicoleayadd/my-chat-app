import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatShell() {
  const { messages, loading, send } = useChat()
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border-x">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
      </header>
      <MessageList messages={messages} />
      <MessageInput onSend={send} disabled={loading} />
    </div>
  )
}