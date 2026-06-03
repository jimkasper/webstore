package apub

const (
	ActivityStreamsContext = "https://www.w3.org/ns/activitystreams"
	SecurityContext       = "https://w3id.org/security/v1"
)

type Context []interface{}

func DefaultContext() Context {
	return Context{ActivityStreamsContext, SecurityContext}
}

type Actor struct {
	Context           Context    `json:"@context"`
	ID                string     `json:"id"`
	Type              string     `json:"type"`
	PreferredUsername string     `json:"preferredUsername"`
	Name              string     `json:"name,omitempty"`
	Inbox             string     `json:"inbox"`
	Outbox            string     `json:"outbox"`
	Followers         string     `json:"followers"`
	Following         string     `json:"following"`
	PublicKey         *PublicKey `json:"publicKey,omitempty"`
	URL               string     `json:"url,omitempty"`
}

type PublicKey struct {
	ID           string `json:"id"`
	Owner        string `json:"owner"`
	PublicKeyPem string `json:"publicKeyPem"`
}

type Activity struct {
	Context Context     `json:"@context,omitempty"`
	ID      string      `json:"id"`
	Type    string      `json:"type"`
	Actor   interface{} `json:"actor"`
	Object  interface{} `json:"object"`
	To      []string    `json:"to,omitempty"`
	CC      []string    `json:"cc,omitempty"`
}

type WebFingerResponse struct {
	Subject string          `json:"subject"`
	Links   []WebFingerLink `json:"links"`
}

type WebFingerLink struct {
	Rel  string `json:"rel"`
	Type string `json:"type,omitempty"`
	Href string `json:"href,omitempty"`
}

type OrderedCollection struct {
	Context    Context `json:"@context"`
	ID         string  `json:"id"`
	Type       string  `json:"type"`
	TotalItems int     `json:"totalItems"`
	First      string  `json:"first,omitempty"`
	Items      []interface{} `json:"orderedItems,omitempty"`
}
