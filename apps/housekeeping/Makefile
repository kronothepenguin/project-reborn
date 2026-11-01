.PHONY: install dev web stop

install:
	$(MAKE) -C ../../packages/housekeeping install
	mkdir -p tmp

# air runs from the repository root, so the runner reads the root config.json.
dev:
	cd ../../packages/housekeeping && pnpm astro dev --background
	cd ../.. && go tool air -c apps/housekeeping/.air.toml

web:
	pnpm --filter @project-reborn/housekeeping dev

stop:
	cd ../../packages/housekeeping && pnpm astro dev stop
