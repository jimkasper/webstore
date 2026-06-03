package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type ConnectionHandler struct {
	connections *services.ConnectionService
	spaces      *services.SpaceService
}

func NewConnectionHandler(connections *services.ConnectionService, spaces *services.SpaceService) *ConnectionHandler {
	return &ConnectionHandler{connections: connections, spaces: spaces}
}

func (h *ConnectionHandler) Follow(w http.ResponseWriter, r *http.Request) {
	fromID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	handle := chi.URLParam(r, "handle")
	target, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.NotFound(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	if target.ID == fromID {
		httputil.BadRequest(w, "cannot follow yourself")
		return
	}

	conn, err := h.connections.Follow(r.Context(), fromID, target.ID)
	if err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.Created(w, conn)
}

func (h *ConnectionHandler) Unfollow(w http.ResponseWriter, r *http.Request) {
	fromID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	handle := chi.URLParam(r, "handle")
	target, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		httputil.NotFound(w)
		return
	}
	if err := h.connections.Unfollow(r.Context(), fromID, target.ID); err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.NoContent(w)
}

func (h *ConnectionHandler) Accept(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	connID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httputil.BadRequest(w, "invalid connection id")
		return
	}
	conn, err := h.connections.Accept(r.Context(), connID, spaceID)
	if err != nil {
		if errors.Is(err, services.ErrForbidden) {
			httputil.Forbidden(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, conn)
}

func (h *ConnectionHandler) Reject(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	connID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httputil.BadRequest(w, "invalid connection id")
		return
	}
	conn, err := h.connections.Reject(r.Context(), connID, spaceID)
	if err != nil {
		if errors.Is(err, services.ErrForbidden) {
			httputil.Forbidden(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, conn)
}

func (h *ConnectionHandler) Followers(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	limit, offset := parsePagination(r)
	rows, err := h.connections.ListFollowers(r.Context(), spaceID, limit, offset)
	if err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, rows)
}

func (h *ConnectionHandler) Following(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	limit, offset := parsePagination(r)
	rows, err := h.connections.ListFollowing(r.Context(), spaceID, limit, offset)
	if err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, rows)
}

func parsePagination(r *http.Request) (int32, int32) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	return int32(limit), int32(offset)
}
