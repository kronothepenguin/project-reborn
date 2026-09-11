.PHONY: install dev build tools create

install:
	go work sync
	pnpm install
	$(MAKE) tools

dev:
	cd apps/reborn && go tool air

build:
	mkdir -p ./bin
	go build -o ./bin/main ./apps/reborn/cmd

tools:
	@for d in tools/*; do \
		if [ -f "$$d/go.mod" ]; then \
			mkdir -p "$$d/bin"; \
			for c in "$$d"/cmd/*; do \
				[ -d "$$c" ] || continue; \
				( cd "$$d" && go build -o "bin/$$(basename $$c)" "./cmd/$$(basename $$c)" ) || exit 1; \
			done; \
		fi; \
	done

create: tools
	./tools/create/bin/create $(if $(dry-run),-dry-run) $(if $(app-port),-app-port=$(app-port)) $(if $(astro-port),-astro-port=$(astro-port)) $(name)

cms-dev:
	pnpm --filter @project-reborn/cms dev
	cd apps/cms
	go tool air