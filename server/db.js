import mongoose from 'mongoose'

export async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
  console.log('MongoDB connected')
}

const versionSchema = new mongoose.Schema(
  {
    content: String,
    citations: Array,
    metadata: Object,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const feedbackSchema = new mongoose.Schema(
  {
    rating: { type: String, enum: ['up', 'down', null], default: null },
    reasons: { type: [String], default: [] },
    comment: { type: String, default: '' },
  },
  { _id: false }
)

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  citations: { type: Array, default: [] },
  metadata: { type: Object, default: null },
  versions: { type: [versionSchema], default: [] },
  activeVersionIndex: { type: Number, default: 0 },
  feedback: { type: feedbackSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
})

export const MessageModel = mongoose.model('Message', messageSchema)