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

async function generateAndStream(res, contents, conversationId, existingMsg) {
  const startTime = Date.now()
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3.6-flash',
    contents,
    tools: [{ googleSearch: {} }],
  })

  let fullText = ''
  let groundingMetadata = null
  let usage = null

  for await (const chunk of stream) {
    if (chunk.text) {
      fullText += chunk.text
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
    }
    const gm = chunk.candidates?.[0]?.groundingMetadata
    if (gm) groundingMetadata = gm
    if (chunk.usageMetadata) usage = chunk.usageMetadata
  }

  let citations = []
  let annotatedText = fullText

  if (groundingMetadata?.groundingChunks?.length) {
    citations = groundingMetadata.groundingChunks.map((c, i) => ({
      index: i,
      title: c.web?.title || 'Source',
      uri: c.web?.uri || '',
    }))

    const supports = [...(groundingMetadata.groundingSupports || [])].sort(
      (a, b) => (b.segment?.endIndex || 0) - (a.segment?.endIndex || 0)
    )

    for (const s of supports) {
      const end = s.segment?.endIndex
      if (end == null) continue
      const indices = s.groundingChunkIndices || []
      const marker = indices.map((i) => `[${i + 1}](citation:${i})`).join('')
      annotatedText = annotatedText.slice(0, end) + marker + annotatedText.slice(end)
    }
  }

  const metadata = {
    model: 'gemini-3.6-flash',
    responseTimeMs: Date.now() - startTime,
    promptTokens: usage?.promptTokenCount ?? null,
    responseTokens: usage?.candidatesTokenCount ?? null,
    totalTokens: usage?.totalTokenCount ?? null,
  }

  const newVersion = { content: annotatedText, citations, metadata, createdAt: new Date() }

  let savedMsg
  if (existingMsg) {
    existingMsg.versions.push(newVersion)
    existingMsg.activeVersionIndex = existingMsg.versions.length - 1
    existingMsg.content = annotatedText
    existingMsg.citations = citations
    existingMsg.metadata = metadata
    await existingMsg.save()
    savedMsg = existingMsg
  } else {
    savedMsg = await MessageModel.create({
      conversationId,
      role: 'assistant',
      content: annotatedText,
      citations,
      metadata,
      versions: [newVersion],
      activeVersionIndex: 0,
    })
  }

  res.write(
    `data: ${JSON.stringify({
      done: true,
      fullText: annotatedText,
      citations,
      metadata,
      messageId: savedMsg._id,
      versions: savedMsg.versions,
      activeVersionIndex: savedMsg.activeVersionIndex,
    })}\n\n`
  )
  res.end()
}

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

    await generateAndStream(res, contents, conversationId, null)
  } catch (err) {
    console.error(err)
    const isRateLimit = err?.status === 429 || err?.error?.code === 429
    res.write(`data: ${JSON.stringify({ error: isRateLimit ? 'rate_limit' : 'server_error' })}\n\n`)
    res.end()
  }
})

app.post('/api/chat/regenerate/stream', async (req, res) => {
  const { messageId } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const existingMsg = await MessageModel.findById(messageId)
    if (!existingMsg) {
      res.write(`data: ${JSON.stringify({ error: 'server_error' })}\n\n`)
      return res.end()
    }

    const priorMessages = await MessageModel.find({
      conversationId: existingMsg.conversationId,
      createdAt: { $lt: existingMsg.createdAt },
    }).sort({ createdAt: 1 })

    const contents = priorMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    await generateAndStream(res, contents, existingMsg.conversationId, existingMsg)
  } catch (err) {
    console.error(err)
    const isRateLimit = err?.status === 429 || err?.error?.code === 429
    res.write(`data: ${JSON.stringify({ error: isRateLimit ? 'rate_limit' : 'server_error' })}\n\n`)
    res.end()
  }
})

app.patch('/api/chat/message/:id/feedback', async (req, res) => {
  try {
    const { rating, reasons, comment } = req.body
    if (rating !== 'up' && rating !== 'down' && rating !== null) {
      return res.status(400).json({ error: 'invalid rating' })
    }
    const msg = await MessageModel.findById(req.params.id)
    if (!msg) return res.status(404).json({ error: 'not found' })
    msg.feedback = { rating, reasons: reasons || [], comment: comment || '' }
    await msg.save()
    res.json({ ok: true, feedback: msg.feedback })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.patch('/api/chat/message/:id/feedback', async (req, res) => {
  try {
    const { rating, comment } = req.body
    if (rating !== 'up' && rating !== 'down' && rating !== null) {
      return res.status(400).json({ error: 'invalid rating' })
    }
    const msg = await MessageModel.findById(req.params.id)
    if (!msg) return res.status(404).json({ error: 'not found' })
    msg.feedback = { rating, comment: comment || '' }
    await msg.save()
    res.json({ ok: true, feedback: msg.feedback })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

app.get('/api/chat/:conversationId', async (req, res) => {
  const messages = await MessageModel.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 })
  res.json(messages)
})

app.get('/api/conversations', async (req, res) => {
  const conversations = await MessageModel.aggregate([
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$conversationId',
        firstMessage: { $first: '$content' },
        lastMessageAt: { $last: '$createdAt' },
      },
    },
    { $sort: { lastMessageAt: -1 } },
  ])
  res.json(conversations)
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))