.PHONY: install

# go:embed needs a file in dist/ before the first pnpm build, which replaces it.
install:
	go mod download
	pnpm --filter '@project-reborn/installer...' install
	mkdir -p dist
	test -e dist/index.html || echo '<!DOCTYPE html><title>installer</title><p>Frontend not built yet. Run make dev for the development server.</p>' > dist/index.html
