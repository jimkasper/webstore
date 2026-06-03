// Package types defines the universal event envelope shared across all
// nTogether services. Import this package; do not redefine these types locally.
package types

import (
	"encoding/json"
	"fmt"
	"time"
)

// EventSource identifies which app or service emitted an event.
type EventSource string

const (
	SourceJournal    EventSource = "journal"
	SourceScheduler  EventSource = "scheduler"
	SourcePlanner    EventSource = "planner"
	SourceLists      EventSource = "lists"
	SourceDiet       EventSource = "diet"
	SourceFinancial  EventSource = "financial"
	SourceAgreement  EventSource = "agreement"
	SourceResearch   EventSource = "research"
	SourcePosthumous EventSource = "posthumous"
	SourceContacts   EventSource = "contacts"
	SourceSpace      EventSource = "space"
	SourceConnect    EventSource = "connect"
	SourceMessenger  EventSource = "messenger"
	SourceEngine     EventSource = "engine"
)

// AppEvent is the universal event envelope. The schema never versions.
// All app-specific data lives in Payload as raw JSON.
// Payload validation is the emitting app's responsibility.
type AppEvent struct {
	ID         string          `json:"id"`
	Source     EventSource     `json:"source"`
	Type       string          `json:"type"`
	Payload    json.RawMessage `json:"payload"`
	RecordedAt time.Time       `json:"recorded_at"`
}

// Validate checks that required envelope fields are present and non-zero.
// It does not inspect Payload contents.
func (e AppEvent) Validate() error {
	if e.ID == "" {
		return fmt.Errorf("event missing id")
	}
	if e.Source == "" {
		return fmt.Errorf("event missing source")
	}
	if e.Type == "" {
		return fmt.Errorf("event missing type")
	}
	if e.RecordedAt.IsZero() {
		return fmt.Errorf("event missing recorded_at")
	}
	return nil
}

// RefType describes the relationship expressed by a CrossRef.
type RefType string

const (
	RefMention RefType = "mention"
	RefEmbed   RefType = "embed"
	RefParty   RefType = "party"
	RefTag     RefType = "tag"
	RefLink    RefType = "link"
)

// CrossRef is a lightweight pointer from one app's record to another's.
// Stored in the shared local SQLite cross_refs table.
type CrossRef struct {
	ID           string      `json:"id"`
	FromSource   EventSource `json:"from_source"`
	FromRecordID string      `json:"from_record_id"`
	ToSource     EventSource `json:"to_source"`
	ToRecordID   string      `json:"to_record_id"`
	RefType      RefType     `json:"ref_type"`
	CreatedAt    time.Time   `json:"created_at"`
}

// DashStats is the per-app row in the local dash_stats table.
// Each app upserts its own row; DASH reads all rows without DATA HUB.
type DashStats struct {
	Source    EventSource            `json:"source"`
	Stats     map[string]interface{} `json:"stats"`
	UpdatedAt time.Time              `json:"updated_at"`
}
