# Scripts checklist

Sources: agentskills.io best practices; Claude platform agent-skills best practices.

Apply when the bundle contains `scripts/` or executable code in any language.

## Contents

- Design
- Error handling
- Constants
- Dependencies
- Execution intent
- Verification
- MCP tools

## Design

- [ ] Logic the agent would otherwise reinvent each run is bundled as a script.
- [ ] Deterministic operations are scripts rather than generated code.
- [ ] Scripts solve problems instead of deferring failures to the agent.
- [ ] Each script has one clear purpose with a descriptive filename.
- [ ] Scripts are tested before shipping.
- [ ] Scripts are more reliable than asking the agent to regenerate the same logic.

## Error handling

- [ ] Missing files are handled with an explicit fallback or message.
- [ ] Permission errors produce an alternative instead of a stack trace.
- [ ] Invalid input produces a specific, actionable error.
- [ ] Error messages name the problem and the available choices.
- [ ] Scripts do not fail bare and leave the agent to figure out why.

## Constants

- [ ] Timeouts and retries are justified in comments.
- [ ] No magic numbers without explanation.
- [ ] Configuration values are documented so the agent knows the right value.

## Dependencies

- [ ] Required packages are listed in `SKILL.md` or the script header.
- [ ] Packages are verified available in the target execution environment.
- [ ] Network requirements match the runtime (no network for API runtimes).
- [ ] Installation commands are given explicitly when needed.
- [ ] No package is assumed to be installed because it is well known.

## Execution intent

- [ ] `SKILL.md` states whether to execute a script or read it as reference.
- [ ] Executable scripts are invoked with exact commands and arguments.
- [ ] Reference-only scripts are described as reference material.
- [ ] Script output contains enough information for the agent to act on.
- [ ] Script paths use forward slashes.

## Verification

- [ ] Critical operations have a verification step.
- [ ] Validation scripts give verbose, specific messages.
- [ ] Plans or intermediate artifacts are validated before execution.
- [ ] Validation fails clearly so the agent can self-correct.
- [ ] File access patterns are tested with real requests.
- [ ] Inputs that can be rendered as images are analyzed visually where helpful.

## MCP tools

- [ ] MCP tools use fully qualified `ServerName:tool_name` references.
- [ ] Tool availability is not assumed without checking.
- [ ] Missing MCP tools produce a clear message instead of a tool-not-found error.
