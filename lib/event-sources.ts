import { Event } from '@/types'

/**
 * Raw event data from external sources before normalization
 */
export interface RawEvent {
  name: string
  description: string
  date: string
  location: string
  source: 'luma' | 'eventbrite' | 'meetup'
  source_url: string
  source_id: string
}

/**
 * Fetch events from Luma discover endpoint (primary source)
 * @returns Array of raw events from Luma
 * @throws Error if fetch fails
 */
export async function fetchLumaEvents(): Promise<RawEvent[]> {
  try {
    // Luma internal discover endpoint
    // Note: This is a demo implementation - in production, you'd use the actual Luma API
    const response = await fetch('https://lu.ma/api/discover/get-paginated-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pagination: {
          limit: 20,
        },
        filters: {
          location: 'San Francisco, CA',
          event_type: 'in_person',
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Luma API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Parse Luma response format
    const events: RawEvent[] = (data.entries || []).map((entry: any) => ({
      name: entry.event?.name || 'Untitled Event',
      description: entry.event?.description || '',
      date: entry.event?.start_at || new Date().toISOString(),
      location: entry.event?.geo_address_json?.city_state || 'San Francisco, CA',
      source: 'luma' as const,
      source_url: entry.event?.url || `https://lu.ma/${entry.api_id}`,
      source_id: entry.api_id || entry.event?.api_id || '',
    }))

    return events
  } catch (error: any) {
    console.error('Luma fetch error:', error.message)
    throw new Error(`Failed to fetch from Luma: ${error.message}`)
  }
}

/**
 * Fetch events from Eventbrite API (fallback source)
 * @returns Array of raw events from Eventbrite
 * @throws Error if fetch fails
 */
export async function fetchEventbriteEvents(): Promise<RawEvent[]> {
  try {
    const apiKey = process.env.EVENTBRITE_API_KEY
    
    if (!apiKey) {
      throw new Error('EVENTBRITE_API_KEY not configured')
    }

    // Eventbrite API endpoint for searching events
    const response = await fetch(
      'https://www.eventbriteapi.com/v3/events/search/?location.address=San%20Francisco&location.within=10mi&expand=venue',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Eventbrite API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Parse Eventbrite response format
    const events: RawEvent[] = (data.events || []).map((event: any) => ({
      name: event.name?.text || 'Untitled Event',
      description: event.description?.text || event.summary || '',
      date: event.start?.utc || new Date().toISOString(),
      location: event.venue?.address?.city || 'San Francisco, CA',
      source: 'eventbrite' as const,
      source_url: event.url || '',
      source_id: event.id || '',
    }))

    return events
  } catch (error: any) {
    console.error('Eventbrite fetch error:', error.message)
    throw new Error(`Failed to fetch from Eventbrite: ${error.message}`)
  }
}

/**
 * Fetch events from Meetup by scraping HTML (final fallback)
 * @returns Array of raw events from Meetup
 * @throws Error if fetch fails
 */
export async function fetchMeetupEvents(): Promise<RawEvent[]> {
  try {
    // Meetup search URL for San Francisco tech events
    const response = await fetch(
      'https://www.meetup.com/find/?location=us--ca--san_francisco&source=EVENTS&keywords=tech'
    )

    if (!response.ok) {
      throw new Error(`Meetup returned ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse HTML to extract event data
    // Note: This is a simplified implementation - in production, you'd use a proper HTML parser
    const events: RawEvent[] = []
    
    // Look for JSON-LD structured data in the HTML
    const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)
    
    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1])
        
        if (jsonData['@type'] === 'Event' || (Array.isArray(jsonData) && jsonData.some((item: any) => item['@type'] === 'Event'))) {
          const eventData = Array.isArray(jsonData) ? jsonData.find((item: any) => item['@type'] === 'Event') : jsonData
          
          if (eventData) {
            events.push({
              name: eventData.name || 'Untitled Event',
              description: eventData.description || '',
              date: eventData.startDate || new Date().toISOString(),
              location: eventData.location?.address?.addressLocality || 'San Francisco, CA',
              source: 'meetup' as const,
              source_url: eventData.url || '',
              source_id: eventData.url?.split('/').pop() || '',
            })
          }
        }
      } catch (parseError) {
        // Skip invalid JSON-LD blocks
        continue
      }
    }

    if (events.length === 0) {
      throw new Error('No events found in Meetup HTML')
    }

    return events
  } catch (error: any) {
    console.error('Meetup fetch error:', error.message)
    throw new Error(`Failed to fetch from Meetup: ${error.message}`)
  }
}

/**
 * Fetch events with fallback chain: Luma → Eventbrite → Meetup
 * Implements Requirements 2.1, 2.2, 2.3, 10.3, 10.4
 * @returns Array of raw events from the first successful source
 * @throws Error if all sources fail
 */
export async function fetchEventsWithFallback(): Promise<RawEvent[]> {
  const errors: string[] = []

  // Try Luma first (primary source)
  try {
    console.log('Attempting to fetch events from Luma...')
    const events = await fetchLumaEvents()
    if (events.length > 0) {
      console.log(`Successfully fetched ${events.length} events from Luma`)
      return events
    }
    errors.push('Luma: No events returned')
  } catch (error: any) {
    errors.push(`Luma: ${error.message}`)
    console.log('Luma failed, trying Eventbrite...')
  }

  // Try Eventbrite (fallback)
  try {
    console.log('Attempting to fetch events from Eventbrite...')
    const events = await fetchEventbriteEvents()
    if (events.length > 0) {
      console.log(`Successfully fetched ${events.length} events from Eventbrite`)
      return events
    }
    errors.push('Eventbrite: No events returned')
  } catch (error: any) {
    errors.push(`Eventbrite: ${error.message}`)
    console.log('Eventbrite failed, trying Meetup...')
  }

  // Try Meetup (final fallback)
  try {
    console.log('Attempting to fetch events from Meetup...')
    const events = await fetchMeetupEvents()
    if (events.length > 0) {
      console.log(`Successfully fetched ${events.length} events from Meetup`)
      return events
    }
    errors.push('Meetup: No events returned')
  } catch (error: any) {
    errors.push(`Meetup: ${error.message}`)
  }

  // All sources failed
  const errorMessage = `All event sources failed:\n${errors.join('\n')}`
  console.error(errorMessage)
  throw new Error(errorMessage)
}
