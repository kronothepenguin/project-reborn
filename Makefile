install:
	go mod tidy

dev:
	go tool air

client:
	go tool air -c .air.client.toml

cms:
	go tool air -c .air.cms.toml

build:
	mkdir -p ./bin
# go run ./tools/build	
	go build -o ./bin/main ./cmd/habbo

generate:
	go tool sqlc generate

.PHONY: dev client cms build generate
