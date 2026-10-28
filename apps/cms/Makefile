.PHONY: dev web stop

# air runs from the repository root, so the runner reads the root config.json.
dev:
	@trap 'kill 0' 0 2 15; \
	(cd ../.. && go tool air -c apps/cms/.air.toml) & \
	(cd ../../packages/cms && pnpm dev) & \
	wait
