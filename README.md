# Pro-Vision

All-in-one productivity app for Bangladesh. Track tasks, habits, expenses, mood, and more — with an AI Coach that speaks Bengali.

**GitHub:** https://github.com/ghosh-pronay/Pro-Vision
**Live:** https://pro-visions.web.app

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- **Shadcn UI** (component library)
- **Framer Motion** (animations)
- **React Router v7** (routing)
- **Firebase Auth** (authentication)
- **Firebase Hosting** (deployment)
- **Zustand** (state management)
- **Lucide Icons** (icons)
- **Recharts** (charts)

## Setup

```bash
npm install
npm run dev
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run verify        # Lint + typecheck + test
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

API keys are server-side only (Cloud Functions):

```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase functions:config:set groq.api_key="YOUR_KEY"
```

## Architecture

### Dual Backend Strategy

The app supports two data backends:

1. **Local Development (default)**: localStorage-backed Convex shim (`src/convex/react.ts`)
   - All data persists in the browser
   - No server required
   - Set `VITE_CONVEX_URL` to use real Convex

2. **Production (optional)**: Real Convex backend
   - Set `VITE_CONVEX_URL` in `.env.local`
   - Remove Vite aliases in `vite.config.ts`
   - Data syncs across devices

### AI Integration

- **Primary**: Google Gemini 2.0 Flash (via Cloud Function proxy)
- **Fallback**: Groq (llama-3.3-70b-versatile)
- API keys are server-side only (Cloud Functions)

## Project Structure

```
src/
├── components/       # UI components
│   ├── ui/           # Shadcn primitives
│   ├── coach/        # AI Coach floating widget
│   ├── layout/       # Sidebar, Navbar
│   ├── analytics/    # Reports tab components
│   └── shared/       # EmptyState, etc.
├── pages/            # Route pages
├── hooks/            # Custom hooks (useAuth, useI18n, etc.)
├── i18n/             # Bengali/English translations
├── convex/           # Convex backend definitions
│   ├── schema.ts     # Database schema (51 tables)
│   ├── react.ts      # Local Convex shim (useQuery, useMutation)
│   └── _generated/   # Generated API (shimmed to localStorage)
├── lib/              # Firebase config, utilities
├── store/            # Zustand store
└── index.css         # Global styles + Tailwind theme
```

## Features

- **Dashboard** — Daily life score, quick stats, widgets
- **To-Do** — AI-powered task management
- **Habits** — Habit tracking with streaks
- **Expense** — Financial tracking
- **Focus** — Pomodoro-style focus timer
- **News** — Local news feed
- **Reports** — Analytics and insights
- **Well-being** — Mood tracking, breathing exercises
- **Goals** — Goal setting and progress
- **AI Coach** — Floating chat assistant (Gemini-powered)
- **Admin** — Admin portal (role-based)
- **i18n** — Bengali & English language support
- **Themes** — Light, Dark, OLED, System

## Deployment

```bash
firebase deploy --only hosting
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Private — Pro-Vision
