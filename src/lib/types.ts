export type Role = 'user' | 'assistant'

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

export interface MessageVersion {
  content: string
  citations: Citation[]
  metadata: MessageMetadata | null
  createdAt: string
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
  citations?: Citation[]
  metadata?: MessageMetadata
  versions?: MessageVersion[]
  activeVersionIndex?: number
}

export interface ConversationSummary {
  _id: string
  firstMessage: string
  lastMessageAt: string
}