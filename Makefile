.PHONY: dev build down engine-ui sqlc migrate

# ── Dev ──────────────────────────────────────────────────────────────────────
dev:
	docker compose up --build

down:
	docker compose down

# ── ENGINE Go backend ─────────────────────────────────────────────────────────
build:
	cd services/engine && go build -o engine ./...

run:
	cd services/engine && go run .

sqlc:
	cd services/engine && sqlc generate

# ── engine-ui React frontend ──────────────────────────────────────────────────
engine-ui:
	cd apps/engine-ui && npm run dev

engine-ui-build:
	cd apps/engine-ui && npm run build

# ── Demo ──────────────────────────────────────────────────────────────────────
demo:
	cd demo && npm run dev

demo-build:
	cd demo && npm run build

# ── Keys ──────────────────────────────────────────────────────────────────────
keys:
	bash infra/scripts/generate-keys.sh
