package apub

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Sign adds an HTTP Signature header to the request using the given RSA private key.
func Sign(req *http.Request, keyID string, privateKey *rsa.PrivateKey, body []byte) error {
	date := time.Now().UTC().Format(http.TimeFormat)
	req.Header.Set("Date", date)

	var digestHeader string
	if body != nil {
		h := sha256.Sum256(body)
		digestHeader = "SHA-256=" + base64.StdEncoding.EncodeToString(h[:])
		req.Header.Set("Digest", digestHeader)
	}

	headers := []string{"(request-target)", "host", "date"}
	if digestHeader != "" {
		headers = append(headers, "digest")
	}

	signingString := buildSigningString(req, headers)
	hashed := sha256.Sum256([]byte(signingString))
	sig, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return fmt.Errorf("signing: %w", err)
	}

	encoded := base64.StdEncoding.EncodeToString(sig)
	headerList := strings.Join(headers, " ")
	req.Header.Set("Signature", fmt.Sprintf(
		`keyId="%s",algorithm="rsa-sha256",headers="%s",signature="%s"`,
		keyID, headerList, encoded,
	))
	return nil
}

// Verify checks the HTTP Signature on an incoming request.
func Verify(req *http.Request, publicKeyPEM string) error {
	sigHeader := req.Header.Get("Signature")
	if sigHeader == "" {
		return fmt.Errorf("missing Signature header")
	}

	params := parseSignatureHeader(sigHeader)
	headers := strings.Split(params["headers"], " ")
	signingString := buildSigningString(req, headers)

	sig, err := base64.StdEncoding.DecodeString(params["signature"])
	if err != nil {
		return fmt.Errorf("decode signature: %w", err)
	}

	pubKey, err := parsePublicKey(publicKeyPEM)
	if err != nil {
		return err
	}

	hashed := sha256.Sum256([]byte(signingString))
	return rsa.VerifyPKCS1v15(pubKey, crypto.SHA256, hashed[:], sig)
}

func buildSigningString(req *http.Request, headers []string) string {
	var parts []string
	for _, h := range headers {
		switch h {
		case "(request-target)":
			parts = append(parts, fmt.Sprintf("(request-target): %s %s", strings.ToLower(req.Method), req.URL.RequestURI()))
		case "host":
			parts = append(parts, "host: "+req.Host)
		default:
			parts = append(parts, h+": "+req.Header.Get(http.CanonicalHeaderKey(h)))
		}
	}
	return strings.Join(parts, "\n")
}

func parseSignatureHeader(header string) map[string]string {
	result := make(map[string]string)
	for _, part := range strings.Split(header, ",") {
		part = strings.TrimSpace(part)
		idx := strings.Index(part, "=")
		if idx < 0 {
			continue
		}
		key := part[:idx]
		val := strings.Trim(part[idx+1:], `"`)
		result[key] = val
	}
	return result
}

func parsePublicKey(pemStr string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse public key: %w", err)
	}
	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an RSA public key")
	}
	return rsaPub, nil
}
