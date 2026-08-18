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

export interface Citation {
  index: number
  title: string
  uri: string
}

export interface MessageMetadata {
  model: string
  responseTimeMs: number
  promptTokens: number | null
  responseTokens: number | null
  totalTokens: number | null
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
  citations?: Citation[]
  metadata?: MessageMetadata
}