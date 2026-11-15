# The check of the whole repository, which the root Makefile includes: `make
# check` in every project of apps/, packages/ and tools/, then the knowledge
# check. The browser suites of tests/ run apart, with `make e2e`.

check_all_projects := $(sort $(patsubst %/Makefile,%,$(wildcard apps/*/Makefile packages/*/Makefile tools/*/Makefile)))

.PHONY: check

# One project after another: the server's tests have short deadlines, and a
# loaded machine fails them.
check:
	@for project in $(check_all_projects); do \
		echo "== $$project"; \
		$(MAKE) --no-print-directory -C "$$project" check || { echo "make check failed in $$project"; exit 1; }; \
	done
	@echo "== knowledge"
	python3 -I .agents/skills/documenting-with-okf/scripts/check.py
