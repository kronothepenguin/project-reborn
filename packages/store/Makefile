.PHONY: install generate check-generated check-docs

install:
	go mod download

generate:
	go tool sqlc generate

check: check-generated check-docs

check-generated: generate
	git diff --exit-code -- db.go models.go '*.query.sql.go'

check-docs:
	@status=0; \
	tables=$$(sed -nE 's/^CREATE TABLE (IF NOT EXISTS )?([a-z_]+).*/\2/p' schema/*.schema.sql); \
	listed=$$(sed -nE 's/^\| ([a-z_]+) \|.*/\1/p' knowledge/tables.md); \
	for t in $$tables; do \
		echo "$$listed" | grep -qx "$$t" || { echo "missing from knowledge/tables.md: $$t"; status=1; }; \
	done; \
	for t in $$listed; do \
		echo "$$tables" | grep -qx "$$t" || { echo "not in schema/*.schema.sql: $$t"; status=1; }; \
	done; \
	exit $$status

include ../../make/check.mk
