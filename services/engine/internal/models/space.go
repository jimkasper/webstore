package models

import (
	"time"

	"github.com/google/uuid"
)

// Space is the domain model — a safe view of the DB row without private key or password hash.
type Space struct {
	ID          uuid.UUID `json:"id"`
	Handle      string    `json:"handle"`
	DisplayName string    `json:"display_name"`
	PublicKey   string    `json:"public_key"`
	IsLocal     bool      `json:"is_local"`
	CreatedAt   time.Time `json:"created_at"`
}
