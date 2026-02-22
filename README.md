# Serendipity

AI-Powered Ambient Networking for SF Professionals

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + pgvector)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API (gemini-2.0-flash-lite, text-embedding-004)
- **Testing**: fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Google Gemini API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utility functions and API clients
├── types/            # TypeScript type definitions
└── .kiro/specs/      # Feature specifications and tasks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Features

- User authentication and profile creation
- Event discovery and aggregation (Luma, Eventbrite, Meetup)
- AI-powered event relevance scoring
- Attendee persona generation
- Personalized intel cards with conversation starters
- Contact logging and CRM
- Automated follow-up message drafting
- Aggressive AI response caching for demo reliability
