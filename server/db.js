import mongoose from 'mongoose'

export async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
  console.log('MongoDB connected')
}

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  citations: { type: Array, default: [] },
  metadata: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
})

export const MessageModel = mongoose.model('Message', messageSchema)