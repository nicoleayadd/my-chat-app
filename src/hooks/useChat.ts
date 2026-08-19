import { useState, useEffect } from 'react'
import { sendMessageStream, regenerateStream, setActiveVersion, loadHistory } from '../lib/api'
import type { Message } from '../lib/types'

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory(conversationId).then((history) => {
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([
          { id: '1', role: 'assistant', content: 'Hey! How can I help today?', createdAt: Date.now() },
        ])
      }
    })
  }, [conversationId])

  async function send(content: string) {
    if (!content.trim()) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, createdAt: Date.now() }
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() }])
    setLoading(true)
    setError(null)

    try {
      await sendMessageStream(
        conversationId,
        content,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          )
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    id: payload.messageId,
                    content: payload.fullText,
                    citations: payload.citations,
                    metadata: payload.metadata,
                    versions: payload.versions,
                    activeVersionIndex: payload.activeVersionIndex,
                  }
                : m
            )
          )
        }
      )
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

  async function regenerate(messageId: string) {
    setLoading(true)
    setError(null)
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: '' } : m)))

    try {
      await regenerateStream(
        messageId,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, content: m.content + chunk } : m))
          )
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: payload.fullText,
                    citations: payload.citations,
                    metadata: payload.metadata,
                    versions: payload.versions,
                    activeVersionIndex: payload.activeVersionIndex,
                  }
                : m
            )
          )
        }
      )
    } catch (err: any) {
      setError('Failed to regenerate that response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function switchVersion(messageId: string, newIndex: number) {
    const msg = messages.find((m) => m.id === messageId)
    if (!msg?.versions || !msg.versions[newIndex]) return
    const version = msg.versions[newIndex]

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: version.content,
              citations: version.citations,
              metadata: version.metadata ?? undefined,
              activeVersionIndex: newIndex,
            }
          : m
      )
    )

    setActiveVersion(messageId, newIndex).catch(() => {})
  }

  return { messages, loading, error, send, regenerate, switchVersion }
}