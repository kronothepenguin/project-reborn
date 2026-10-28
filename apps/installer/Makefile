.PHONY: dev web stop

# air runs from the repository root, so the runner reads the root config.json.
dev:
	cd ../../packages/installer && pnpm astro dev --background
	cd ../.. && go tool air -c apps/installer/.air.toml

web:
	pnpm --filter @project-reborn/installer dev

stop:
	cd ../../packages/installer && pnpm astro dev stop