# Supabase Database Setup

This directory contains SQL migrations for the Serendipity networking app database schema.

## Prerequisites

- Supabase project created (URL and keys in `.env.local`)
- Supabase CLI installed (optional, for local development)

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click "Run"

### Option 2: Using the migration script

```bash
npm run db:migrate
```

This will execute the migration using the Supabase client.

### Option 3: Using Supabase CLI (for local development)

```bash
# Link to your project
supabase link --project-ref hsasjkyqrbmnycgctcrm

# Apply migrations
supabase db push
```

## Schema Overview

The database includes the following tables:

- **user_profiles**: User profile data with embeddings for matching
- **events**: Networking events from various sources
- **attendees**: AI-generated personas for each event
- **event_relevance**: Cached relevance scores for user-event pairs
- **intel_cards**: Cached AI-generated recommendations
- **contacts**: User's CRM contacts
- **ai_cache**: Cached AI API responses

All tables include appropriate indexes for performance, including vector indexes for semantic similarity search using pgvector.

## Security

Row Level Security (RLS) is enabled on all user-specific tables to ensure users can only access their own data.
