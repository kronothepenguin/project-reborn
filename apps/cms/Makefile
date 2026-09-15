.PHONY: dev

dev:
	@trap 'kill 0' 0 2 15; \
	go tool air & \
	(cd ../../packages/cms && pnpm dev) & \
	wait
