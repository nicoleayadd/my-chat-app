import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatShell() {
  const { messages, loading, error, send } = useChat()
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border-x">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
      </header>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 border-b border-red-100">
          {error}
        </div>
      )}
      <MessageList messages={messages} />
      <MessageInput onSend={send} disabled={loading} />
    </div>
  )
}