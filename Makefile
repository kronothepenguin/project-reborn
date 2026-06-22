install:
	go work sync
	pnpm install

dev:
	cd apps/reborn && go tool air

build:
	mkdir -p ./bin
	go build -o ./bin/main ./apps/reborn/cmd

.PHONY: dev build
