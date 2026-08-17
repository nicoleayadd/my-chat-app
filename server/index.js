import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()
app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    })
    res.json({ content: response.text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))