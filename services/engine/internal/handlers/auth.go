package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jimkasper/ntogether/engine/internal/middleware"
	"github.com/jimkasper/ntogether/engine/internal/services"
	"github.com/jimkasper/ntogether/engine/pkg/httputil"
)

type AuthHandler struct {
	auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Handle      string `json:"handle"`
		DisplayName string `json:"display_name"`
		Email       string `json:"email"`
		Password    string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.BadRequest(w, "invalid JSON")
		return
	}
	if body.Handle == "" || body.Email == "" || body.Password == "" {
		httputil.BadRequest(w, "handle, email, and password are required")
		return
	}
	if body.DisplayName == "" {
		body.DisplayName = body.Handle
	}

	space, tokens, err := h.auth.Register(r.Context(), services.RegisterParams{
		Handle:      body.Handle,
		DisplayName: body.DisplayName,
		Email:       body.Email,
		Password:    body.Password,
	})
	if err != nil {
		httputil.Conflict(w, err.Error())
		return
	}
	httputil.Created(w, map[string]interface{}{
		"space":  spaceResponse(space),
		"tokens": tokens,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Handle   string `json:"handle"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httputil.BadRequest(w, "invalid JSON")
		return
	}

	space, tokens, err := h.auth.Login(r.Context(), body.Handle, body.Password)
	if err != nil {
		httputil.Unauthorized(w)
		return
	}
	httputil.Ok(w, map[string]interface{}{
		"space":  spaceResponse(space),
		"tokens": tokens,
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.RefreshToken == "" {
		httputil.BadRequest(w, "refresh_token required")
		return
	}

	tokens, err := h.auth.Refresh(r.Context(), body.RefreshToken)
	if err != nil {
		httputil.Unauthorized(w)
		return
	}
	httputil.Ok(w, tokens)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err == nil && body.RefreshToken != "" {
		_ = h.auth.Logout(r.Context(), body.RefreshToken)
	}
	httputil.NoContent(w)
}

func (h *AuthHandler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	spaceID, ok := middleware.SpaceIDFromCtx(r.Context())
	if !ok {
		httputil.Unauthorized(w)
		return
	}
	_ = h.auth.LogoutAll(r.Context(), spaceID)
	httputil.NoContent(w)
}
