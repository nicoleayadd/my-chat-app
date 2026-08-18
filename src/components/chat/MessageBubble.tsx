import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isEmpty = !isUser && message.content === ''

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
        )}
      >
        {isEmpty ? (
          <span className="flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}