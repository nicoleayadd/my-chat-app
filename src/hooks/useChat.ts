import { useState, useEffect } from 'react'
import { sendMessageStream, loadHistory, getConversationId } from '../lib/api'
import type { Message } from '../lib/types'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

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

    try {
      await sendMessageStream(conversationId, content, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        )
      })
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send }
}