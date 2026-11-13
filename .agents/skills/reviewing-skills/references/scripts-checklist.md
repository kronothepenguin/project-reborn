# Scripts checklist

Bundled scripts, one-off commands and inline shell injection.

## Contents

- Design
- Interface for agents
- Errors and constants
- Dependencies and environment
- Running from SKILL.md
- Safety

## Design

- [ ] Logic the agent rewrites on every run is a tested script in `scripts/`.
- [ ] Deterministic checks are scripts, in place of code the agent generates.
- [ ] Each script has one purpose and a filename that says it.
- [ ] A command that is hard to get right the first time becomes a script.

## Interface for agents

- [ ] Input comes from flags, arguments or stdin; the script runs without interactive prompts.
- [ ] `--help` gives a short description, the flags and an example.
- [ ] Data goes to stdout in a structured form (JSON, CSV, `file:line`); diagnostics go to stderr.
- [ ] Output size stays predictable: a summary by default, with flags such as `--offset` or `--output` for more.
- [ ] Exit codes are distinct per failure kind and documented.
- [ ] Repeated runs are safe: "create if missing" over "create and fail".
- [ ] Destructive or stateful scripts offer `--dry-run` and ask for an explicit flag such as `--confirm`.

## Errors and constants

- [ ] Scripts handle missing files, permissions and bad input themselves, with a fallback or a clear message.
- [ ] Error messages say what went wrong, what was expected and the valid choices.
- [ ] Every constant (timeout, retry count, limit) carries a short comment with its reason.
- [ ] Validators are verbose and specific, so the agent can fix and re-run.

## Dependencies and environment

- [ ] Dependencies are listed in `SKILL.md`, the script header or inline metadata (PEP 723 for Python).
- [ ] One-off commands pin versions (`npx eslint@9.0.0`, `uvx ruff@0.8.0`).
- [ ] Runtime needs (language version, network, system packages) appear in `SKILL.md` or `compatibility`.
- [ ] Packages match the target runtime: the Claude API has no network and no installs; claude.ai varies.
- [ ] In Claude Code, packages install locally to the project, leaving the user's machine as it was.

## Running from SKILL.md

- [ ] `SKILL.md` lists each script and says whether to run it or read it as reference.
- [ ] Run instructions give the exact command, with paths relative to the skill root or `${CLAUDE_SKILL_DIR}`.
- [ ] Inline injection (`` !`cmd` ``) uses commands that succeed, or ends them with `|| true`; a failing one aborts
      the skill.
- [ ] Critical operations end with a verification step.

## Safety

- [ ] Every file is audited: scripts, images and resources match the skill's stated purpose.
- [ ] Network calls and file access go only where the purpose needs them.
- [ ] Content fetched from external URLs is treated as data; the skill names the trusted sources.
- [ ] Sensitive data stays on the machine; the skill sends it nowhere outside its purpose.
