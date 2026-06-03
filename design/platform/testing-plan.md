# nTogether — Testing Plan
Last updated: 2026-04-26

---

## 1. Philosophy

Testing priorities in order of severity if they fail:

1. **Privacy & tier enforcement** — a tier leak is a product promise violation
2. **Security** — auth bypass, IDOR, token tampering, plaintext storage
3. **Data integrity** — transfers that don't delete, account deletions that leave traces
4. **Correctness** — business logic, cross-app integration, event routing
5. **Performance** — latency and throughput under load

Tier isolation tests and security tests run on every CI build, not just nightly. They are blocking — a failing privacy test stops the build.

---

## 2. Test layers

```
                  ┌─────────────────────────┐
                  │   E2E (Playwright)       │  full user flows, cross-service
                  ├─────────────────────────┤
                  │   Integration            │  DB, Redis, HTTP handlers, event bus
                  ├─────────────────────────┤
                  │   Component (RTL)        │  React UI in isolation
                  ├─────────────────────────┤
                  │   Unit                   │  pure functions, type validation
                  └─────────────────────────┘
  Plus: Security · Privacy/Tier · Performance (separate suites, always run)
```

---

## 3. Tooling stack

| Layer | Tool | Language |
|-------|------|----------|
| Go unit + integration | `testing` + `testify/assert` + `testify/require` | Go |
| TypeScript unit | Vitest | TypeScript |
| React components | React Testing Library + Vitest | TypeScript |
| E2E (web) | Playwright | TypeScript |
| API integration | `net/http/httptest` (Go), `supertest` (Node) | Go / TS |
| Load testing | k6 | JavaScript |
| Security scanning | OWASP ZAP (automated) + manual test cases | — |
| SQLite schema | Go `database/sql` test helpers | Go |
| Test containers | `testcontainers-go` (Postgres, Redis) | Go |
| Coverage | `go test -cover`, `vitest --coverage` | — |

---

## 4. Monorepo test file structure

```
nTogether/
├── services/engine/
│   ├── internal/
│   │   ├── services/auth_test.go
│   │   ├── services/space_test.go
│   │   ├── services/connection_test.go
│   │   ├── services/transfer_test.go
│   │   ├── services/federation_test.go
│   │   ├── handlers/auth_test.go
│   │   └── handlers/spaces_test.go
│   └── internal/store/postgres_test.go
│
├── packages/types/
│   ├── event.test.ts          (Vitest — envelope validation)
│   ├── event_test.go          (Go — AppEvent.Validate())
│   └── local-store_test.go    (SQLite schema smoke test)
│
├── apps/*/src/
│   ├── **/*.test.ts           (Vitest unit)
│   └── **/*.test.tsx          (RTL component)
│
└── tests/
    ├── e2e/                   (Playwright — cross-service user flows)
    │   ├── auth.spec.ts
    │   ├── space.spec.ts
    │   ├── messenger.spec.ts
    │   ├── life-apps.spec.ts
    │   ├── connect.spec.ts
    │   └── account-deletion.spec.ts
    ├── security/
    │   ├── auth-bypass.test.ts
    │   ├── tier-leakage.test.ts
    │   ├── idor.test.ts
    │   └── jwt.test.ts
    ├── privacy/
    │   ├── tier-1-isolation.test.ts
    │   ├── tier-access-matrix.test.ts
    │   └── messenger-plaintext.test.ts
    ├── load/
    │   ├── feed.js
    │   ├── search.js
    │   ├── event-bus.js
    │   └── engine-auth.js
    └── fixtures/
        ├── seed.sql
        └── users.ts
```

---

## 5. Coverage targets

| Area | Line coverage target |
|------|---------------------|
| `packages/types` validation | 100% |
| ENGINE auth service | 95% |
| ENGINE handlers | 85% |
| Shared event log write path | 95% |
| LIFE app core logic | 80% |
| React components (critical paths) | 70% |
| E2E critical flows | All listed scenarios pass |
| Security tests | All pass — zero tolerance |
| Privacy/tier tests | All pass — zero tolerance |

---

## 6. Per-service test coverage

### packages/types

**TypeScript (event.test.ts)**
- `AppEvent` interface: valid envelope passes, missing `id` fails, missing `source` fails, missing `type` fails, missing `recorded_at` fails
- `EventSource` exhaustiveness: every defined source constant is a valid `EventSource`
- `DashStats`: valid shape accepted, unknown keys in `stats` pass (schema-free)
- `CrossRef`: all `RefType` values accepted, invalid ref type rejected at type level

**Go (event_test.go)**
- `AppEvent.Validate()`: passes on valid event, returns error for each missing required field
- `AppEvent.Validate()`: does not inspect `Payload` contents (opaque JSON)
- JSON round-trip: marshal → unmarshal produces identical struct

**SQLite schema (local-store_test.go)**
- Schema applies cleanly on fresh database
- All indexes created
- `events` table: insert valid row, unique constraint on `id`, `synced` default is 0
- `dash_stats` table: upsert same source twice, second write wins
- `cross_refs` table: unique constraint on (from_source, from_record_id, to_source, to_record_id, ref_type)
- `sync_cursors` table: default `last_synced_at` is epoch
- Unknown `source` value stored without error (TEXT column, no FK constraint)

---

### ENGINE — Auth service

**Unit (auth_test.go)**
- `Register`: valid input creates space, hashes password with bcrypt, generates RSA key pair
- `Register`: duplicate handle returns error
- `Register`: duplicate email hash returns error
- `Login`: valid credentials return access + refresh tokens
- `Login`: wrong password returns 401, does not reveal which field is wrong
- `Login`: non-existent handle returns 401 (same timing as wrong password — no enumeration)
- `RefreshToken`: valid refresh token returns new access token, old refresh token invalidated
- `RefreshToken`: expired refresh token returns 401
- `RefreshToken`: tampered refresh token returns 401
- `Logout`: valid session deleted
- `LogoutAll`: all sessions for space deleted
- JWT: `access_token` expires in correct duration (15 min)
- JWT: `refresh_token` expires in correct duration (30 days)
- JWT: modified signature rejected
- JWT: wrong secret rejected
- JWT: expired token rejected even if signature valid

**Integration (auth handler via httptest)**
- `POST /api/v1/auth/register` → 201 with tokens
- `POST /api/v1/auth/login` → 200 with tokens
- `POST /api/v1/auth/refresh` → 200 with new access token
- `DELETE /api/v1/auth/logout` → 204, session deleted
- Rate limiting: 5 failed login attempts within 60s → 429
- Missing Authorization header → 401
- Malformed Bearer token → 401

---

### ENGINE — Space, Connection, Transfer services

**Space**
- `GetSpace`: returns public fields only, never password_hash or private_key
- `UpdateSpace`: only owner can update their own space
- `DeactivateSpace`: marks inactive, subsequent login returns 403
- Handle lookup: case-insensitive, strips leading @

**Connections**
- Follow: creates pending connection
- Follow remote (AP actor): stores ap_actor reference
- AcceptFollow: status changes to accepted
- RejectFollow: status changes to rejected, no notification sent
- Block: status changes to blocked, existing connection removed
- ListFollowers / ListFollowing: paginated, correct results
- Cannot follow yourself

**Transfers**
- `CreateTransfer`: payload stored encrypted (AES-256), not plaintext
- `AcceptTransfer`: returns decrypted payload AND deletes the row — row must not exist after accept
- `CancelTransfer`: deletes the row — row must not exist after cancel
- `GetTransfer` after accept: 404
- `GetTransfer` after cancel: 404
- `GetTransfer` by non-owner: 403
- Expired transfer: auto-deleted by cleanup job, `GetTransfer` returns 404

---

### Shared local event log (SQLite integration)

**Write path**
- Valid event written to `events` table with `synced=0`
- Malformed envelope (missing required field) rejected before write
- Payload stored verbatim as JSON (no parsing, no schema enforcement)
- Unknown `source` stored without error
- Unknown `type` stored without error
- Duplicate `id` rejected (PRIMARY KEY constraint)

**Read path**
- Query by `source`: returns only that source's events
- Query by `type`: returns only matching types
- Query by time range: correct window
- Query by `source` AND `type`: correct intersection
- App receiving unknown `source` events: does not error, skips gracefully

**Cross-refs**
- Create ref: stored correctly
- Duplicate ref: upsert or reject cleanly (no duplicate row)
- Query by `from_source + from_record_id`: returns all outgoing refs for that record
- Query by `to_source + to_record_id`: returns all incoming refs (backlinks)

**Dash stats**
- App upserts row: stored with `updated_at`
- Second upsert same source: replaces stats, updates `updated_at`
- DASH reading all rows: returns one row per source, no duplicates

**Sync cursor**
- `last_synced_at` advances after sync
- Querying unsynced events: returns only rows where `synced=0` and `recorded_at > last_synced_at`

---

### LIFE apps (all 10 — shared test patterns)

Each LIFE app must pass this standard test matrix:

**CRUD**
- Create entity: persisted, event written to shared log with correct envelope
- Read entity: returns correct data for owner, 403 for other users
- Update entity: persisted, event written to shared log
- Delete entity: removed, deletion event written to shared log

**Event emission**
- Each state-changing operation writes an event with correct `source`, `type`, and non-empty `payload`
- Event `id` is a valid UUID v4
- Event `recorded_at` is a valid ISO 8601 UTC timestamp

**Dash stats update**
- After each significant state change, app's `dash_stats` row is upserted with updated values

**Cross-refs**
- @-mention creates a `cross_refs` row with `ref_type = 'mention'`
- Inline embed creates a `cross_refs` row with `ref_type = 'embed'`
- Deleting the source record removes its outgoing cross-refs

**Offline behavior**
- Operations work against local SQLite with no network
- `synced=0` flag set on all events written offline
- On reconnect, unsynced events published to Redis Streams (when DATA HUB present)

**App-specific additional tests:**

| App | Key additional tests |
|-----|---------------------|
| Journal | Mood signal written to event log; entry privacy (private / shared / public) enforced |
| Scheduler | Recurring event generation correct; birthday reminders from Contacts trigger correctly; iCal export valid |
| Lists | Need-do / should-do / to-do priority ordering; overdue threshold triggers nudge event |
| Planner | Milestone event pushed to Scheduler; habit streak calculation; goal completion event |
| Diet | Macro totals correct; grocery list export to Lists creates correct items |
| Financial | Budget exceeded event fires at correct threshold; spending total calculation |
| Agreement | Obligation due event fires N days before deadline (configurable); subscription renewal alert |
| Research | Bidirectional link created on both sides; orphaned backlink cleaned when note deleted |
| Posthumous | Inactivity timer calculation; legacy contact can only see their own role assignment |
| Contacts | Following user creates on-platform contact; merge detection email match; off-platform contact data never leaves local store |

---

### CONNECT

**Feed**
- Public posts from all SPACEs indexed
- Post set to private: NOT in index
- Post set to selectively shared: NOT in CONNECT index
- Tier 1 user's public post: visible to viewers, NOT indexed by CONNECT
- Delete post from SPACE: removed from CONNECT index within defined SLA
- Chronological feed: correct order
- Algorithm feed: algorithm applied, result differs from chronological
- Following feed: only shows posts from followed SPACEs

**Music / Video / Podcast**
- Public media indexed
- Private media not indexed
- Removing media from SPACE removes it from CONNECT
- Streaming URL resolves to correct SPACE origin (no CONNECT-side copy)
- Podcast RSS feed valid XML; subscribable by external podcast app

**Search**
- Full-text search returns relevant results
- Tier 1 SPACE content not in search index
- Tab filters return correct type subsets
- Empty query returns recent/trending, not all content

**Algorithm marketplace**
- Install: algorithm active for user feed
- Remove: algorithm no longer applied
- Sandbox check: algorithm that attempts cross-user data access rejected
- Published algorithm with 80/20 revenue split: author balance credited correctly on purchase

---

### DATA HUB

**Event consumption**
- EVENT written to local log → published to Redis Streams → DATA HUB consumes → written to server-side store
- Consumption is idempotent (duplicate event ID handled without double-write)
- Unknown event type consumed and stored (no rejection)

**Materialized views**
- View reflects state after event consumed (within defined refresh window)
- Deleting source record triggers view refresh
- Multiple app sources aggregated correctly in cross-app views

**ANALYZER**
- Query returns correct results against test dataset
- Query scoped to requesting user only (cannot reference other users' data)
- Tier 1–2: ANALYZER runs on-device; query never sent to platform servers
- Tier 3–5: platform LLM used; explicit disclosure present in UI

**Tier access (platform read access)**
- Tier 1: platform cannot read any DATA HUB data (zero rows returned on platform query)
- Tier 2: only aggregate/anonymized stats readable; no individual records
- Tier 3: behavioral patterns readable; no identity linkage
- Tier 4: full data readable by platform internal systems
- Tier 5: data available via CONNECT data marketplace

---

### MESSENGER

**Encryption (integration level — not testing libsodium internals)**
- Key pair generated for each user at registration
- X3DH handshake completes between two users before first message
- Message stored server-side as encrypted blob only — plaintext field must not exist in DB schema
- Message retrieved by recipient: can be decrypted with recipient's key
- Message retrieved by platform admin query: returns encrypted blob, not readable

**Message lifecycle**
- Send: message reaches server relay with `status=sent`
- Deliver: recipient device ACKs, `status=delivered`
- Read receipt (opt-in): `status=read` set when recipient opens
- Read receipt (opt-out default): `status` stays `delivered` regardless of read

**Message requests**
- Message from non-follower lands in Requests, not Primary inbox
- Accepting request moves thread to Primary
- Declining sends no event to sender
- Blocking prevents sender from sending further messages

**Deletion**
- "Delete for me": removed from sender's local store only; recipient unaffected
- "Delete for everyone": deletion signal sent to recipient device; server-side blob deleted
- No server-side guaranteed deletion (by design — deletion is a signal to client)

**Rate limiting**
- Spam protection: message rate limit per sender per recipient per minute

---

### CLOUD

**File operations**
- Upload: file stored, encrypted at rest, `visibility=private` default
- Download: owner can download; non-owner gets 403
- Delete: file removed, storage quota decremented
- Storage quota: upload beyond quota returns 413

**Media Archiver**
- Valid URL: archive job created, file downloaded and stored
- Invalid URL: error returned, no job created
- Archived file: stored with `source=archived`, original URL recorded
- Queue: concurrent archive jobs processed; progress trackable

**Encryption**
- Stored file: encrypted at rest with user's tier key
- File metadata: encrypted; filename not readable by platform at Tier 1

**Deployments**
- nTogether-hosted: file accessible via SPACE at correct URL
- Self-hosted: deployment record created; file served from user's target

---

## 7. Critical must-pass scenarios

These are the scenarios that represent the most severe failure modes. They run on every CI build and are blocking.

| # | Scenario | Why critical |
|---|----------|-------------|
| 1 | **Tier 1 content not indexed** | Product promise: Tier 1 = zero platform visibility |
| 2 | **Tier 1 DATA HUB: zero platform reads** | Platform cannot read any Tier 1 user data |
| 3 | **Transfer accepted → row deleted** | Ephemeral guarantee: no server-side residue |
| 4 | **Transfer cancelled → row deleted** | Same as above |
| 5 | **MESSENGER server stores no plaintext** | E2E encryption guarantee |
| 6 | **Account deleted → all data removed** | GDPR + product promise |
| 7 | **Deleted account comments: no tombstone** | Per spec: threads collapse, no "deleted user" marker |
| 8 | **Cross-user IDOR blocked** | User A cannot read User B's private records by ID |
| 9 | **Tampered JWT rejected** | Auth integrity |
| 10 | **Expired JWT rejected** | Auth integrity |
| 11 | **Unknown event type: no app crash** | Partial install resilience |
| 12 | **Missing app events stored, not blocked** | Partial install resilience |
| 13 | **ANALYZER scoped to requesting user only** | Intelligence engine cannot cross user boundary |
| 14 | **Tier 1–2 ANALYZER: no server-side query** | On-device only; query never leaves device |
| 15 | **Private post not in CONNECT feed or search** | Per-content privacy respected by discovery layer |

### Scenario test format (example — #3)

```typescript
// tests/e2e/transfers.spec.ts
test('accepted transfer row is deleted', async ({ request }) => {
  const { transferId } = await createTransfer(request, userA, userB);

  // Confirm exists
  const before = await request.get(`/api/v1/transfers/${transferId}`, {
    headers: auth(userB),
  });
  expect(before.status()).toBe(200);

  // Accept
  await request.put(`/api/v1/transfers/${transferId}/accept`, {
    headers: auth(userB),
  });

  // Must be gone
  const after = await request.get(`/api/v1/transfers/${transferId}`, {
    headers: auth(userB),
  });
  expect(after.status()).toBe(404);

  // Verify at DB level — not just HTTP
  const row = await db.query('SELECT id FROM transfers WHERE id = $1', [transferId]);
  expect(row.rows).toHaveLength(0);
});
```

---

## 8. Security test plan

### Authentication

| Test | Method | Expected |
|------|--------|----------|
| Login with wrong password | POST /auth/login with bad password | 401, generic message |
| Login timing attack | Compare response times: bad user vs bad password | Time difference < 5ms |
| Brute force | 6 failed logins within 60s | 429 on 6th attempt |
| JWT tampering | Modify payload, keep signature | 401 |
| JWT wrong secret | Sign with different secret | 401 |
| JWT expired | Use token past expiry | 401 |
| Refresh token reuse | Use refresh token twice | 401 on second use |
| Logout other sessions | LogoutAll invalidates all tokens | All subsequent requests 401 |
| CSRF | Mutating request without correct headers | 403 |

### Authorization / IDOR

| Test | Method | Expected |
|------|--------|----------|
| Read other user's private post | GET /spaces/:handle/posts/:id with other user token | 403 |
| Read other user's transfer | GET /transfers/:id as non-party | 403 |
| Update another user's space | PUT /me with other user token targeting different space | 403 |
| Access DATA HUB as different user | Query DATA HUB with userId not matching token | 403 |
| Access CLOUD file of another user | GET /cloud/files/:id with other user token | 403 |
| Sequential ID enumeration | Increment numeric IDs to probe records | All UUIDs; sequential probe returns 404 |

### Injection

| Test | Method | Expected |
|------|--------|----------|
| SQL injection in search | `' OR 1=1 --` in search query | Parameterised query; no injection |
| SQL injection in handle | `'; DROP TABLE spaces; --` as handle | Rejected at input validation |
| XSS in post content | `<script>alert(1)</script>` in post body | Content escaped on render |
| XSS in display name | Same | Content escaped |
| Path traversal in CLOUD | `../../../etc/passwd` as filename | Rejected at input validation |
| Oversized payload | 100 MB POST body | 413 before processing |

### Encryption

| Test | Method | Expected |
|------|--------|----------|
| Transfer payload at rest | Read transfer row from DB | `payload_enc` is ciphertext, not JSON |
| MESSENGER blob at rest | Read message row from DB | No `content` or `body` column exists |
| CLOUD file at rest | Read file from storage backend | File bytes are ciphertext |
| Tier 1 DATA HUB query by platform | Simulate platform query against Tier 1 user | Zero rows returned |

---

## 9. Privacy and tier compliance tests

These run as a dedicated suite on every PR. All must pass.

```
tests/privacy/tier-access-matrix.test.ts
```

The test matrix verifies platform read access per tier by simulating a platform-level query against each tier user's data:

| Tier | Individual records | Identity linkage | Behavioral patterns | Aggregate stats | Data marketplace |
|------|--------------------|-----------------|---------------------|-----------------|-----------------|
| T1 | ✗ assert 0 rows | ✗ | ✗ | ✗ | ✗ |
| T2 | ✗ assert 0 rows | ✗ | ✗ | ✓ anonymized only | ✗ |
| T3 | ✗ | ✗ | ✓ | ✓ | ✗ |
| T4 | ✓ | ✓ internal only | ✓ | ✓ | ✗ |
| T5 | ✓ | ✓ | ✓ | ✓ | ✓ |

Each cell marked ✗ has an explicit assertion that the query returns zero results or is rejected.

### MESSENGER plaintext test

```go
// tests/privacy/messenger-plaintext_test.go
func TestMessengerServerStoresNoPlaintext(t *testing.T) {
    // Send a message with known plaintext
    sendMessage(t, userA, userB, "this is plaintext content")

    // Query the messages table directly
    rows, _ := db.Query("SELECT * FROM messages WHERE thread_id = $1", threadID)

    for rows.Next() {
        var msg MessageRow
        rows.Scan(&msg)
        // The row must not contain the plaintext string anywhere
        assert.NotContains(t, msg.EncryptedBlob, "this is plaintext content")
        // Verify there is no plaintext column
        assert.Empty(t, msg.Content)   // column should not exist or be empty
        assert.Empty(t, msg.Body)
    }
}
```

### Tier 1 isolation test

```typescript
// tests/privacy/tier-1-isolation.test.ts
test('Tier 1 public post is not indexed by CONNECT', async () => {
  const tier1User = await createUser({ tier: 1 });
  await publishPost(tier1User, { visibility: 'public', content: 'unique-sentinel-t1' });

  // Platform-level search index query (simulating CONNECT indexer)
  const indexed = await connectIndex.search('unique-sentinel-t1');
  expect(indexed.hits).toHaveLength(0);
});

test('Tier 1 DATA HUB: platform reads zero records', async () => {
  const tier1User = await createUser({ tier: 1 });
  await seedUserData(tier1User); // journal entries, events, etc.

  // Simulate platform query
  const result = await platform.queryDataHub(tier1User.id);
  expect(result.records).toHaveLength(0);
});
```

---

## 10. Performance benchmarks

All benchmarks measured at p95 unless noted. Targets are minimums for launch.

| Endpoint / Operation | p95 target | p99 target | Notes |
|---------------------|-----------|-----------|-------|
| `POST /auth/login` | < 300ms | < 500ms | Includes bcrypt |
| `GET /api/v1/me` | < 50ms | < 100ms | Cached |
| `GET /api/v1/spaces/:handle` | < 80ms | < 150ms | |
| `GET /connect/feed` (following) | < 400ms | < 800ms | 50 posts |
| `GET /connect/feed` (global) | < 500ms | < 1s | 50 posts |
| `GET /connect/search` | < 300ms | < 600ms | |
| Event log write (SQLite local) | < 10ms | < 20ms | Local only |
| Event → DATA HUB consumed | < 2s | < 5s | Redis Streams lag |
| WebSocket message delivery | < 100ms | < 200ms | |
| MESSENGER E2E delivery | < 300ms | < 600ms | Client-to-client |
| CLOUD file upload (1 MB) | < 2s | < 4s | |
| CLOUD media archive job start | < 500ms | < 1s | Job queued |

### Load test scenarios (k6)

```javascript
// tests/load/feed.js
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // ramp up
    { duration: '3m', target: 500 },   // sustained
    { duration: '1m', target: 1000 },  // spike
    { duration: '1m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],    // < 1% error rate
  },
};
```

Run weekly against staging. Regressions block release.

---

## 11. Test data strategy

### Seed users (fixtures/users.ts)

```typescript
export const seedUsers = {
  tier1: { handle: 'testuser_t1', tier: 1, email: null },
  tier2: { handle: 'testuser_t2', tier: 2, email: 't2@test.local' },
  tier3: { handle: 'testuser_t3', tier: 3, email: 't3@test.local' },
  tier4: { handle: 'testuser_t4', tier: 4, email: 't4@test.local' },
  tier5: { handle: 'testuser_t5', tier: 5, email: 't5@test.local' },
  alice: { handle: 'alice',  tier: 3, email: 'alice@test.local' },
  bob:   { handle: 'bob',    tier: 3, email: 'bob@test.local' },
};
```

### Database isolation

- Each test suite gets a fresh schema via `testcontainers-go` (Postgres) or an in-memory SQLite DB
- No shared state between test runs
- Migrations run fresh for each integration test suite
- Redis flushed between test suites

### Mocking strategy

| Dependency | Unit tests | Integration tests | E2E |
|------------|-----------|------------------|-----|
| PostgreSQL | Mock/stub | Real (testcontainer) | Real (docker-compose) |
| Redis | Mock/stub | Real (testcontainer) | Real (docker-compose) |
| SQLite | In-memory | In-memory | On-disk temp file |
| External HTTP (AP fetch) | Mock | Mock | Mock |
| LLM (ANALYZER) | Mock | Mock | Mock (canned response) |
| libsodium (Signal) | Real | Real | Real |

---

## 12. CI/CD integration

### On every PR

```yaml
jobs:
  unit:          go test ./... && vitest run
  integration:   go test ./... -tags=integration
  components:    vitest run --reporter=verbose
  privacy:       vitest run tests/privacy/
  security:      vitest run tests/security/
  e2e-critical:  playwright test tests/e2e/auth tests/e2e/transfers tests/e2e/account-deletion
```

All jobs run in parallel. All must pass before merge.

### On merge to main

```yaml
jobs:
  e2e-full:     playwright test tests/e2e/  (all specs)
  zap-scan:     OWASP ZAP baseline scan against staging
```

### Weekly (scheduled)

```yaml
jobs:
  load:         k6 run tests/load/ against staging
  e2e-full:     Full E2E suite against production-like environment
```

### Failure policy

| Suite | Failure blocks merge? |
|-------|----------------------|
| Unit | Yes |
| Integration | Yes |
| Privacy / tier | Yes — zero tolerance |
| Security | Yes — zero tolerance |
| E2E critical | Yes |
| E2E full | Yes (on main merge) |
| Load | No (alerts only, blocks release manually) |

---

## Open items

- LLM mock strategy for ANALYZER integration tests (canned SQL responses vs. real model)
- Signal Protocol test vectors — use official test vectors from Signal repo for X3DH / Double Ratchet correctness
- Accessibility testing (WCAG 2.1 AA) — tool selection TBD (axe-core, Playwright accessibility checks)
- Visual regression testing — tool selection TBD (Percy, Chromatic, Playwright screenshots)
- Mobile E2E — Detox (React Native / Expo) or Maestro; deferred until mobile phase
- Penetration testing — external pen test engagement planned before public launch
