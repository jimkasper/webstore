package store

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func NewPostgres(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}
	if err := db.PingContext(context.Background()); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	return db, nil
}

// RunMigrations applies all pending SQL migrations from the embed FS.
// Uses a simple sequential approach: track applied migrations in schema_migrations table.
func RunMigrations(db *sql.DB, migrations []Migration) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version TEXT PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`)
	if err != nil {
		return fmt.Errorf("create migrations table: %w", err)
	}

	for _, m := range migrations {
		var exists bool
		err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)`, m.Version).Scan(&exists)
		if err != nil {
			return fmt.Errorf("check migration %s: %w", m.Version, err)
		}
		if exists {
			continue
		}

		if _, err := db.Exec(m.Up); err != nil {
			return fmt.Errorf("apply migration %s: %w", m.Version, err)
		}
		if _, err := db.Exec(`INSERT INTO schema_migrations (version) VALUES ($1)`, m.Version); err != nil {
			return fmt.Errorf("record migration %s: %w", m.Version, err)
		}
	}
	return nil
}

type Migration struct {
	Version string
	Up      string
}
