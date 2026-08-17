import type { Message } from './types'

const USE_MOCK = true // flip to false once backend exists

export async function sendMessage(
  history: Message[],
  newContent: string
): Promise<Message> {
  if (USE_MOCK) {
    return mockSendMessage(newContent)
  }
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...history, { role: 'user', content: newContent }] }),
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

async function mockSendMessage(userContent: string): Promise<Message> {
  await new Promise((r) => setTimeout(r, 600)) // fake latency
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `This is a mocked response to: "${userContent}"`,
    createdAt: Date.now(),
  }
}