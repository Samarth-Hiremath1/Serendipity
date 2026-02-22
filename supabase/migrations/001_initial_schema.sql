-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  current_work TEXT NOT NULL,
  looking_for TEXT[] NOT NULL,
  can_offer TEXT[] NOT NULL,
  interests TEXT[] NOT NULL,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector index for user profile embeddings
CREATE INDEX user_profiles_embedding_idx ON user_profiles USING ivfflat (embedding vector_cosine_ops);

-- Create index on user_id for faster lookups
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('luma', 'eventbrite', 'meetup', 'manual')),
  source_url TEXT,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_id)
);

-- Create index on date for chronological queries
CREATE INDEX events_date_idx ON events(date);

-- Create index on source for filtering
CREATE INDEX events_source_idx ON events(source);

-- Attendees Table
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on event_id for faster event-based queries
CREATE INDEX attendees_event_id_idx ON attendees(event_id);

-- Create vector index for attendee embeddings
CREATE INDEX attendees_embedding_idx ON attendees USING ivfflat (embedding vector_cosine_ops);

-- Event Relevance Table (caching event scores)
CREATE TABLE event_relevance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create composite index for user-based queries sorted by score
CREATE INDEX event_relevance_user_score_idx ON event_relevance(user_id, relevance_score DESC);

-- Intel Cards Table (caching recommendations)
CREATE TABLE intel_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL,
  why_meet TEXT NOT NULL,
  conversation_starter TEXT NOT NULL,
  ask_or_offer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, attendee_id)
);

-- Create composite index for user-event queries sorted by score
CREATE INDEX intel_cards_user_event_score_idx ON intel_cards(user_id, event_id, relevance_score DESC);

-- Contacts Table (CRM)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  topics_discussed TEXT,
  commitments TEXT,
  follow_up_date DATE,
  follow_up_draft TEXT,
  nudge_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create composite index for user queries sorted by follow-up date
CREATE INDEX contacts_user_followup_idx ON contacts(user_id, follow_up_date);

-- AI Cache Table (caching API responses)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('embedding', 'generation', 'parsing')),
  request_params JSONB NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on cache_key for fast lookups
CREATE INDEX ai_cache_key_idx ON ai_cache(cache_key);

-- Create composite index for request type and date queries
CREATE INDEX ai_cache_type_date_idx ON ai_cache(request_type, created_at);

-- Add Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_relevance ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see and modify their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Event relevance: users can only see their own relevance scores
CREATE POLICY "Users can view their own event relevance" ON event_relevance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own event relevance" ON event_relevance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Intel cards: users can only see their own intel cards
CREATE POLICY "Users can view their own intel cards" ON intel_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intel cards" ON intel_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contacts: users can only see and modify their own contacts
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Events and attendees are public (read-only for all authenticated users)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view attendees" ON attendees
  FOR SELECT USING (auth.role() = 'authenticated');

-- AI cache is accessible by all authenticated users (shared cache)
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cache" ON ai_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cache" ON ai_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
