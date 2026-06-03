package server

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/jimkasper/ntogether/engine/config"
	db "github.com/jimkasper/ntogether/engine/db/gen"
	"github.com/jimkasper/ntogether/engine/internal/handlers"
	"github.com/jimkasper/ntogether/engine/internal/services"
)

type Server struct {
	cfg    *config.Config
	http   *http.Server
}

func New(cfg *config.Config, sqlDB *sql.DB, rdb *redis.Client) *Server {
	q := db.New(sqlDB)

	// Services
	crypto := services.NewCryptoService()
	cache := services.NewCacheService(rdb)
	auth := services.NewAuthService(q, crypto, cfg.JWTSecret, cfg.JWTAccessTTL, cfg.JWTRefreshTTL)
	spaces := services.NewSpaceService(q, cache)
	conns := services.NewConnectionService(q)
	transfers := services.NewTransferService(q, crypto)
	federation := services.NewFederationService(q, crypto, cfg.EngineBaseURL)

	// Handlers
	authH := handlers.NewAuthHandler(auth)
	spaceH := handlers.NewSpaceHandler(spaces, auth)
	connH := handlers.NewConnectionHandler(conns, spaces)
	transferH := handlers.NewTransferHandler(transfers, spaces)
	apH := handlers.NewAPHandler(spaces, federation)
	wsH := handlers.NewWSHandler(cache)

	r := buildRouter(cfg, auth, cache, authH, spaceH, connH, transferH, apH, wsH)

	return &Server{
		cfg: cfg,
		http: &http.Server{
			Addr:         fmt.Sprintf("%s:%s", cfg.EngineHost, cfg.EnginePort),
			Handler:      r,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 60 * time.Second,
			IdleTimeout:  120 * time.Second,
		},
	}
}

func (s *Server) Start() error {
	return s.http.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
