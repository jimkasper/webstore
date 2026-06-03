package services

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	db "github.com/jimkasper/ntogether/engine/db/gen"
)

type AuthService struct {
	q             *db.Queries
	crypto        *CryptoService
	jwtSecret     []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

func NewAuthService(q *db.Queries, crypto *CryptoService, jwtSecret string, accessTTL, refreshTTL time.Duration) *AuthService {
	return &AuthService{
		q:          q,
		crypto:     crypto,
		jwtSecret:  []byte(jwtSecret),
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

type RegisterParams struct {
	Handle      string
	DisplayName string
	Email       string
	Password    string
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

func (s *AuthService) Register(ctx context.Context, p RegisterParams) (db.Space, TokenPair, error) {
	emailHash, err := bcrypt.GenerateFromPassword([]byte(p.Email), bcrypt.DefaultCost)
	if err != nil {
		return db.Space{}, TokenPair{}, fmt.Errorf("hash email: %w", err)
	}
	passHash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil {
		return db.Space{}, TokenPair{}, fmt.Errorf("hash password: %w", err)
	}

	pubKey, privKey, err := s.crypto.GenerateRSAKeyPair()
	if err != nil {
		return db.Space{}, TokenPair{}, err
	}

	space, err := s.q.CreateSpace(ctx, db.CreateSpaceParams{
		Handle:       p.Handle,
		DisplayName:  p.DisplayName,
		EmailHash:    string(emailHash),
		PasswordHash: string(passHash),
		PublicKey:    pubKey,
		PrivateKey:   privKey,
	})
	if err != nil {
		return db.Space{}, TokenPair{}, fmt.Errorf("create space: %w", err)
	}

	tokens, err := s.issueTokens(ctx, space.ID)
	return space, tokens, err
}

func (s *AuthService) Login(ctx context.Context, handle, password string) (db.Space, TokenPair, error) {
	space, err := s.q.GetSpaceByHandle(ctx, handle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Space{}, TokenPair{}, ErrInvalidCredentials
		}
		return db.Space{}, TokenPair{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(space.PasswordHash), []byte(password)); err != nil {
		return db.Space{}, TokenPair{}, ErrInvalidCredentials
	}

	tokens, err := s.issueTokens(ctx, space.ID)
	return space, tokens, err
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (TokenPair, error) {
	session, err := s.q.GetSessionByToken(ctx, refreshToken)
	if err != nil {
		return TokenPair{}, ErrInvalidToken
	}

	if err := s.q.DeleteSessionByToken(ctx, refreshToken); err != nil {
		return TokenPair{}, err
	}

	return s.issueTokens(ctx, session.SpaceID)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	return s.q.DeleteSessionByToken(ctx, refreshToken)
}

func (s *AuthService) LogoutAll(ctx context.Context, spaceID uuid.UUID) error {
	return s.q.DeleteAllSessionsBySpaceID(ctx, spaceID)
}

func (s *AuthService) ValidateAccessToken(tokenStr string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.jwtSecret, nil
	}, jwt.WithExpirationRequired())
	if err != nil {
		return uuid.Nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, ErrInvalidToken
	}

	sub, _ := claims.GetSubject()
	id, err := uuid.Parse(sub)
	if err != nil {
		return uuid.Nil, ErrInvalidToken
	}
	return id, nil
}

func (s *AuthService) issueTokens(ctx context.Context, spaceID uuid.UUID) (TokenPair, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   spaceID.String(),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return TokenPair{}, fmt.Errorf("sign access token: %w", err)
	}

	refreshToken, err := generateToken()
	if err != nil {
		return TokenPair{}, err
	}

	_, err = s.q.CreateSession(ctx, db.CreateSessionParams{
		SpaceID:      spaceID,
		RefreshToken: refreshToken,
		ExpiresAt:    now.Add(s.refreshTTL),
	})
	if err != nil {
		return TokenPair{}, fmt.Errorf("create session: %w", err)
	}

	return TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(s.accessTTL.Seconds()),
	}, nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

var (
	ErrInvalidCredentials = fmt.Errorf("invalid credentials")
	ErrInvalidToken       = fmt.Errorf("invalid token")
)
