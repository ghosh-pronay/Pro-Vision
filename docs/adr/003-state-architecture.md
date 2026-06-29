# ADR-003: State Architecture (Zustand + localStorage)

## Status

Accepted

## Context

The app needs both global UI state (theme, language, sidebar) and persistent data state (tasks, habits, transactions).

## Decision

- **Zustand**: Global UI state (theme, language, sidebar open/closed, dashboard widgets)
- **localStorage via Convex shim**: All persistent data (tasks, habits, finances, etc.)

## Consequences

- **Positive**: Clean separation of concerns
- **Positive**: UI state doesn't persist (resets on refresh), data state does
- **Positive**: Convex shim provides reactive data layer via useQuery/useMutation
- **Negative**: Two state systems to understand
- **Negative**: No server-side persistence (until real Convex)
