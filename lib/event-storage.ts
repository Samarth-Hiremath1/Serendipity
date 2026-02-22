import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Event } from '@/types'
import { RawEvent, fetchEventsWithFallback } from './event-sources'

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseInstance
}

/**
 * Normalize raw event data from different sources into standard Event format
 * Implements Requirement 2.4
 * @param rawEvent - Raw event data from external source
 * @returns Normalized event object ready for database storage
 */
export function normalizeEvent(rawEvent: RawEvent): Omit<Event, 'id' | 'created_at'> {
  return {
    name: rawEvent.name.trim(),
    description: rawEvent.description.trim(),
    date: rawEvent.date,
    location: rawEvent.location.trim(),
    source: rawEvent.source,
    source_url: rawEvent.source_url.trim(),
    source_id: rawEvent.source_id.trim(),
  }
}

/**
 * Store a single event in Supabase with deduplication
 * Uses UNIQUE constraint on (source, source_id) to prevent duplicates
 * Implements Requirement 2.4
 * @param event - Normalized event to store
 * @returns Stored event with id and created_at, or null if duplicate
 */
export async function storeEvent(
  event: Omit<Event, 'id' | 'created_at'>
): Promise<Event | null> {
  try {
    const { data, error } = await getSupabase()
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) {
      // Handle duplicate key error (23505 is PostgreSQL unique violation)
      if (error.code === '23505') {
        console.log(`Event already exists: ${event.source}/${event.source_id}`)
        return null
      }
      throw error
    }

    return data as Event
  } catch (error: any) {
    console.error('Error storing event:', error)
    throw new Error(`Failed to store event: ${error.message}`)
  }
}

/**
 * Store multiple events in Supabase with deduplication
 * Implements Requirement 2.4
 * @param events - Array of normalized events to store
 * @returns Array of successfully stored events (excludes duplicates)
 */
export async function storeEvents(
  events: Omit<Event, 'id' | 'created_at'>[]
): Promise<Event[]> {
  const storedEvents: Event[] = []

  for (const event of events) {
    try {
      const stored = await storeEvent(event)
      if (stored) {
        storedEvents.push(stored)
      }
    } catch (error) {
      // Log error but continue with other events
      console.error(`Failed to store event ${event.name}:`, error)
    }
  }

  return storedEvents
}

/**
 * Retrieve all events from database
 * @returns Array of all events
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []) as Event[]
  } catch (error: any) {
    console.error('Error retrieving events:', error)
    throw new Error(`Failed to retrieve events: ${error.message}`)
  }
}

/**
 * Retrieve upcoming events (future dates only)
 * @returns Array of upcoming events sorted by date
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .gte('date', now)
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []) as Event[]
  } catch (error: any) {
    console.error('Error retrieving upcoming events:', error)
    throw new Error(`Failed to retrieve upcoming events: ${error.message}`)
  }
}

/**
 * Retrieve a single event by ID
 * @param eventId - Event ID to retrieve
 * @returns Event or null if not found
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as Event
  } catch (error: any) {
    console.error('Error retrieving event:', error)
    throw new Error(`Failed to retrieve event: ${error.message}`)
  }
}

/**
 * Retrieve events by source
 * @param source - Event source to filter by
 * @returns Array of events from the specified source
 */
export async function getEventsBySource(
  source: 'luma' | 'eventbrite' | 'meetup' | 'manual'
): Promise<Event[]> {
  try {
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('source', source)
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []) as Event[]
  } catch (error: any) {
    console.error('Error retrieving events by source:', error)
    throw new Error(`Failed to retrieve events by source: ${error.message}`)
  }
}

/**
 * Fetch events from external sources and store in database
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 10.3, 10.4
 * @returns Array of newly stored events
 */
export async function fetchAndStoreEvents(): Promise<Event[]> {
  try {
    // Fetch events with fallback chain
    const rawEvents = await fetchEventsWithFallback()
    
    // Normalize events
    const normalizedEvents = rawEvents.map(normalizeEvent)
    
    // Store events (with deduplication)
    const storedEvents = await storeEvents(normalizedEvents)
    
    console.log(`Stored ${storedEvents.length} new events (${rawEvents.length - storedEvents.length} duplicates skipped)`)
    
    return storedEvents
  } catch (error: any) {
    console.error('Error fetching and storing events:', error)
    throw new Error(`Failed to fetch and store events: ${error.message}`)
  }
}

/**
 * Get events from cache or fetch fresh if cache is stale
 * Implements Requirement 10.4 (return cached events if sources fail)
 * @param maxAgeHours - Maximum age of cached events in hours (default: 24)
 * @returns Array of events (from cache or fresh)
 */
export async function getEventsWithCache(maxAgeHours: number = 24): Promise<Event[]> {
  try {
    // Try to get cached events first
    const cachedEvents = await getUpcomingEvents()
    
    // Check if we have recent events
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours)
    
    const hasRecentEvents = cachedEvents.some(
      event => new Date(event.created_at) > cutoffDate
    )
    
    if (hasRecentEvents && cachedEvents.length > 0) {
      console.log(`Returning ${cachedEvents.length} cached events`)
      return cachedEvents
    }
    
    // Cache is stale or empty, fetch fresh events
    console.log('Cache is stale, fetching fresh events...')
    try {
      await fetchAndStoreEvents()
      return await getUpcomingEvents()
    } catch (fetchError) {
      // If fetch fails, return cached events anyway (Requirement 10.4)
      console.log('Fetch failed, returning cached events as fallback')
      return cachedEvents
    }
  } catch (error: any) {
    console.error('Error getting events with cache:', error)
    throw new Error(`Failed to get events: ${error.message}`)
  }
}
