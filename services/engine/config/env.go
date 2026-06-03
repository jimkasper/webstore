package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

func Load() (*Config, error) {
	cfg := &Config{
		DatabaseURL:   requireEnv("DATABASE_URL"),
		RedisURL:      requireEnv("REDIS_URL"),
		JWTSecret:     requireEnv("JWT_SECRET"),
		EngineHost:    getEnv("ENGINE_HOST", "0.0.0.0"),
		EnginePort:    getEnv("ENGINE_PORT", "8080"),
		EngineBaseURL: getEnv("ENGINE_BASE_URL", "http://localhost:8080"),
		LogLevel:      getEnv("LOG_LEVEL", "info"),
	}

	var err error
	cfg.JWTAccessTTL, err = parseDuration("JWT_ACCESS_TTL", "15m")
	if err != nil {
		return nil, err
	}
	cfg.JWTRefreshTTL, err = parseDuration("JWT_REFRESH_TTL", "720h")
	if err != nil {
		return nil, err
	}

	origins := getEnv("CORS_ORIGINS", "http://localhost:5173")
	cfg.CORSOrigins = strings.Split(origins, ",")

	return cfg, nil
}

func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required env var %s is not set", key))
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseDuration(key, fallback string) (time.Duration, error) {
	s := getEnv(key, fallback)
	d, err := time.ParseDuration(s)
	if err != nil {
		return 0, fmt.Errorf("invalid duration for %s: %w", key, err)
	}
	return d, nil
}
