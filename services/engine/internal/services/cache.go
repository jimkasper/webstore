package services

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheService struct {
	rdb *redis.Client
}

func NewCacheService(rdb *redis.Client) *CacheService {
	return &CacheService{rdb: rdb}
}

func (s *CacheService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return s.rdb.Set(ctx, key, value, ttl).Err()
}

func (s *CacheService) Get(ctx context.Context, key string) (string, error) {
	return s.rdb.Get(ctx, key).Result()
}

func (s *CacheService) Del(ctx context.Context, keys ...string) error {
	return s.rdb.Del(ctx, keys...).Err()
}

func (s *CacheService) SpaceKey(handle string) string {
	return fmt.Sprintf("space:%s", handle)
}

func (s *CacheService) Publish(ctx context.Context, channel string, payload interface{}) error {
	return s.rdb.Publish(ctx, channel, payload).Err()
}

func (s *CacheService) Subscribe(ctx context.Context, channels ...string) *redis.PubSub {
	return s.rdb.Subscribe(ctx, channels...)
}

// RateLimit checks if a key has exceeded the limit within the window.
// Returns (allowed, remaining, error).
func (s *CacheService) RateLimit(ctx context.Context, key string, limit int, window time.Duration) (bool, int, error) {
	pipe := s.rdb.Pipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, window)
	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, err
	}
	count := int(incr.Val())
	remaining := limit - count
	if remaining < 0 {
		remaining = 0
	}
	return count <= limit, remaining, nil
}
