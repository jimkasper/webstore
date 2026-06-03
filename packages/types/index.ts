/**
 * nTogether — Shared types package
 *
 * The event envelope is the universal cross-app data contract.
 * Every LIFE app reads and writes events in this shape.
 * The envelope never versions — payload is schema-free JSON.
 */

// ── Event sources ─────────────────────────────────────────────────────────────

export type EventSource =
  | 'journal'
  | 'scheduler'
  | 'planner'
  | 'lists'
  | 'diet'
  | 'financial'
  | 'agreement'
  | 'research'
  | 'posthumous'
  | 'contacts'
  | 'space'
  | 'connect'
  | 'messenger'
  | 'engine';

// ── Event envelope ────────────────────────────────────────────────────────────

/**
 * AppEvent is the universal event envelope. It never versions.
 * All app-specific data lives in payload as schema-free JSON.
 *
 * P is an optional TypeScript type hint for payload shape.
 * It is not enforced at runtime — payload validation is the emitting app's job.
 */
export interface AppEvent<P = Record<string, unknown>> {
  id: string;           // UUID v4
  source: EventSource;
  type: string;         // dot-namespaced string, e.g. 'entry.created'
  payload: P;           // app-specific, schema-free; evolves independently
  recorded_at: string;  // ISO 8601, always UTC
}

// ── Well-known event types ────────────────────────────────────────────────────
// Non-exhaustive. Each app owns its own event type strings.
// These are the types other apps are permitted to subscribe to.
// Apps must handle unknown types gracefully (ignore, don't error).

export const EventType = {
  journal: {
    ENTRY_CREATED:      'entry.created',
    MOOD_LOGGED:        'mood.logged',
  },
  scheduler: {
    EVENT_CREATED:      'event.created',
    EVENT_STARTED:      'event.started',
    EVENT_COMPLETED:    'event.completed',
    ROUTINE_LOGGED:     'routine.logged',
    TASK_COMPLETED:     'task.completed',
  },
  planner: {
    GOAL_CREATED:       'goal.created',
    MILESTONE_REACHED:  'goal.milestone_reached',
    HABIT_LOGGED:       'habit.logged',
    GOAL_COMPLETED:     'goal.completed',
  },
  lists: {
    ITEM_CREATED:       'item.created',
    ITEM_COMPLETED:     'item.completed',
    ITEM_DEFERRED:      'item.deferred',
    LIST_SHARED:        'list.shared',
  },
  diet: {
    MEAL_LOGGED:        'meal.logged',
    WATER_LOGGED:       'water.logged',
    PLAN_CREATED:       'plan.created',
  },
  financial: {
    TRANSACTION_LOGGED: 'transaction.logged',
    BUDGET_EXCEEDED:    'budget.exceeded',
    GOAL_REACHED:       'goal.reached',
  },
  agreement: {
    AGREEMENT_CREATED:  'agreement.created',
    OBLIGATION_DUE:     'obligation.due',
    OBLIGATION_MET:     'obligation.met',
    SUBSCRIPTION_DUE:   'subscription.due',
  },
  research: {
    NOTE_CREATED:       'note.created',
    NOTE_LINKED:        'note.linked',
    CLIPPING_SAVED:     'clipping.saved',
  },
  posthumous: {
    DIRECTIVE_UPDATED:  'directive.updated',
    CONTACT_DESIGNATED: 'contact.designated',
  },
  contacts: {
    CONTACT_ADDED:      'contact.added',
    CONTACT_UPDATED:    'contact.updated',
    CONTACT_LINKED:     'contact.linked',   // off-platform → on-platform merge
  },
  space: {
    POST_CREATED:       'post.created',
    POST_DELETED:       'post.deleted',
    FOLLOW_ADDED:       'follow.added',
    FOLLOW_REMOVED:     'follow.removed',
  },
} as const;

// ── Cross-app reference types ─────────────────────────────────────────────────

export type RefType = 'mention' | 'embed' | 'party' | 'tag' | 'link';

export interface CrossRef {
  id: string;
  from_source: EventSource;
  from_record_id: string;
  to_source: EventSource;
  to_record_id: string;
  ref_type: RefType;
  created_at: string;
}

// ── Dash stats ────────────────────────────────────────────────────────────────
// Each app upserts its own DashStats row into the local dash_stats table.
// DASH reads all rows without requiring DATA HUB.

export interface DashStats {
  source: EventSource;
  stats: Record<string, unknown>;  // app-defined shape; DASH renders what it recognises
  updated_at: string;
}

// ── ENGINE platform types ─────────────────────────────────────────────────────

export interface Space {
  id: string
  handle: string
  display_name: string
  public_key: string
  is_local: boolean
  created_at: string
}

export interface Connection {
  id: string
  from_space_id: string | null
  to_space_id: string | null
  from_ap_actor: string | null
  conn_type: 'follow' | 'friend' | 'block'
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
}

export interface Transfer {
  id: string
  from_space_id: string
  to_space_id: string | null
  to_ap_actor: string | null
  status: 'pending' | 'accepted' | 'cancelled' | 'expired'
  expires_at: string
  created_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthResponse {
  space: Space
  tokens: TokenPair
}

export interface APActor {
  '@context': string | string[]
  id: string
  type: string
  preferredUsername: string
  name?: string
  inbox: string
  outbox: string
  followers: string
  following: string
  publicKey?: { id: string; owner: string; publicKeyPem: string }
  url?: string
}

export interface WebFingerResponse {
  subject: string
  links: Array<{ rel: string; type?: string; href?: string }>
}
