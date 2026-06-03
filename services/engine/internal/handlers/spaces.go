package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	db "github.com/jimkasper/ntogether/engine/db/gen"
	"github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type SpaceHandler struct {
	spaces *services.SpaceService
	auth   *services.AuthService
}

func NewSpaceHandler(spaces *services.SpaceService, auth *services.AuthService) *SpaceHandler {
	return &SpaceHandler{spaces: spaces, auth: auth}
}

func (h *SpaceHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	space, err := h.spaces.GetByID(r.Context(), spaceID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.NotFound(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, spaceResponse(space))
}

func (h *SpaceHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	var body struct {
		DisplayName string `json:"display_name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.DisplayName == "" {
		httputil.BadRequest(w, "display_name required")
		return
	}
	space, err := h.spaces.UpdateDisplayName(r.Context(), spaceID, body.DisplayName)
	if err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, spaceResponse(space))
}

func (h *SpaceHandler) DeleteMe(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	_ = h.auth.LogoutAll(r.Context(), spaceID)
	if err := h.spaces.Deactivate(r.Context(), spaceID); err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.NoContent(w)
}

func (h *SpaceHandler) GetByHandle(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.NotFound(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, spaceResponse(space))
}

// spaceResponse strips sensitive fields for API responses.
func spaceResponse(s db.Space) map[string]interface{} {
	return map[string]interface{}{
		"id":           s.ID,
		"handle":       s.Handle,
		"display_name": s.DisplayName,
		"public_key":   s.PublicKey,
		"is_local":     s.IsLocal,
		"created_at":   s.CreatedAt.Format(time.RFC3339),
	}
}

