import { useState, useEffect } from 'react'
import { sendMessage, loadHistory } from '../lib/api'
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
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, createdAt: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const reply = await sendMessage(content)
      setMessages((prev) => [...prev, reply])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, send }
}