install:
	go mod tidy

dev:
	go tool air

client:
	go run ./tools/dev/client

cms:
	go tool air -c .air.cms.toml

figurepreview:
	go run ./tools/dev/figurepreview

build:
	mkdir -p ./bin
# go run ./tools/build	
	go build -o ./bin/main ./cmd/habbo

sqlc:
	go tool sqlc generate

presets:
	go run ./tools/presets

.PHONY: dev client cms figurepreview build sqlc presets
