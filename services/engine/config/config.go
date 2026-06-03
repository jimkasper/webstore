package config

import "time"

type Config struct {
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	JWTAccessTTL   time.Duration
	JWTRefreshTTL  time.Duration
	EngineHost     string
	EnginePort     string
	EngineBaseURL  string
	CORSOrigins    []string
	LogLevel       string
}
