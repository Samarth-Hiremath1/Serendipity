import { describe, it, expect } from 'vitest'
import { normalizeEvent } from './event-storage'
import { RawEvent } from './event-sources'

describe('Event Storage', () => {
  describe('normalizeEvent', () => {
    it('should normalize a raw event from Luma', () => {
      const rawEvent: RawEvent = {
        name: '  Tech Meetup  ',
        description: '  A great tech event  ',
        date: '2024-03-15T18:00:00Z',
        location: '  San Francisco, CA  ',
        source: 'luma',
        source_url: '  https://lu.ma/event123  ',
        source_id: '  event123  ',
      }

      const normalized = normalizeEvent(rawEvent)

      expect(normalized.name).toBe('Tech Meetup')
      expect(normalized.description).toBe('A great tech event')
      expect(normalized.location).toBe('San Francisco, CA')
      expect(normalized.source).toBe('luma')
      expect(normalized.source_url).toBe('https://lu.ma/event123')
      expect(normalized.source_id).toBe('event123')
    })

    it('should normalize a raw event from Eventbrite', () => {
      const rawEvent: RawEvent = {
        name: 'Startup Networking',
        description: 'Connect with founders',
        date: '2024-04-20T19:00:00Z',
        location: 'San Francisco, CA',
        source: 'eventbrite',
        source_url: 'https://eventbrite.com/e/12345',
        source_id: '12345',
      }

      const normalized = normalizeEvent(rawEvent)

      expect(normalized.source).toBe('eventbrite')
      expect(normalized.name).toBe('Startup Networking')
    })

    it('should normalize a raw event from Meetup', () => {
      const rawEvent: RawEvent = {
        name: 'Developer Meetup',
        description: 'Monthly dev gathering',
        date: '2024-05-10T18:30:00Z',
        location: 'San Francisco, CA',
        source: 'meetup',
        source_url: 'https://meetup.com/group/event',
        source_id: 'event-slug',
      }

      const normalized = normalizeEvent(rawEvent)

      expect(normalized.source).toBe('meetup')
      expect(normalized.name).toBe('Developer Meetup')
    })
  })
})
