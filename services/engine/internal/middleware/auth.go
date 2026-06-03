package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type contextKey string

const SpaceIDKey contextKey = "spaceID"

func Auth(authSvc *services.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			bearer := r.Header.Get("Authorization")
			if !strings.HasPrefix(bearer, "Bearer ") {
				httputil.Unauthorized(w)
				return
			}
			token := strings.TrimPrefix(bearer, "Bearer ")
			spaceID, err := authSvc.ValidateAccessToken(token)
			if err != nil {
				httputil.Unauthorized(w)
				return
			}
			ctx := context.WithValue(r.Context(), SpaceIDKey, spaceID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func SpaceIDFromCtx(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(SpaceIDKey).(uuid.UUID)
	return id, ok
}
