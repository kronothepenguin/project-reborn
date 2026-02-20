install:
	go mod tidy

dev:
	go tool air

build:
	mkdir -p ./bin
	go build -o ./bin/main ./cmd/server

generate:
	go tool sqlc generate

.PHONY: dev build
