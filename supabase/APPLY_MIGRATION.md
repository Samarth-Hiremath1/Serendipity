# 🚀 Apply Database Migration - Quick Guide

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Click this link to open your project's SQL Editor:
👉 **https://supabase.com/dashboard/project/hsasjkyqrbmnycgctcrm/sql/new**

### 2. Copy the Migration SQL

Open the file: `supabase/migrations/001_initial_schema.sql`

Select all the content (Cmd+A / Ctrl+A) and copy it (Cmd+C / Ctrl+C)

### 3. Paste and Run

1. Paste the SQL into the SQL Editor (Cmd+V / Ctrl+V)
2. Click the **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
3. Wait for the success message

### 4. Verify the Setup

After running the migration, verify it worked:

```bash
npm run db:verify
```

You should see ✅ for all 7 tables:
- user_profiles
- events
- attendees
- event_relevance
- intel_cards
- contacts
- ai_cache

## What This Creates

The migration sets up your entire database schema:

✅ **7 tables** with proper relationships
✅ **Vector indexes** for AI-powered semantic search
✅ **Row Level Security** to protect user data
✅ **Caching tables** to minimize AI API costs
✅ **Foreign keys** and constraints for data integrity

## Troubleshooting

### "extension vector does not exist"

1. Go to Database → Extensions in Supabase dashboard
2. Enable the "vector" extension
3. Re-run the migration

### "permission denied"

Make sure you're logged into the correct Supabase project and using the SQL Editor (not the API).

### Still having issues?

Check `supabase/SETUP.md` for detailed troubleshooting steps.

## Next Steps

Once verification passes, you're ready to continue with the next task:

```bash
npm run dev
```

Start building the authentication and profile features! 🎉
