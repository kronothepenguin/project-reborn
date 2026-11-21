.PHONY: install dev build tools create dependants tw-color e2e frontends release player

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

# The frontends the Go programs embed: each site's own, for its own runner, and
# reborn's, which holds the three sites.
frontends:
	pnpm --filter @project-reborn/cms build
	pnpm --filter @project-reborn/installer build
	pnpm --filter @project-reborn/housekeeping build
	pnpm --filter @project-reborn/reborn build

# LibreShockwave's browser player, built with Emscripten from the submodule into
# the CMS's public folder, which git ignores. The client page links to
# source.txt, the commit it was built from. EMSCRIPTEN names the folder of emcc
# when it is not on the PATH.
EMSCRIPTEN ?= /usr/lib/emscripten
PLAYER_SOURCE := vendor/LibreShockwave
PLAYER_BUILD := $(CURDIR)/tmp/libreshockwave
PLAYER_DIR := packages/cms/public/libreshockwave
PLAYER_FILES := libreshockwave-cpp-player.js libreshockwave-cpp-worker.js libreshockwave-cpp-wasm.js libreshockwave-cpp-wasm.wasm

player: export PATH := $(EMSCRIPTEN):$(PATH)
player:
	@test -f $(PLAYER_SOURCE)/build.sh || { echo "make player: $(PLAYER_SOURCE) is empty. Run: git submodule update --init $(PLAYER_SOURCE)"; exit 1; }
	@command -v emcmake >/dev/null && command -v em-config >/dev/null || { echo "make player: Emscripten is missing. Install it, or set EMSCRIPTEN to the folder of emcc."; exit 1; }
	@libs=$$(em-config CACHE)/sysroot/lib/wasm32-emscripten; \
	for lib in libz.a libjpeg.a; do \
		test -f "$$libs/$$lib" || { echo "make player: Emscripten's $$lib is missing. Run: embuilder build zlib libjpeg"; exit 1; }; \
	done
	cd $(PLAYER_SOURCE) && ./build.sh --wasm --release --build-dir $(PLAYER_BUILD) -- -DLIBRESHOCKWAVE_REQUIRE_ZLIB=ON
	mkdir -p $(PLAYER_DIR)
	cd $(PLAYER_BUILD)/cpp/wasm-dist && cp $(PLAYER_FILES) $(CURDIR)/$(PLAYER_DIR)/
	@url=$$(git config -f .gitmodules submodule.$(PLAYER_SOURCE).url); \
	echo "$${url%.git}/tree/$$(git -C $(PLAYER_SOURCE) rev-parse HEAD)" > $(PLAYER_DIR)/source.txt
	@echo "make player: built into $(PLAYER_DIR) from $$(cat $(PLAYER_DIR)/source.txt)"

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
