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
- **Three.js** (3D graphics)

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

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
├── convex/           # Backend shim (placeholder)
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

## License

Private — Pro-Vision
