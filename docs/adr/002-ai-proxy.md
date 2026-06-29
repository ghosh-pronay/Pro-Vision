# ADR-002: AI Proxy via Cloud Functions

## Status

Accepted

## Context

AI features (Gemini, Groq) require API keys. Exposing keys in client code is a security risk.

## Decision

Route all AI API calls through Firebase Cloud Functions that hold API keys server-side. Client calls the Cloud Function, which forwards to the upstream API.

## Consequences

- **Positive**: API keys never exposed to client
- **Positive**: Rate limiting enforced server-side
- **Positive**: Input validation before forwarding
- **Negative**: Extra network hop (client → Cloud Function → API)
- **Negative**: Cold start latency on Cloud Functions

## Implementation

- `geminiProxy`: validates auth, rate-limits, sanitizes generationConfig, validates contents array
- `groqProxy`: validates auth, rate-limits, allowlists models, validates messages array
- Fallback: Gemini quota exceeded → Groq fallback (client-side)
