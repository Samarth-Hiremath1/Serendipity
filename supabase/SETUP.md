# Database Setup Instructions

## Quick Setup (Recommended)

### Step 1: Apply the Migration

1. Open your Supabase project dashboard: https://supabase.com/dashboard/project/hsasjkyqrbmnycgctcrm
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message. The migration will:
- Enable the pgvector extension for vector similarity search
- Create 7 tables: user_profiles, events, attendees, event_relevance, intel_cards, contacts, ai_cache
- Add vector indexes for semantic search
- Add foreign key constraints and unique constraints
- Enable Row Level Security (RLS) policies

### Step 2: Verify the Setup

Run the verification script to confirm all tables were created:

```bash
npm run db:verify
```

This will check that all required tables and indexes exist.

## What Gets Created

### Tables

1. **user_profiles** - User profile data with 768-dim embeddings
2. **events** - Networking events from Luma/Eventbrite/Meetup
3. **attendees** - AI-generated personas with embeddings
4. **event_relevance** - Cached relevance scores (user-event pairs)
5. **intel_cards** - Cached AI recommendations (user-attendee pairs)
6. **contacts** - User's CRM contacts
7. **ai_cache** - Cached AI API responses

### Indexes

- Vector indexes (ivfflat) on embeddings for fast similarity search
- Foreign key indexes for joins
- Composite indexes for common query patterns
- Unique constraints to prevent duplicates

### Security

- Row Level Security (RLS) enabled on all user-specific tables
- Users can only access their own data
- Events and attendees are public (read-only)
- AI cache is shared across users

## Troubleshooting

### Error: "extension vector does not exist"

The pgvector extension needs to be enabled. This should happen automatically in the migration, but if it fails:

1. Go to **Database** → **Extensions** in Supabase dashboard
2. Search for "vector"
3. Enable the extension
4. Re-run the migration

### Error: "permission denied"

Make sure you're using the SQL Editor in the Supabase dashboard, which runs with admin privileges.

### Verification Failed

If the verification script reports missing tables:
1. Check the SQL Editor for error messages
2. Ensure the entire migration SQL was copied
3. Try running the migration again (it's idempotent with IF NOT EXISTS checks)

## Alternative: Supabase CLI

If you prefer using the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref hsasjkyqrbmnycgctcrm

# Apply migrations
supabase db push
```
