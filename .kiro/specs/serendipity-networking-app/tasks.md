# Implementation Plan: Serendipity Networking App

## Overview

This implementation plan breaks down the Serendipity networking app into discrete, incremental coding tasks. Each task builds on previous work, with checkpoints to validate progress. The plan follows the 24-hour build timeline with focus on core features first (P0), then essential features (P1), with testing integrated throughout.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize Next.js 14+ project with TypeScript and Tailwind CSS
  - Configure environment variables for Supabase and Gemini API
  - Set up project structure: `/app`, `/components`, `/lib`, `/types`
  - Install dependencies: `@supabase/supabase-js`, `@google/generative-ai`, `fast-check`, `crypto`
  - _Requirements: All_

- [x] 2. Database schema and Supabase configuration
  - [x] 2.1 Create Supabase tables with SQL migrations
    - Create `user_profiles` table with pgvector embedding column
    - Create `events` table with source tracking
    - Create `attendees` table with pgvector embedding column
    - Create `event_relevance` table for caching scores
    - Create `intel_cards` table for caching recommendations
    - Create `contacts` table for CRM
    - Create `ai_cache` table for API response caching
    - Add indexes: vector indexes (ivfflat), foreign keys, unique constraints
    - _Requirements: 1.6, 2.4, 3.5, 6.6, 7.7, 9.3_

  - [ ]* 2.2 Write property test for data persistence round-trip
    - **Property 3: Data persistence round-trip**
    - **Validates: Requirements 1.6, 2.4, 3.5, 6.6, 7.7**

- [x] 3. Authentication setup
  - Configure Supabase Auth with email/magic link
  - Create auth middleware for protected routes
  - Implement sign-up and login pages
  - Add auth state management (Supabase client-side)
  - _Requirements: 1.1, 1.2_

- [x] 4. Gemini API integration and caching layer
  - [x] 4.1 Create Gemini API client wrapper
    - Implement embedding generation function using `text-embedding-004`
    - Implement text generation function using `gemini-2.5-flash-lite`
    - Add error handling for API failures and rate limits
    - _Requirements: 1.5, 2.5, 3.2, 5.5, 6.3, 7.6_

  - [x] 4.2 Implement AI response caching system
    - Create cache key generation (SHA-256 hash of request params)
    - Implement cache lookup before API calls
    - Implement cache storage after API calls
    - Add cache retrieval functions
    - _Requirements: 1.7, 2.8, 3.7, 4.5, 5.7, 6.8, 7.8, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 4.3 Write property test for AI response caching
    - **Property 4: AI response caching prevents redundant calls**
    - **Validates: Requirements 1.7, 2.8, 3.7, 4.5, 5.7, 6.8, 7.8**

  - [ ]* 4.4 Write property tests for cache behavior
    - **Property 17: Cache hit returns stored response**
    - **Property 18: Cache miss stores new response**
    - **Validates: Requirements 9.2, 9.3, 9.4**

- [x] 5. User profile creation and onboarding
  - [x] 5.1 Create profile form component
    - Build multi-field form with validation
    - Add fields: name, role, company, current_work (textarea), looking_for (multi-select), can_offer (multi-select), interests (tags input)
    - Implement client-side validation for required fields
    - _Requirements: 1.3, 1.4_

  - [x] 5.2 Create profile API route
    - Implement `POST /api/profile` endpoint
    - Validate profile data server-side
    - Generate embedding from profile text using Gemini
    - Store profile and embedding in Supabase
    - _Requirements: 1.5, 1.6, 1.7_

  - [x] 5.3 Create onboarding page
    - Build `/onboard` page with ProfileSetupForm component
    - Handle form submission and loading states
    - Redirect to `/events` on success
    - _Requirements: 1.2_

  - [ ]* 5.4 Write property test for profile validation
    - **Property 1: Profile validation rejects incomplete data**
    - **Validates: Requirements 1.4**

  - [ ]* 5.5 Write property test for embedding generation
    - **Property 2: Valid profiles generate embeddings**
    - **Validates: Requirements 1.5**

- [ ] 6. Checkpoint - Verify onboarding flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Event data fetching and aggregation
  - [ ] 7.1 Implement event source integrations
    - Create Luma discover endpoint fetcher (primary source)
    - Create Eventbrite API fetcher (fallback)
    - Create Meetup HTML scraper (final fallback)
    - Implement fallback chain logic with error handling
    - _Requirements: 2.1, 2.2, 2.3, 10.3, 10.4_

  - [ ] 7.2 Create event storage and retrieval
    - Implement event normalization from different sources
    - Store events in Supabase with deduplication (UNIQUE constraint on source + source_id)
    - Create event retrieval functions
    - _Requirements: 2.4_

  - [ ]* 7.3 Write unit tests for event source fallbacks
    - Test Luma → Eventbrite → Meetup fallback chain
    - Test error handling for each source
    - _Requirements: 2.2, 2.3, 10.3_

- [ ] 8. Event relevance scoring
  - [ ] 8.1 Implement relevance scoring algorithm
    - Create function to calculate relevance score using Gemini
    - Generate one-sentence explanation for each score
    - Store scores in `event_relevance` table with caching
    - _Requirements: 2.5, 2.6, 2.8_

  - [ ] 8.2 Create events API route
    - Implement `GET /api/events` endpoint
    - Fetch events from sources or cache
    - Calculate relevance scores for current user
    - Return events sorted by relevance score descending
    - _Requirements: 2.7_

  - [ ]* 8.3 Write property test for event relevance scoring
    - **Property 5: Event relevance scoring completeness**
    - **Validates: Requirements 2.5, 2.6**

  - [ ]* 8.4 Write property test for list sorting
    - **Property 6: List sorting invariant**
    - **Validates: Requirements 2.7, 8.6**

- [ ] 9. Event feed page
  - [ ] 9.1 Create EventCard component
    - Display event name, date, location, description
    - Show relevance score badge and explanation
    - Handle click to navigate to event intel page
    - _Requirements: 2.7_

  - [ ] 9.2 Create events feed page
    - Build `/events` page that fetches and displays events
    - Show loading state during fetch
    - Handle empty state (no events)
    - _Requirements: 2.7_

- [ ] 10. Checkpoint - Verify event feed
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Attendee persona generation
  - [ ] 11.1 Implement attendee generation
    - Create prompt for generating 8-10 SF tech personas
    - Include archetypes: founder, PM, engineer, investor, operator
    - Generate realistic names, roles, companies, bios
    - Generate embeddings for each attendee bio
    - Store attendees in Supabase with event_id
    - Ensure consistency (same attendees for same event)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 11.2 Create attendee generation API route
    - Implement `POST /api/events/[id]/attendees` endpoint
    - Check if attendees exist for event
    - Generate if not exist, return existing if present
    - _Requirements: 3.1_

  - [ ]* 11.3 Write property test for attendee generation
    - **Property 7: Attendee generation produces valid personas**
    - **Validates: Requirements 3.2, 3.3, 3.4**

  - [ ]* 11.4 Write property test for attendee consistency
    - **Property 8: Attendee consistency (idempotence)**
    - **Validates: Requirements 3.6**

- [ ] 12. Attendee matching and ranking
  - [ ] 12.1 Implement vector similarity matching
    - Create function to calculate cosine similarity between user and attendee embeddings
    - Rank attendees by similarity score
    - Return top 3-5 matches
    - Cache results in `intel_cards` table
    - _Requirements: 4.3, 4.4, 4.5_

  - [ ]* 12.2 Write property test for attendee ranking
    - **Property 9: Top attendee ranking and filtering**
    - **Validates: Requirements 4.4**

- [ ] 13. Intel card generation
  - [ ] 13.1 Implement intel card generation
    - Create prompt for generating intel cards with user + attendee context
    - Generate: why_meet (specific reason), conversation_starter (non-generic), ask_or_offer (suggested action)
    - Ensure all three fields are non-empty
    - Store intel cards in Supabase with caching
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [ ] 13.2 Create intel API route
    - Implement `GET /api/events/[id]/intel` endpoint
    - Generate intel cards for top attendees
    - Return cached results on repeat visits
    - _Requirements: 5.8_

  - [ ]* 13.3 Write property test for intel card completeness
    - **Property 11: Intel card generation completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 14. Event intel page
  - [ ] 14.1 Create IntelCard component
    - Display attendee photo, name, role, company
    - Show why_meet, conversation_starter, ask_or_offer sections
    - Use expandable/collapsible design
    - _Requirements: 4.6, 5.1_

  - [ ] 14.2 Create event intel page
    - Build `/events/[id]` page
    - Display event details (name, date, location, description)
    - Show top 3-5 attendees with intel cards
    - Handle loading states during intel generation
    - _Requirements: 4.1, 4.2_

  - [ ]* 14.3 Write property test for rendered output completeness
    - **Property 10: Rendered output completeness**
    - **Validates: Requirements 4.2, 4.6, 8.3, 8.4**

- [ ] 15. Checkpoint - Verify event intel flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Contact logging and parsing
  - [ ] 16.1 Implement contact note parser
    - Create prompt for parsing freeform notes
    - Extract: name, role, company, topics_discussed, commitments, follow_up_date
    - Handle parsing errors gracefully
    - Cache parsing results
    - _Requirements: 6.3, 6.4, 6.5, 6.8_

  - [ ] 16.2 Create contact logging page
    - Build `/contacts/new` page with textarea input
    - Handle form submission and loading states
    - Show parsed result for confirmation
    - Store contact in Supabase with event_id link
    - _Requirements: 6.1, 6.2, 6.6, 6.7_

  - [ ]* 16.3 Write property test for contact parsing
    - **Property 12: Contact parsing extracts required fields**
    - **Validates: Requirements 6.4**

  - [ ]* 16.4 Write property test for invalid input handling
    - **Property 13: Invalid input error handling**
    - **Validates: Requirements 6.5, 10.6**

  - [ ]* 16.5 Write property test for referential integrity
    - **Property 14: Contact-event referential integrity**
    - **Validates: Requirements 6.7**

- [ ] 17. Follow-up message generation
  - [ ] 17.1 Implement follow-up draft generator
    - Create prompt for generating follow-up messages
    - Include event name and topics discussed in draft
    - Ensure draft is 5 sentences or fewer
    - Store draft with contact record
    - Cache generation results
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.8_

  - [ ] 17.2 Integrate follow-up generation into contact creation
    - Automatically generate draft when contact is created
    - Store draft in contact record
    - _Requirements: 7.1_

  - [ ]* 17.3 Write property test for follow-up draft generation
    - **Property 15: Follow-up draft generation and content**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.5**

- [ ] 18. CRM dashboard
  - [ ] 18.1 Create ContactCard component
    - Display contact name, role, company
    - Show event met at and follow-up date
    - Display follow-up draft with copy button
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ] 18.2 Create contacts API route
    - Implement `GET /api/contacts` endpoint
    - Fetch all contacts for current user
    - Sort by follow-up date descending
    - _Requirements: 8.2, 8.6_

  - [ ] 18.3 Create CRM dashboard page
    - Build `/contacts` page
    - Display all contacts as ContactCard components
    - Handle empty state (no contacts yet)
    - Add navigation link in main nav
    - _Requirements: 8.1, 8.2_

  - [ ]* 18.4 Write property test for CRM display
    - **Property 16: CRM displays all user contacts**
    - **Validates: Requirements 8.2**

- [ ] 19. Checkpoint - Verify full user flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Landing page and navigation
  - Create landing page (`/`) with hero section and CTA
  - Implement main navigation with links to events and contacts
  - Add logout functionality
  - _Requirements: All_

- [ ] 21. Error handling and edge cases
  - [ ] 21.1 Add comprehensive error handling
    - Implement error boundaries for React components
    - Add user-friendly error messages for API failures
    - Handle Gemini API rate limits with cache fallback
    - Handle database connection errors
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ]* 21.2 Write unit tests for error handling
    - Test API error responses
    - Test rate limit handling
    - Test database error handling
    - _Requirements: 10.1, 10.2, 10.5_

- [ ] 22. UI polish and responsive design
  - Apply consistent Tailwind styling across all pages
  - Ensure mobile responsiveness
  - Add loading skeletons for async operations
  - Improve empty states with helpful CTAs
  - _Requirements: All_

- [ ] 23. Integration testing and demo preparation
  - [ ]* 23.1 Write end-to-end test for full user journey
    - Test: signup → onboard → events → intel → log contact → CRM
    - Verify all integrations work together
    - _Requirements: All_

  - [ ] 23.2 Seed demo data
    - Create test user account
    - Ensure events are fetched and cached
    - Pre-generate attendees for featured events
    - Test full flow manually
    - _Requirements: All_

- [ ] 24. Final checkpoint and deployment
  - Run all tests and verify they pass
  - Deploy to Vercel
  - Test deployed app with real Supabase and Gemini API
  - Prepare demo script
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on P0 features first (onboarding, events, intel), then P1 (contacts, follow-ups)
- All AI operations must use caching to stay within free tier limits
