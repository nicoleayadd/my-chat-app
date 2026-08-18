import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  onRegenerate: (messageId: string) => void
  onSwitchVersion: (messageId: string, index: number) => void
  disabled: boolean
}

export function MessageList({ messages, onRegenerate, onSwitchVersion, disabled }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onRegenerate={onRegenerate}
          onSwitchVersion={onSwitchVersion}
          disabled={disabled}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}