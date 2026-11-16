.PHONY: install dev build tools create dependants tw-color e2e frontends release

VERSION ?= dev

install:
	go work sync
	pnpm install
	@for project in apps/*/ packages/store/; do $(MAKE) -C "$$project" install || exit 1; done
	$(MAKE) tools

# The whole hotel in one process, with live reload of every page and of the Go
# code.
dev:
	$(MAKE) -C apps/reborn dev

build:
	go build -o ./bin/reborn ./apps/reborn/cmd/reborn

# The three frontends, which the Go programs embed.
frontends:
	pnpm --filter @project-reborn/cms build
	pnpm --filter @project-reborn/installer build
	pnpm --filter @project-reborn/housekeeping build

include make/check-all.mk

# Builds everything, and runs the browser suites on a throwaway hotel.
e2e:
	$(MAKE) -C tests/e2e test

# Archives of the three programs for linux amd64 and aarch64, in release/. The
# database driver is pure Go, so cgo stays off and the binaries are static.
release: frontends
	rm -rf release
	@for target in amd64:amd64 arm64:aarch64; do \
		goarch=$${target%%:*}; \
		name=reborn-$(VERSION)-linux-$${target##*:}; \
		mkdir -p release/$$name; \
		for program in cms housekeeping installer; do \
			CGO_ENABLED=0 GOOS=linux GOARCH=$$goarch go build -trimpath -ldflags='-s -w' \
				-o release/$$name/$$program ./apps/$$program/cmd/$$program || exit 1; \
		done; \
		tar -C release -czf release/$$name.tar.gz $$name; \
		rm -rf release/$$name; \
	done
	cd release && sha256sum *.tar.gz > SHA256SUMS

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
	./tools/create/bin/create $(if $(template),-template=$(template)) $(if $(dry-run),-dry-run) $(if $(app-port),-app-port=$(app-port)) $(if $(astro-port),-astro-port=$(astro-port)) $(name)

# The projects that use $(project), directly or through another project.
dependants: tools
	@./tools/checks/bin/dependants $(project)

tw-color:
	node tools/tw-color/tw-color.mjs
