import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
        )}
      >
        {message.content}
      </div>
    </div>
  )
}