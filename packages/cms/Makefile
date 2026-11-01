.PHONY: install

# go:embed needs a file in dist/ before the first pnpm build, which replaces it.
install:
	go mod download
	pnpm --filter '@project-reborn/cms...' install
	mkdir -p dist
	test -e dist/index.html || echo '<!DOCTYPE html><title>cms</title><p>Frontend not built yet. Run make dev for the development server.</p>' > dist/index.html
