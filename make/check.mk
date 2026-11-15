# The shared check of a project. A project's Makefile includes this file and
# gets `check`: the Go steps when its folder has a go.mod, the build, check and
# test scripts when it has a package.json. A project adds its own steps as
# prerequisites of `check`; they run first, one after another, before the
# shared steps.

CHECK_MK := $(abspath $(lastword $(MAKEFILE_LIST)))

# Including this file must not make `check` the default goal of the project:
# an empty .DEFAULT_GOAL hands the choice back to the next target parsed.
check_default_goal := $(.DEFAULT_GOAL)

check_go := $(if $(wildcard go.mod),check-gofmt check-vet check-gotest check-gobuild)
check_scripts := $(if $(wildcard package.json),check-script-build check-script-check check-script-test)

.PHONY: check check-steps check-gofmt check-vet check-gotest check-gobuild \
	check-script-build check-script-check check-script-test

# The shared steps run in a second make, with -j only there, so the project's
# own targets keep running one at a time. --output-sync keeps the lines of one
# step together.
check:
	@$(MAKE) --no-print-directory -f $(CHECK_MK) -j --output-sync=target check-steps

check-steps: $(check_go) $(check_scripts)

check-gofmt:
	@files=$$(git ls-files '*.go'); \
	[ -z "$$files" ] || { \
		out=$$(gofmt -l $$files) || exit 1; \
		[ -z "$$out" ] || { echo "not formatted:"; echo "$$out"; exit 1; }; \
	}

# A Go package embeds what its frontend builds, so every Go step that loads
# the packages waits for the build script.
check-vet: $(if $(check_scripts),check-script-build)
	go vet ./...

check-gotest: $(if $(check_scripts),check-script-build)
	go test ./... -race

check-gobuild: $(if $(check_scripts),check-script-build)
	go build -o /dev/null ./...

check-script-build check-script-check check-script-test: check-script-%:
	pnpm run --if-present $*

.DEFAULT_GOAL := $(check_default_goal)
