package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/apub"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type APHandler struct {
	spaces     *services.SpaceService
	federation *services.FederationService
}

func NewAPHandler(spaces *services.SpaceService, federation *services.FederationService) *APHandler {
	return &APHandler{spaces: spaces, federation: federation}
}

// WebFinger handles GET /.well-known/webfinger?resource=acct:handle@domain
func (h *APHandler) WebFinger(w http.ResponseWriter, r *http.Request) {
	resource := r.URL.Query().Get("resource")
	if !strings.HasPrefix(resource, "acct:") {
		httputil.BadRequest(w, "resource must start with acct:")
		return
	}
	acct := strings.TrimPrefix(resource, "acct:")
	parts := strings.SplitN(acct, "@", 2)
	if len(parts) != 2 {
		httputil.BadRequest(w, "invalid acct format")
		return
	}
	handle, domain := parts[0], parts[1]

	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.NotFound(w)
			return
		}
		httputil.InternalServerError(w)
		return
	}

	wf := h.federation.BuildWebFinger(space, domain)
	w.Header().Set("Content-Type", "application/jrd+json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(wf)
}

// Actor handles GET /ap/users/:handle
func (h *APHandler) Actor(w http.ResponseWriter, r *http.Request) {
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
	actor := h.federation.BuildActor(space)
	httputil.ActivityJSON(w, actor)
}

// Inbox handles POST /ap/users/:handle/inbox
func (h *APHandler) Inbox(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		httputil.NotFound(w)
		return
	}

	var activity map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&activity); err != nil {
		httputil.BadRequest(w, "invalid JSON")
		return
	}

	actType, _ := activity["type"].(string)
	switch actType {
	case "Follow":
		go func() {
			_ = h.federation.SendAccept(r.Context(), space, activity)
		}()
	case "Undo":
		// Handle unfollow — no-op for now; connection cleanup handled separately
	}

	w.WriteHeader(http.StatusAccepted)
}

// Outbox handles GET /ap/users/:handle/outbox
func (h *APHandler) Outbox(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		httputil.NotFound(w)
		return
	}
	actorID := h.federation.BuildActor(space).ID
	coll := apub.OrderedCollection{
		Context:    apub.DefaultContext(),
		ID:         actorID + "/outbox",
		Type:       "OrderedCollection",
		TotalItems: 0,
	}
	httputil.ActivityJSON(w, coll)
}

// Followers handles GET /ap/users/:handle/followers
func (h *APHandler) Followers(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		httputil.NotFound(w)
		return
	}
	actorID := h.federation.BuildActor(space).ID
	coll := apub.OrderedCollection{
		Context: apub.DefaultContext(),
		ID:      actorID + "/followers",
		Type:    "OrderedCollection",
	}
	httputil.ActivityJSON(w, coll)
}

// Following handles GET /ap/users/:handle/following
func (h *APHandler) Following(w http.ResponseWriter, r *http.Request) {
	handle := chi.URLParam(r, "handle")
	space, err := h.spaces.GetByHandle(r.Context(), handle)
	if err != nil {
		httputil.NotFound(w)
		return
	}
	actorID := h.federation.BuildActor(space).ID
	coll := apub.OrderedCollection{
		Context: apub.DefaultContext(),
		ID:      actorID + "/following",
		Type:    "OrderedCollection",
	}
	httputil.ActivityJSON(w, coll)
}
