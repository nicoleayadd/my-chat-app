import { useState, useEffect } from 'react'
import { sendMessageStream, loadHistory, getConversationId } from '../lib/api'
import type { Message } from '../lib/types'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory().then((history) => {
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([
          { id: '1', role: 'assistant', content: 'Hey! How can I help today?', createdAt: Date.now() },
        ])
      }
    })
  }, [])

  async function send(content: string) {
    if (!content.trim()) return
    const conversationId = getConversationId()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, createdAt: Date.now() }
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() }])
    setLoading(true)
    setError(null)

    try {
      await sendMessageStream(conversationId, content, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        )
      })
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      if (err.message === 'RATE_LIMIT') {
        setError("Gemini's rate limit was hit — wait a moment and try again.")
      } else {
        setError('Something went wrong sending that message. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, error, send }
}