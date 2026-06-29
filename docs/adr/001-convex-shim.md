# ADR-001: Convex Shim to localStorage

## Status

Accepted

## Context

Pro-Vision needs a data persistence layer. Real Convex requires a paid backend and server setup. For development and offline-first usage, we need a local alternative.

## Decision

Use a localStorage-backed shim that implements the Convex API surface (useQuery, useMutation, useAction) backed by localStorage via a `localDB` object.

## Consequences

- **Positive**: Zero server cost for development, works offline, fast iteration
- **Positive**: Same API surface means migration to real Convex is a config change
- **Negative**: No server-side auth guards (admin is client-only)
- **Negative**: No cross-device sync
- **Negative**: Listener key collisions possible after minification (mitigated with WeakMap)

## Mitigations

- Admin guard reads from localStorage (documented as by-design limitation)
- WeakMap-based function keys prevent cross-collection interference
- Production build logs error when shim is loaded
- Migration path: remove Vite aliases, set `VITE_CONVEX_URL`
