// User Profile
export interface UserProfile {
  id: string
  user_id: string
  name: string
  role: string
  company: string
  current_work: string
  looking_for: string[]
  can_offer: string[]
  interests: string[]
  embedding: number[]
  created_at: string
  updated_at: string
}

// Event
export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  source: 'luma' | 'eventbrite' | 'meetup' | 'manual'
  source_url: string
  source_id: string
  created_at: string
}

// Attendee
export interface Attendee {
  id: string
  event_id: string
  name: string
  role: string
  company: string
  bio: string
  photo_url: string
  embedding: number[]
  created_at: string
}

// Intel Card
export interface IntelCard {
  id: string
  user_id: string
  event_id: string
  attendee_id: string
  relevance_score: number
  why_meet: string
  conversation_starter: string
  ask_or_offer: string
  created_at: string
}

// Contact
export interface Contact {
  id: string
  user_id: string
  event_id: string | null
  name: string
  role: string | null
  company: string | null
  topics_discussed: string | null
  commitments: string | null
  follow_up_date: string | null
  follow_up_draft: string | null
  nudge_sent: boolean
  created_at: string
}

// Event with Relevance
export interface EventWithRelevance extends Event {
  relevance_score: number
  relevance_explanation: string
}

// Attendee with Intel
export interface AttendeeWithIntel extends Attendee {
  intel: {
    relevance_score: number
    why_meet: string
    conversation_starter: string
    ask_or_offer: string
  }
}
