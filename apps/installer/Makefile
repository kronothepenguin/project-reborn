.PHONY: dev web stop

dev:
	cd ../../packages/installer && pnpm astro dev --background
	go tool air

web:
	pnpm --filter @project-reborn/installer dev

stop:
	cd ../../packages/installer && pnpm astro dev stop