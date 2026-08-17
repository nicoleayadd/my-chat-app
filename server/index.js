import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'
import { connectDB, MessageModel } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

await connectDB()

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body

    await MessageModel.create({ conversationId, role: 'user', content: message })

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    })

    await MessageModel.create({ conversationId, role: 'assistant', content: response.text })

    res.json({ content: response.text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/api/chat/:conversationId', async (req, res) => {
  const messages = await MessageModel.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 })
  res.json(messages)
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))