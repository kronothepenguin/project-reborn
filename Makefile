install:
	go mod tidy

dev:
	go tool air

cms:
	go tool air -c .air.cms.toml

build:
	mkdir -p ./bin
	go build -o ./bin/main ./cmd/habbo

generate:
	go tool sqlc generate

.PHONY: dev cms cms-dev build generate
