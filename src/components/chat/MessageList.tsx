import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { MessageBubble } from './MessageBubble'

export function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}