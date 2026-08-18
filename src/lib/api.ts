import type { Message } from './types'

const API_URL = 'http://localhost:3001/api/chat'

export function getConversationId(): string {
  let id = localStorage.getItem('conversationId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('conversationId', id)
  }
  return id
}

export async function sendMessage(newContent: string): Promise<Message> {
  const conversationId = getConversationId()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: newContent, conversationId }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: data.content,
    createdAt: Date.now(),
  }
}

export async function loadHistory(): Promise<Message[]> {
  const conversationId = getConversationId()
  const res = await fetch(`http://localhost:3001/api/chat/${conversationId}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.map((m: any) => ({
    id: m._id,
    role: m.role,
    content: m.content,
    createdAt: new Date(m.createdAt).getTime(),
  }))
}

export async function sendMessageStream(
  conversationId: string,
  newContent: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch('http://localhost:3001/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: newContent, conversationId }),
  })

  if (!res.ok || !res.body) {
    throw new Error('SERVER_ERROR')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.startsWith('data: ')) continue
      const payload = JSON.parse(part.slice(6))
      if (payload.error === 'rate_limit') throw new Error('RATE_LIMIT')
      if (payload.error) throw new Error('SERVER_ERROR')
      if (payload.text) onChunk(payload.text)
    }
  }
}