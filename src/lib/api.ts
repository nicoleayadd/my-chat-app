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