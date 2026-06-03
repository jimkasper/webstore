package middleware

import (
	"net/http"
	"time"

	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

// RateLimit returns middleware that limits requests per IP using Redis.
func RateLimit(cache *services.CacheService, limit int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := "rl:" + r.RemoteAddr + ":" + r.URL.Path
			allowed, _, err := cache.RateLimit(r.Context(), key, limit, window)
			if err != nil || !allowed {
				httputil.Error(w, http.StatusTooManyRequests, "rate limit exceeded")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
