package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	db "github.com/jimkasper/ntogether/engine/db/gen"
	"github.com/jimkasper/ntogether/engine/pkg/apub"
)

type FederationService struct {
	q          *db.Queries
	crypto     *CryptoService
	baseURL    string
	httpClient *http.Client
}

func NewFederationService(q *db.Queries, crypto *CryptoService, baseURL string) *FederationService {
	return &FederationService{
		q:       q,
		crypto:  crypto,
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *FederationService) BuildActor(space db.Space) apub.Actor {
	id := fmt.Sprintf("%s/ap/users/%s", s.baseURL, space.Handle)
	return apub.Actor{
		Context:           apub.DefaultContext(),
		ID:                id,
		Type:              "Person",
		PreferredUsername: space.Handle,
		Name:              space.DisplayName,
		Inbox:             id + "/inbox",
		Outbox:            id + "/outbox",
		Followers:         id + "/followers",
		Following:         id + "/following",
		URL:               s.baseURL + "/@" + space.Handle,
		PublicKey: &apub.PublicKey{
			ID:           id + "#main-key",
			Owner:        id,
			PublicKeyPem: space.PublicKey,
		},
	}
}

func (s *FederationService) BuildWebFinger(space db.Space, domain string) apub.WebFingerResponse {
	actorID := fmt.Sprintf("%s/ap/users/%s", s.baseURL, space.Handle)
	return apub.WebFingerResponse{
		Subject: fmt.Sprintf("acct:%s@%s", space.Handle, domain),
		Links: []apub.WebFingerLink{
			{
				Rel:  "self",
				Type: `application/activity+json`,
				Href: actorID,
			},
		},
	}
}

func (s *FederationService) SendAccept(ctx context.Context, space db.Space, followActivity map[string]interface{}) error {
	actorID := fmt.Sprintf("%s/ap/users/%s", s.baseURL, space.Handle)
	actor, ok := followActivity["actor"].(string)
	if !ok {
		return fmt.Errorf("invalid actor in follow activity")
	}

	remoteActor, err := s.fetchActor(ctx, actor)
	if err != nil {
		return fmt.Errorf("fetch actor: %w", err)
	}

	accept := apub.Activity{
		Context: apub.DefaultContext(),
		ID:      fmt.Sprintf("%s/ap/activities/%d", s.baseURL, time.Now().UnixNano()),
		Type:    "Accept",
		Actor:   actorID,
		Object:  followActivity,
	}

	body, err := json.Marshal(accept)
	if err != nil {
		return err
	}

	privKey, err := s.crypto.ParsePrivateKey(space.PrivateKey)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, remoteActor.InboxUrl, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", `application/activity+json`)
	req.Header.Set("Host", req.URL.Host)

	keyID := fmt.Sprintf("%s/ap/users/%s#main-key", s.baseURL, space.Handle)
	if err := apub.Sign(req, keyID, privKey, body); err != nil {
		return err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("deliver accept: %w", err)
	}
	defer resp.Body.Close()
	return nil
}

func (s *FederationService) fetchActor(ctx context.Context, actorURL string) (*db.ApActor, error) {
	existing, err := s.q.GetAPActorByAPID(ctx, actorURL)
	if err == nil && time.Since(existing.FetchedAt) < time.Hour {
		return &existing, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, actorURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", `application/activity+json`)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var actor struct {
		ID                string `json:"id"`
		Type              string `json:"type"`
		PreferredUsername string `json:"preferredUsername"`
		Inbox             string `json:"inbox"`
		Outbox            string `json:"outbox"`
		PublicKey         struct {
			PublicKeyPem string `json:"publicKeyPem"`
		} `json:"publicKey"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&actor); err != nil {
		return nil, err
	}

	rawData, _ := json.Marshal(actor)
	outbox := actor.Outbox
	upserted, err := s.q.UpsertAPActor(ctx, db.UpsertAPActorParams{
		ApID:              actor.ID,
		ActorType:         actor.Type,
		PreferredUsername: actor.PreferredUsername,
		InboxUrl:          actor.Inbox,
		OutboxUrl:         &outbox,
		PublicKeyPem:      actor.PublicKey.PublicKeyPem,
		RawData:           rawData,
	})
	if err != nil {
		return nil, err
	}
	return &upserted, nil
}
