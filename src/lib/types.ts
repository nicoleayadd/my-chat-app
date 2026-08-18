export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
}

export interface ConversationSummary {
  _id: string
  firstMessage: string
  lastMessageAt: string
}