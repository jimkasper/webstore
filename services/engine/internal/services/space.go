package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	db "github.com/jimkasper/ntogether/engine/db/gen"
)

// SpaceService wraps space CRUD with Redis caching.
type SpaceService struct {
	q     *db.Queries
	cache *CacheService
}

func NewSpaceService(q *db.Queries, cache *CacheService) *SpaceService {
	return &SpaceService{q: q, cache: cache}
}

func (s *SpaceService) GetByHandle(ctx context.Context, handle string) (db.Space, error) {
	cacheKey := s.cache.SpaceKey(handle)
	if raw, err := s.cache.Get(ctx, cacheKey); err == nil {
		var sp db.Space
		if json.Unmarshal([]byte(raw), &sp) == nil {
			return sp, nil
		}
	}

	sp, err := s.q.GetSpaceByHandle(ctx, handle)
	if err != nil {
		return db.Space{}, err
	}

	if data, err := json.Marshal(sp); err == nil {
		_ = s.cache.Set(ctx, cacheKey, data, 5*time.Minute)
	}
	return sp, nil
}

func (s *SpaceService) GetByID(ctx context.Context, id uuid.UUID) (db.Space, error) {
	return s.q.GetSpaceByID(ctx, id)
}

func (s *SpaceService) UpdateDisplayName(ctx context.Context, id uuid.UUID, displayName string) (db.Space, error) {
	sp, err := s.q.UpdateSpaceDisplayName(ctx, db.UpdateSpaceDisplayNameParams{
		ID:          id,
		DisplayName: displayName,
	})
	if err != nil {
		return db.Space{}, fmt.Errorf("update display name: %w", err)
	}
	_ = s.cache.Del(ctx, s.cache.SpaceKey(sp.Handle))
	return sp, nil
}

func (s *SpaceService) Deactivate(ctx context.Context, id uuid.UUID) error {
	sp, err := s.q.GetSpaceByID(ctx, id)
	if err != nil {
		return err
	}
	if err := s.q.DeactivateSpace(ctx, id); err != nil {
		return err
	}
	_ = s.cache.Del(ctx, s.cache.SpaceKey(sp.Handle))
	return nil
}
