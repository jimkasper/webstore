package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type TransferHandler struct {
	transfers *services.TransferService
	spaces    *services.SpaceService
}

func NewTransferHandler(transfers *services.TransferService, spaces *services.SpaceService) *TransferHandler {
	return &TransferHandler{transfers: transfers, spaces: spaces}
}

func (h *TransferHandler) Create(w http.ResponseWriter, r *http.Request) {
	fromID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}

	var body struct {
		ToHandle  string          `json:"to_handle"`
		ToAPActor string          `json:"to_ap_actor"`
		Payload   json.RawMessage `json:"payload"`
		TTLHours  int             `json:"ttl_hours"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.BadRequest(w, "invalid JSON")
		return
	}

	p := services.CreateTransferParams{
		FromSpaceID: fromID,
		Payload:     body.Payload,
		TTL:         time.Duration(body.TTLHours) * time.Hour,
	}

	if body.ToHandle != "" {
		target, err := h.spaces.GetByHandle(r.Context(), body.ToHandle)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				httputil.NotFound(w)
				return
			}
			httputil.InternalServerError(w)
			return
		}
		p.ToSpaceID = &target.ID
	} else if body.ToAPActor != "" {
		p.ToAPActor = &body.ToAPActor
	} else {
		httputil.BadRequest(w, "to_handle or to_ap_actor required")
		return
	}

	t, err := h.transfers.Create(r.Context(), p)
	if err != nil {
		httputil.InternalServerError(w)
		return
	}
	httputil.Created(w, transferResponse(t))
}

func (h *TransferHandler) Get(w http.ResponseWriter, r *http.Request) {
	requesterID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httputil.BadRequest(w, "invalid id")
		return
	}
	t, err := h.transfers.GetStatus(r.Context(), id, requesterID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.NotFound(w)
			return
		}
		if errors.Is(err, services.ErrForbidden) {
			httputil.Forbidden(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}
	httputil.Ok(w, transferResponse(t))
}

func (h *TransferHandler) Accept(w http.ResponseWriter, r *http.Request) {
	toID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httputil.BadRequest(w, "invalid id")
		return
	}
	payload, err := h.transfers.Accept(r.Context(), id, toID)
	if err != nil {
		if errors.Is(err, services.ErrForbidden) {
			httputil.Forbidden(w)
			return
		}
		httputil.NotFound(w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(payload)
}

func (h *TransferHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	fromID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httputil.BadRequest(w, "invalid id")
		return
	}
	if err := h.transfers.Cancel(r.Context(), id, fromID); err != nil {
		if errors.Is(err, services.ErrForbidden) {
			httputil.Forbidden(w)
			return
		}
		httputil.NotFound(w)
		return
	}
	httputil.NoContent(w)
}

func transferResponse(t interface{}) interface{} {
	return t
}
