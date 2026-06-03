package handlers

import (
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

// WSHandler manages WebSocket connections for real-time notifications.
// Uses a simple polling/SSE approach as a fallback when a WebSocket upgrader
// library is not available. Wire in gorilla/websocket for production upgrade.
type WSHandler struct {
	cache   *services.CacheService
	clients sync.Map // map[uuid.UUID]chan []byte
}

func NewWSHandler(cache *services.CacheService) *WSHandler {
	return &WSHandler{cache: cache}
}

// ServeWS upgrades to a simple long-poll SSE connection.
// In production, replace with a proper WebSocket upgrader.
func (h *WSHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		httputil.InternalServerError(w)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	ch := make(chan []byte, 16)
	h.clients.Store(spaceID, ch)
	defer h.clients.Delete(spaceID)

	// Subscribe to Redis pub-sub for this space's notifications.
	sub := h.cache.Subscribe(r.Context(), notificationChannel(spaceID))
	defer sub.Close()

	ping := time.NewTicker(30 * time.Second)
	defer ping.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ping.C:
			_, _ = w.Write([]byte(": ping\n\n"))
			flusher.Flush()
		case msg, ok := <-sub.Channel():
			if !ok {
				return
			}
			_, _ = w.Write([]byte("data: " + msg.Payload + "\n\n"))
			flusher.Flush()
		case payload, ok := <-ch:
			if !ok {
				return
			}
			_, _ = w.Write([]byte("data: "))
			_, _ = w.Write(payload)
			_, _ = w.Write([]byte("\n\n"))
			flusher.Flush()
		}
	}
}

func (h *WSHandler) Notify(spaceID uuid.UUID, payload []byte) {
	if ch, ok := h.clients.Load(spaceID); ok {
		select {
		case ch.(chan []byte) <- payload:
		default:
			slog.Warn("ws: client buffer full, dropping notification", "space_id", spaceID)
		}
	}
}

func notificationChannel(spaceID uuid.UUID) string {
	return "notify:" + spaceID.String()
}
