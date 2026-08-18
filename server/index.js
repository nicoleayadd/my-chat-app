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

app.post('/api/chat/stream', async (req, res) => {
  const { message, conversationId } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    await MessageModel.create({ conversationId, role: 'user', content: message })

    const history = await MessageModel.find({ conversationId }).sort({ createdAt: 1 })
    const contents = history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents,
    })

    let fullText = ''
    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
      }
    }

    await MessageModel.create({ conversationId, role: 'assistant', content: fullText })

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err) {
    console.error(err)
    const isRateLimit = err?.status === 429 || err?.error?.code === 429
    res.write(`data: ${JSON.stringify({ error: isRateLimit ? 'rate_limit' : 'server_error' })}\n\n`)
    res.end()
  }
})

app.get('/api/chat/:conversationId', async (req, res) => {
  const messages = await MessageModel.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 })
  res.json(messages)
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))