package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	db "github.com/jimkasper/ntogether/engine/db/gen"
)

type TransferService struct {
	q      *db.Queries
	crypto *CryptoService
}

func NewTransferService(q *db.Queries, crypto *CryptoService) *TransferService {
	return &TransferService{q: q, crypto: crypto}
}

type CreateTransferParams struct {
	FromSpaceID uuid.UUID
	ToSpaceID   *uuid.UUID
	ToAPActor   *string
	Payload     []byte
	TTL         time.Duration
}

func (s *TransferService) Create(ctx context.Context, p CreateTransferParams) (db.Transfer, error) {
	enc, err := s.crypto.Encrypt(p.Payload)
	if err != nil {
		return db.Transfer{}, fmt.Errorf("encrypt payload: %w", err)
	}

	ttl := p.TTL
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}

	return s.q.CreateTransfer(ctx, db.CreateTransferParams{
		FromSpaceID: p.FromSpaceID,
		ToSpaceID:   p.ToSpaceID,
		ToApActor:   p.ToAPActor,
		PayloadEnc:  enc,
		ExpiresAt:   time.Now().Add(ttl),
	})
}

// GetStatus returns a transfer without decrypting the payload.
func (s *TransferService) GetStatus(ctx context.Context, id, requesterID uuid.UUID) (db.Transfer, error) {
	t, err := s.q.GetTransferByID(ctx, id)
	if err != nil {
		return db.Transfer{}, err
	}
	if t.FromSpaceID != requesterID && (t.ToSpaceID == nil || *t.ToSpaceID != requesterID) {
		return db.Transfer{}, ErrForbidden
	}
	return t, nil
}

// Accept decrypts the payload, then DELETES the transfer row. Returns decrypted bytes.
func (s *TransferService) Accept(ctx context.Context, id, toSpaceID uuid.UUID) ([]byte, error) {
	t, err := s.q.GetTransferByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t.ToSpaceID == nil || *t.ToSpaceID != toSpaceID {
		return nil, ErrForbidden
	}

	payload, err := s.crypto.Decrypt(t.PayloadEnc)
	if err != nil {
		return nil, fmt.Errorf("decrypt payload: %w", err)
	}

	// Delete immediately — no audit log by design.
	if err := s.q.DeleteTransfer(ctx, id); err != nil {
		return nil, err
	}
	return payload, nil
}

// Cancel deletes the transfer (sender only).
func (s *TransferService) Cancel(ctx context.Context, id, fromSpaceID uuid.UUID) error {
	t, err := s.q.GetTransferByID(ctx, id)
	if err != nil {
		return err
	}
	if t.FromSpaceID != fromSpaceID {
		return ErrForbidden
	}
	return s.q.DeleteTransfer(ctx, id)
}

func (s *TransferService) PurgeExpired(ctx context.Context) error {
	return s.q.DeleteExpiredTransfers(ctx)
}
