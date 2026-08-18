import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../../lib/types'
import { cn } from '../../lib/utils'

function CitationBadge({ number, citation }: { number: React.ReactNode; citation?: { title: string; uri: string } }) {
  if (!citation) return null
  return (
    <sup className="group relative inline-block mx-0.5 not-italic">
      <span className="cursor-pointer text-indigo-700 bg-indigo-100 rounded px-1 text-[10px] font-semibold hover:bg-indigo-200">
        {number}
      </span>
      <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg z-20 normal-case font-normal">
        <span className="block font-medium mb-0.5 line-clamp-2">{citation.title}</span>
        <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="block text-indigo-300 truncate hover:underline">
          {citation.uri}
        </a>
      </span>
    </sup>
  )
}

function MetadataAccordion({ metadata }: { metadata: NonNullable<Message['metadata']> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-1 text-xs">
      <button onClick={() => setOpen((o) => !o)} className="text-slate-400 hover:text-slate-600">
        {open ? '▾ Hide details' : '▸ Show details'}
      </button>
      {open && (
        <div className="mt-1 text-slate-500 space-y-0.5 bg-slate-50 rounded-lg p-2">
          <div>Model: {metadata.model}</div>
          <div>Response time: {metadata.responseTimeMs}ms</div>
          {metadata.totalTokens != null && (
            <div>
              Tokens: {metadata.promptTokens} prompt + {metadata.responseTokens} response = {metadata.totalTokens} total
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isEmpty = !isUser && message.content === ''

  return (
    <div className={cn('flex w-full flex-col', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
        )}
      >
        {isEmpty ? (
          <span className="flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          </span>
        ) : isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  )
                },
                a({ href, children, ...props }: any) {
                  if (href?.startsWith('citation:')) {
                    const idx = Number(href.replace('citation:', ''))
                    return <CitationBadge number={children} citation={message.citations?.[idx]} />
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline" {...props}>
                      {children}
                    </a>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {!isUser && !isEmpty && message.metadata && <MetadataAccordion metadata={message.metadata} />}
    </div>
  )
}