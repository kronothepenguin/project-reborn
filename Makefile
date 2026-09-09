.PHONY: dev build

install:
	go work sync
	pnpm install

dev:
	cd apps/reborn && go tool air

build:
	mkdir -p ./bin
	go build -o ./bin/main ./apps/reborn/cmd


cms-dev:
	pnpm --filter @project-reborn/cms dev
	cd apps/cms
	go tool air
