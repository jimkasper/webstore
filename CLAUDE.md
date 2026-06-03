# Barbelo — Development Guidelines

## Decision Framework

Every feature, integration, and architectural decision must be evaluated against these five values.
Present a trade-off table for each significant suggestion.

| Value | Question to answer |
|---|---|
| **User Privacy** | Does this expose user data to third parties or reduce user control? |
| **User Security** | Does this introduce attack surface, credential risk, or weaken protections? |
| **Company Cost** | What are the ongoing infrastructure, API, licensing, and operational costs? |
| **Company Time** | How long to build and maintain? What is the opportunity cost? |
| **Scalability** | Does this hold up under load? Does complexity grow linearly or exponentially? |

### Rating scale
- ✅ Strong — clear advantage or no meaningful concern
- ⚠️ Moderate — acceptable trade-off with known mitigation
- ❌ Weak — significant concern; justify or find an alternative

### Example table
| Value | Rating | Reason |
|---|---|---|
| User Privacy | ✅ | Data never leaves the device |
| User Security | ⚠️ | Client-side file parsing; low risk |
| Company Cost | ✅ | No API costs |
| Company Time | ✅ | ~1 day to implement |
| Scalability | ✅ | Fully client-side, no server load |

## Core Principles

- **Data ownership first** — users own their data; avoid third-party data intermediaries
- **Privacy by default** — collect the minimum, store locally, encrypt at rest
- **No vendor lock-in** — open formats (CSV, OFX, JSON) over proprietary APIs where possible
- **Open Banking over aggregators** — when bank connectivity is needed, prefer direct open banking (CFPB 1033) over Plaid/Teller
- **Self-hostable** — any networked feature should have a self-hosted path
