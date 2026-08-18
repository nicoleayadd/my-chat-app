import type { Message, ConversationSummary } from './types'

const BASE_URL = 'http://localhost:3001'

export function getConversationId(): string {
  let id = localStorage.getItem('conversationId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('conversationId', id)
  }
  return id
}

export function setActiveConversationId(id: string) {
  localStorage.setItem('conversationId', id)
}

export function startNewConversation(): string {
  const id = crypto.randomUUID()
  localStorage.setItem('conversationId', id)
  return id
}

export async function sendMessageStream(
  conversationId: string,
  newContent: string,
  onChunk: (text: string) => void,
  onDone: (payload: { fullText: string; citations: any[]; metadata: any }) => void
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
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
      if (payload.done) onDone(payload)
    }
  }
}

export async function loadHistory(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${BASE_URL}/api/chat/${conversationId}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.map((m: any) => ({
    id: m._id,
    role: m.role,
    content: m.content,
    createdAt: new Date(m.createdAt).getTime(),
    citations: m.citations || [],
    metadata: m.metadata || undefined,
  }))
}

export async function loadConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${BASE_URL}/api/conversations`)
  if (!res.ok) return []
  return res.json()
}