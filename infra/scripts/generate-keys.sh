#!/usr/bin/env bash
set -euo pipefail

# Generate a JWT secret and RSA key pair for development.
# In production, manage keys via your secrets manager.

OUT_DIR="${1:-.}"
mkdir -p "$OUT_DIR"

echo "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 48)

echo "Generating RSA-2048 key pair..."
openssl genrsa -out "$OUT_DIR/private.pem" 2048 2>/dev/null
openssl rsa -in "$OUT_DIR/private.pem" -pubout -out "$OUT_DIR/public.pem" 2>/dev/null

echo ""
echo "Done. Add to your .env:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "Keys written to:"
echo "  $OUT_DIR/private.pem"
echo "  $OUT_DIR/public.pem"
echo ""
echo "Keep private.pem secret. Never commit it."
