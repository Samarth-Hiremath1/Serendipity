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

/**
 * Generate embedding vector for text using text-embedding-004 model
 * Returns a 768-dimensional vector
 * @param text - The text to generate an embedding for
 * @returns Promise<number[]> - 768-dimensional embedding vector
 * @throws Error if API call fails or rate limit is exceeded
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text)
    const embedding = result.embedding
    
    if (!embedding || !embedding.values || embedding.values.length === 0) {
      throw new Error('Invalid embedding response from Gemini API')
    }
    
    return embedding.values
  } catch (error: any) {
    // Handle rate limit errors
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      throw new Error('RATE_LIMIT: Gemini API rate limit exceeded. Please try again later.')
    }
    
    // Handle other API errors
    if (error?.status >= 500) {
      throw new Error('API_ERROR: Gemini API service temporarily unavailable. Please try again.')
    }
    
    // Re-throw with context
    throw new Error(`Failed to generate embedding: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Generate text using gemini-2.5-flash-lite model
 * @param prompt - The prompt to generate text from
 * @param options - Optional configuration for generation
 * @returns Promise<string> - Generated text response
 * @throws Error if API call fails or rate limit is exceeded
 */
export async function generateText(
  prompt: string,
  options?: {
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      },
    })
    
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('Empty response from Gemini API')
    }
    
    return text
  } catch (error: any) {
    // Handle rate limit errors
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      throw new Error('RATE_LIMIT: Gemini API rate limit exceeded. Please try again later.')
    }
    
    // Handle other API errors
    if (error?.status >= 500) {
      throw new Error('API_ERROR: Gemini API service temporarily unavailable. Please try again.')
    }
    
    // Re-throw with context
    throw new Error(`Failed to generate text: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Generate structured JSON response using gemini-2.5-flash-lite model
 * @param prompt - The prompt to generate JSON from
 * @param options - Optional configuration for generation
 * @returns Promise<T> - Parsed JSON response
 * @throws Error if API call fails, rate limit is exceeded, or JSON parsing fails
 */
export async function generateJSON<T = any>(
  prompt: string,
  options?: {
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<T> {
  try {
    const text = await generateText(prompt, options)
    
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    
    // Parse JSON
    const parsed = JSON.parse(jsonText.trim())
    return parsed as T
  } catch (error: any) {
    // If it's already a rate limit or API error, re-throw
    if (error?.message?.startsWith('RATE_LIMIT:') || error?.message?.startsWith('API_ERROR:')) {
      throw error
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON response: ${error.message}`)
    }
    
    // Re-throw with context
    throw new Error(`Failed to generate JSON: ${error?.message || 'Unknown error'}`)
  }
}
