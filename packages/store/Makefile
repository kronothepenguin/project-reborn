.PHONY: generate check-docs test

generate:
	go tool sqlc generate

check-docs:
	@status=0; \
	for f in $$(find knowledge -name '*.md' ! -name 'index.md' ! -name 'log.md'); do \
		grep -q '^type:' "$$f" || { echo "missing type: $$f"; status=1; }; \
	done; \
	for f in schema/*.schema.sql queries/*.query.sql; do \
		grep -rq "resource:.*$$f" knowledge || { echo "undocumented: $$f"; status=1; }; \
	done; \
	exit $$status

test:
	go vet ./... && go test ./... -race