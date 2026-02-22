import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { generateEmbedding, generateText, generateJSON } from './gemini'

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Request types for AI cache
 */
export type RequestType = 'embedding' | 'generation' | 'parsing'

/**
 * AI Cache entry structure
 */
export interface AICacheEntry {
  id: string
  cache_key: string
  request_type: RequestType
  request_params: any
  response: any
  created_at: string
}

/**
 * Generate a SHA-256 hash cache key from request parameters
 * @param requestType - Type of request (embedding, generation, parsing)
 * @param params - Request parameters to hash
 * @returns SHA-256 hash string
 */
export function generateCacheKey(requestType: RequestType, params: any): string {
  const data = JSON.stringify({ type: requestType, params })
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Look up cached response in database
 * @param cacheKey - The cache key to look up
 * @returns Cached response or null if not found
 */
export async function getCachedResponse(cacheKey: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('ai_cache')
      .select('response')
      .eq('cache_key', cacheKey)
      .single()
    
    if (error) {
      // Not found is expected, don't throw
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching from cache:', error)
      return null
    }
    
    return data?.response || null
  } catch (error) {
    console.error('Unexpected error fetching from cache:', error)
    return null
  }
}

/**
 * Store response in cache
 * @param cacheKey - The cache key
 * @param requestType - Type of request
 * @param requestParams - Original request parameters
 * @param response - Response to cache
 */
export async function storeCachedResponse(
  cacheKey: string,
  requestType: RequestType,
  requestParams: any,
  response: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_cache')
      .insert({
        cache_key: cacheKey,
        request_type: requestType,
        request_params: requestParams,
        response: response,
      })
    
    if (error) {
      // Ignore duplicate key errors (race condition)
      if (error.code === '23505') {
        return
      }
      console.error('Error storing in cache:', error)
    }
  } catch (error) {
    console.error('Unexpected error storing in cache:', error)
  }
}

/**
 * Generate embedding with caching
 * @param text - Text to generate embedding for
 * @returns 768-dimensional embedding vector
 */
export async function generateEmbeddingCached(text: string): Promise<number[]> {
  const requestParams = { text }
  const cacheKey = generateCacheKey('embedding', requestParams)
  
  // Check cache first
  const cached = await getCachedResponse(cacheKey)
  if (cached && Array.isArray(cached.embedding)) {
    return cached.embedding
  }
  
  // Cache miss - call API
  const embedding = await generateEmbedding(text)
  
  // Store in cache
  await storeCachedResponse(cacheKey, 'embedding', requestParams, { embedding })
  
  return embedding
}

/**
 * Generate text with caching
 * @param prompt - Prompt to generate text from
 * @param options - Optional generation configuration
 * @returns Generated text
 */
export async function generateTextCached(
  prompt: string,
  options?: {
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<string> {
  const requestParams = { prompt, options }
  const cacheKey = generateCacheKey('generation', requestParams)
  
  // Check cache first
  const cached = await getCachedResponse(cacheKey)
  if (cached && typeof cached.text === 'string') {
    return cached.text
  }
  
  // Cache miss - call API
  const text = await generateText(prompt, options)
  
  // Store in cache
  await storeCachedResponse(cacheKey, 'generation', requestParams, { text })
  
  return text
}

/**
 * Generate JSON with caching
 * @param prompt - Prompt to generate JSON from
 * @param options - Optional generation configuration
 * @returns Parsed JSON response
 */
export async function generateJSONCached<T = any>(
  prompt: string,
  options?: {
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<T> {
  const requestParams = { prompt, options }
  const cacheKey = generateCacheKey('generation', requestParams)
  
  // Check cache first
  const cached = await getCachedResponse(cacheKey)
  if (cached && cached.json) {
    return cached.json as T
  }
  
  // Cache miss - call API
  const json = await generateJSON<T>(prompt, options)
  
  // Store in cache
  await storeCachedResponse(cacheKey, 'generation', requestParams, { json })
  
  return json
}

/**
 * Parse text with caching (for contact parsing, etc.)
 * @param text - Text to parse
 * @param prompt - Parsing prompt/instructions
 * @returns Parsed result
 */
export async function parseTextCached<T = any>(
  text: string,
  prompt: string
): Promise<T> {
  const requestParams = { text, prompt }
  const cacheKey = generateCacheKey('parsing', requestParams)
  
  // Check cache first
  const cached = await getCachedResponse(cacheKey)
  if (cached && cached.parsed) {
    return cached.parsed as T
  }
  
  // Cache miss - call API
  const fullPrompt = `${prompt}\n\nText to parse:\n${text}`
  const parsed = await generateJSON<T>(fullPrompt)
  
  // Store in cache
  await storeCachedResponse(cacheKey, 'parsing', requestParams, { parsed })
  
  return parsed
}
