# Requirements Document

## Introduction

Serendipity is an AI-powered ambient networking web application for SF professionals. The system transforms networking from a pull-based, manual process into an intelligent, ambient experience by aggregating events, generating personalized intel on attendees, coaching conversation initiation, and maintaining relationship continuity through automated follow-ups.

## Glossary

- **User**: An SF-based professional using Serendipity (founder, job seeker, operator, or student)
- **System**: The Serendipity web application
- **Profile**: A User's structured context document containing goals, skills, interests, and work focus
- **Event**: A networking event in San Francisco (sourced from Luma, Eventbrite, or Meetup)
- **Attendee**: A person attending an Event (AI-generated persona for demo purposes)
- **Intel_Card**: AI-generated recommendation explaining why a User should meet a specific Attendee
- **Contact**: A person the User met at an Event, logged in the CRM
- **Relevance_Score**: A 0-100 numerical score indicating how relevant an Event or Attendee is to a User
- **Embedding**: A vector representation of text used for semantic similarity matching
- **CRM**: Contact Relationship Management dashboard where Users track their networking contacts
- **Gemini_API**: Google's Gemini AI service (gemini-2.5-flash-lite model)
- **Supabase**: PostgreSQL database with pgvector extension for vector storage
- **Cache**: Stored AI responses in Supabase to avoid redundant API calls

## Requirements

### Requirement 1: User Authentication and Profile Creation

**User Story:** As a new user, I want to create a profile with my professional context, so that the system can match me with relevant events and people.

#### Acceptance Criteria

1. THE System SHALL require authentication before accessing any features
2. WHEN a new user signs up, THE System SHALL present a profile creation form
3. THE Profile_Form SHALL collect name, role, company, current work description, goals, skills offered, and interests
4. WHEN a user submits the profile form, THE System SHALL validate that required fields are non-empty
5. WHEN profile data is valid, THE System SHALL generate an Embedding from the profile text using Gemini_API
6. WHEN the Embedding is generated, THE System SHALL store the Profile and Embedding in Supabase
7. THE System SHALL cache the Embedding generation request to avoid redundant API calls

### Requirement 2: Event Discovery and Aggregation

**User Story:** As a user, I want to see upcoming SF networking events ranked by relevance to my goals, so that I can decide which events to attend.

#### Acceptance Criteria

1. THE System SHALL fetch events from the Luma internal discover endpoint
2. IF the Luma endpoint is unavailable, THEN THE System SHALL fetch events from the Eventbrite API as a fallback
3. IF both Luma and Eventbrite are unavailable, THEN THE System SHALL fetch events by scraping Meetup HTML as a final fallback
4. WHEN events are fetched, THE System SHALL store them in Supabase with name, description, date, location, source, and source URL
5. WHEN a User views the event feed, THE System SHALL calculate a Relevance_Score for each Event based on the User's Profile
6. THE System SHALL generate a one-sentence explanation for each Relevance_Score
7. THE System SHALL display Events sorted by Relevance_Score in descending order
8. THE System SHALL cache all Event relevance calculations in Supabase

### Requirement 3: Attendee Persona Generation

**User Story:** As a system administrator, I want the system to automatically generate realistic attendee personas for events, so that users can see intel cards without requiring real attendee data.

#### Acceptance Criteria

1. WHEN an Event is first accessed by any User, THE System SHALL check if Attendees exist for that Event
2. IF no Attendees exist for an Event, THEN THE System SHALL generate 8-10 realistic Attendee personas using Gemini_API
3. THE Generated_Attendees SHALL be based on SF tech archetypes including founders, PMs, engineers, investors, and operators
4. WHEN Attendees are generated, THE System SHALL create an Embedding for each Attendee's bio
5. THE System SHALL store all Attendees and their Embeddings in Supabase
6. THE Generated_Attendees SHALL remain consistent for each Event across all User sessions
7. THE System SHALL cache all Attendee generation requests to avoid redundant API calls

### Requirement 4: Event Intel Page and Attendee Matching

**User Story:** As a user, I want to see which attendees at an event are most relevant to my goals, so that I know who to prioritize meeting.

#### Acceptance Criteria

1. WHEN a User clicks on an Event, THE System SHALL display the Event Intel Page
2. THE Event_Intel_Page SHALL show the Event name, date, location, and description
3. THE System SHALL calculate a Relevance_Score for each Attendee based on the User's Profile using vector similarity
4. THE System SHALL rank Attendees by Relevance_Score and display the top 3-5 matches
5. THE System SHALL cache all Attendee relevance calculations in Supabase
6. WHEN displaying Attendees, THE System SHALL show name, role, company, and photo for each Attendee

### Requirement 5: Intel Card Generation

**User Story:** As a user, I want specific, actionable intel on why I should meet each recommended attendee, so that I can start meaningful conversations.

#### Acceptance Criteria

1. WHEN a User views recommended Attendees, THE System SHALL generate an Intel_Card for each top match
2. THE Intel_Card SHALL contain a specific reason why the User should meet the Attendee
3. THE Intel_Card SHALL contain a non-generic conversation starter based on mutual context
4. THE Intel_Card SHALL contain a suggested ask or offer the User could make
5. THE System SHALL generate Intel_Cards using Gemini_API with both User and Attendee profiles as context
6. THE Generated_Intel_Cards SHALL avoid corporate platitudes and reference specific details from both profiles
7. THE System SHALL cache all Intel_Card generation requests in Supabase
8. WHEN a User revisits an Event, THE System SHALL serve cached Intel_Cards instantly

### Requirement 6: Post-Event Contact Logging

**User Story:** As a user, I want to log contacts I met at an event using freeform text, so that I can capture details without manual data entry.

#### Acceptance Criteria

1. WHEN a User navigates to the contact logging page, THE System SHALL display a text input field
2. THE User SHALL be able to enter freeform notes about people they met
3. WHEN the User submits contact notes, THE System SHALL parse the text using Gemini_API
4. THE Parser SHALL extract name, role, company, topics discussed, commitments made, and suggested follow-up date
5. IF the Parser cannot extract required fields, THEN THE System SHALL return an error message
6. WHEN parsing is successful, THE System SHALL create a Contact record in Supabase
7. THE Contact SHALL be linked to the Event where the User met them
8. THE System SHALL cache all parsing requests in Supabase

### Requirement 7: Follow-up Message Generation

**User Story:** As a user, I want the system to draft personalized follow-up messages for my contacts, so that I can maintain relationships without starting from a blank page.

#### Acceptance Criteria

1. WHEN a Contact is created, THE System SHALL automatically generate a follow-up message draft
2. THE Follow_Up_Draft SHALL reference the Event where they met
3. THE Follow_Up_Draft SHALL reference specific topics discussed
4. THE Follow_Up_Draft SHALL be warm and genuine in tone, not salesy
5. THE Follow_Up_Draft SHALL be 5 sentences or fewer
6. THE System SHALL generate follow-up drafts using Gemini_API
7. THE System SHALL store the Follow_Up_Draft with the Contact record in Supabase
8. THE System SHALL cache all follow-up generation requests in Supabase

### Requirement 8: Contact CRM Dashboard

**User Story:** As a user, I want to view all my logged contacts in one place, so that I can track my networking relationships over time.

#### Acceptance Criteria

1. THE System SHALL provide a CRM dashboard page accessible from the main navigation
2. WHEN a User views the CRM dashboard, THE System SHALL display all their Contacts
3. THE Contact_Display SHALL show name, role, company, event where they met, and follow-up date
4. THE Contact_Display SHALL show the generated Follow_Up_Draft
5. THE User SHALL be able to copy the Follow_Up_Draft to their clipboard
6. THE Contacts SHALL be sorted by follow-up date with most recent first

### Requirement 9: AI Response Caching Strategy

**User Story:** As a system administrator, I want all AI API responses cached in the database, so that the system stays within free tier limits during the demo.

#### Acceptance Criteria

1. WHEN the System makes any request to Gemini_API, THE System SHALL first check if a cached response exists in Supabase
2. IF a cached response exists, THEN THE System SHALL return the cached response without calling Gemini_API
3. IF no cached response exists, THEN THE System SHALL call Gemini_API and store the response in the Cache table
4. THE Cache_Key SHALL be a hash of the request parameters and prompt
5. THE System SHALL apply caching to profile embeddings, event relevance scoring, attendee generation, intel card generation, contact parsing, and follow-up drafts

### Requirement 10: Error Handling and Fallbacks

**User Story:** As a user, I want the system to handle errors gracefully, so that temporary API failures don't break my experience.

#### Acceptance Criteria

1. IF Gemini_API returns an error, THEN THE System SHALL log the error and display a user-friendly message
2. IF Gemini_API rate limits are exceeded, THEN THE System SHALL return cached results or display a "try again later" message
3. IF event data sources are unavailable, THEN THE System SHALL attempt fallback sources in order: Luma, Eventbrite, Meetup
4. IF all event sources fail, THEN THE System SHALL display previously cached events
5. IF Supabase connection fails, THEN THE System SHALL display an error message and prevent data loss
6. THE System SHALL validate all user inputs before processing to prevent invalid data submission
