package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	db "github.com/jimkasper/ntogether/engine/db/gen"
)

type ConnectionService struct {
	q *db.Queries
}

func NewConnectionService(q *db.Queries) *ConnectionService {
	return &ConnectionService{q: q}
}

func (s *ConnectionService) Follow(ctx context.Context, fromID, toID uuid.UUID) (db.Connection, error) {
	conn, err := s.q.CreateConnection(ctx, db.CreateConnectionParams{
		FromSpaceID: &fromID,
		ToSpaceID:   &toID,
		ConnType:    db.ConnectionTypeFollow,
		Status:      db.ConnectionStatusPending,
	})
	if err != nil {
		return db.Connection{}, fmt.Errorf("create follow: %w", err)
	}
	return conn, nil
}

func (s *ConnectionService) Unfollow(ctx context.Context, fromID, toID uuid.UUID) error {
	conn, err := s.q.GetConnectionBetween(ctx, db.GetConnectionBetweenParams{
		FromSpaceID: &fromID,
		ToSpaceID:   &toID,
		ConnType:    db.ConnectionTypeFollow,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}
	return s.q.DeleteConnection(ctx, conn.ID)
}

func (s *ConnectionService) Accept(ctx context.Context, connectionID, spaceID uuid.UUID) (db.Connection, error) {
	conn, err := s.q.GetConnectionByID(ctx, connectionID)
	if err != nil {
		return db.Connection{}, err
	}
	if conn.ToSpaceID == nil || *conn.ToSpaceID != spaceID {
		return db.Connection{}, ErrForbidden
	}
	return s.q.UpdateConnectionStatus(ctx, db.UpdateConnectionStatusParams{
		ID:     connectionID,
		Status: db.ConnectionStatusAccepted,
	})
}

func (s *ConnectionService) Reject(ctx context.Context, connectionID, spaceID uuid.UUID) (db.Connection, error) {
	conn, err := s.q.GetConnectionByID(ctx, connectionID)
	if err != nil {
		return db.Connection{}, err
	}
	if conn.ToSpaceID == nil || *conn.ToSpaceID != spaceID {
		return db.Connection{}, ErrForbidden
	}
	return s.q.UpdateConnectionStatus(ctx, db.UpdateConnectionStatusParams{
		ID:     connectionID,
		Status: db.ConnectionStatusRejected,
	})
}

func (s *ConnectionService) ListFollowers(ctx context.Context, spaceID uuid.UUID, limit, offset int32) ([]db.ListFollowersRow, error) {
	return s.q.ListFollowers(ctx, db.ListFollowersParams{
		ToSpaceID: &spaceID,
		Limit:     limit,
		Offset:    offset,
	})
}

func (s *ConnectionService) ListFollowing(ctx context.Context, spaceID uuid.UUID, limit, offset int32) ([]db.ListFollowingRow, error) {
	return s.q.ListFollowing(ctx, db.ListFollowingParams{
		FromSpaceID: &spaceID,
		Limit:       limit,
		Offset:      offset,
	})
}

var ErrForbidden = errors.New("forbidden")
