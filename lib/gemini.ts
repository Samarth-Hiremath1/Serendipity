import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY!

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

export const genAI = new GoogleGenerativeAI(apiKey)

// Model for text generation
export const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

// Model for embeddings
export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })
