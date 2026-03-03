install:
	go mod tidy

dev:
	go tool air

client:
	go run ./tools/dev/client

cms:
	go tool air -c .air.cms.toml

build:
	mkdir -p ./bin
# go run ./tools/build	
	go build -o ./bin/main ./cmd/habbo

generate:
	go tool sqlc generate

generate-presets:
	go run ./tools/generate/presets

.PHONY: dev client cms build generate generate-presets
