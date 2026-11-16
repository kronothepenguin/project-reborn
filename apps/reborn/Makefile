.PHONY: install dev stop

include ../../make/check.mk

install:
	$(MAKE) -C ../../packages/cms install
	$(MAKE) -C ../../packages/housekeeping install
	$(MAKE) -C ../../packages/installer install
	$(MAKE) -C ../../packages/server install
	mkdir -p tmp

# air runs from the repository root, so the runner reads the root config.json.
# The dev server of packages/reborn serves every site's pages.
dev:
	@trap 'kill 0' 0 2 15; \
	(cd ../.. && go tool air -c apps/reborn/.air.toml) & \
	(cd ../../packages/reborn && pnpm dev) & \
	wait

# Stops a dev server that Astro started in the background.
stop:
	cd ../../packages/reborn && pnpm astro dev stop
