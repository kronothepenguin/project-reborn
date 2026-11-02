.PHONY: install tools create tw-color gates e2e frontends release

VERSION ?= dev

install:
	go work sync
	pnpm install
	@for project in apps/*/ packages/store/; do $(MAKE) -C "$$project" install || exit 1; done
	$(MAKE) tools

# apps/reborn is the orchestrator: one binary running the installer, cms,
# housekeeping and server. Its old implementation was removed and the new one is
# not planned yet, so these targets wait for it.
#
# dev:
# 	cd apps/reborn && go tool air
#
# build:
# 	mkdir -p ./bin
# 	go build -o ./bin/main ./apps/reborn/cmd

# The three frontends, which the Go programs embed.
frontends:
	pnpm --filter @project-reborn/cms build
	pnpm --filter @project-reborn/installer build
	pnpm --filter @project-reborn/housekeeping build

# Every gate but the browser suites: what CI runs on each push.
gates: frontends
	@for dir in $$(go list -m -f '{{.Dir}}'); do \
		echo "== $$dir"; \
		( cd "$$dir" && \
			out=$$(gofmt -l $$(git ls-files '*.go')) && \
			{ [ -z "$$out" ] || { echo "not formatted: $$out"; exit 1; }; } && \
			go vet ./... && go test ./... -race ) || exit 1; \
	done
	pnpm --filter @project-reborn/components test
	pnpm --filter @project-reborn/components check
	cd packages/store && go tool sqlc generate && \
		git diff --exit-code -- db.go models.go '*.query.sql.go' && \
		$(MAKE) check-docs

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
	./tools/create/bin/create $(if $(dry-run),-dry-run) $(if $(app-port),-app-port=$(app-port)) $(if $(astro-port),-astro-port=$(astro-port)) $(name)

tw-color:
	node tools/tw-color/tw-color.mjs
