package server

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/jimkasper/ntogether/engine/config"
	"github.com/jimkasper/ntogether/engine/internal/handlers"
	mw "github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
)

func buildRouter(
	cfg *config.Config,
	auth *services.AuthService,
	cache *services.CacheService,
	authH *handlers.AuthHandler,
	spaceH *handlers.SpaceHandler,
	connH *handlers.ConnectionHandler,
	transferH *handlers.TransferHandler,
	apH *handlers.APHandler,
	wsH *handlers.WSHandler,
) http.Handler {
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.Recoverer)
	r.Use(mw.Logger)
	r.Use(mw.CORS(cfg.CORSOrigins))

	// Health check
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// Auth routes — rate limited
	rl := mw.RateLimit(cache, 20, time.Minute)
	r.With(rl).Post("/api/v1/auth/register", authH.Register)
	r.With(rl).Post("/api/v1/auth/login", authH.Login)
	r.With(rl).Post("/api/v1/auth/refresh", authH.Refresh)
	r.With(rl).Delete("/api/v1/auth/logout", authH.Logout)

	// Authenticated API
	authMW := mw.Auth(auth)
	r.With(authMW).Delete("/api/v1/auth/logout-all", authH.LogoutAll)

	r.With(authMW).Get("/api/v1/me", spaceH.GetMe)
	r.With(authMW).Put("/api/v1/me", spaceH.UpdateMe)
	r.With(authMW).Delete("/api/v1/me", spaceH.DeleteMe)

	r.Get("/api/v1/spaces/{handle}", spaceH.GetByHandle)

	r.With(authMW).Post("/api/v1/connections/follow/{handle}", connH.Follow)
	r.With(authMW).Delete("/api/v1/connections/follow/{handle}", connH.Unfollow)
	r.With(authMW).Put("/api/v1/connections/{id}/accept", connH.Accept)
	r.With(authMW).Put("/api/v1/connections/{id}/reject", connH.Reject)
	r.With(authMW).Get("/api/v1/connections/followers", connH.Followers)
	r.With(authMW).Get("/api/v1/connections/following", connH.Following)

	r.With(authMW).Post("/api/v1/transfers", transferH.Create)
	r.With(authMW).Get("/api/v1/transfers/{id}", transferH.Get)
	r.With(authMW).Put("/api/v1/transfers/{id}/accept", transferH.Accept)
	r.With(authMW).Delete("/api/v1/transfers/{id}", transferH.Cancel)

	// WebSocket / SSE
	r.With(authMW).Get("/ws", wsH.ServeWS)

	// ActivityPub / WebFinger (public)
	r.Get("/.well-known/webfinger", apH.WebFinger)
	r.Get("/ap/users/{handle}", apH.Actor)
	r.Post("/ap/users/{handle}/inbox", apH.Inbox)
	r.Get("/ap/users/{handle}/outbox", apH.Outbox)
	r.Get("/ap/users/{handle}/followers", apH.Followers)
	r.Get("/ap/users/{handle}/following", apH.Following)

	return r
}
