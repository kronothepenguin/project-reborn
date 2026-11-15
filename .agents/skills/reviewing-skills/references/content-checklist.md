# Content checklist

The instructions: scope, context economy, control and patterns.

## Contents

- Scope
- Context economy
- Control
- Patterns
- Wording

## Scope

- [ ] The skill covers one coherent unit of work, like a well-scoped function.
- [ ] One task loads one skill; a task that needs several skills at once points to a scope that is too narrow.
- [ ] Activation is precise; a skill that spans unrelated jobs splits into one skill per job.
- [ ] Neighbouring skills meet at clear boundaries, each owning its own rules.

## Context economy

- [ ] Each paragraph passes the test "would the agent get this wrong without it?".
- [ ] The skill adds what the agent lacks: conventions, domain procedures, edge cases, the exact tools to use.
- [ ] General knowledge (what a PDF is, how HTTP works) is cut.
- [ ] Concise steps with one working example replace exhaustive documentation.
- [ ] Rare edge cases are left to the agent's judgment.

## Control

- [ ] Specificity matches fragility, section by section.
- [ ] Open tasks with several valid approaches get a goal and a short checklist.
- [ ] Fragile or ordered operations get the exact command: "Run exactly this".
- [ ] One default approach, with an alternative only behind a clear trigger ("For scanned PDFs, use …").
- [ ] Procedures teach a method for a class of problems; output formats and tool details stay exact.

## Patterns

Use the patterns the task calls for.

- [ ] Gotchas: environment facts that defy reasonable assumptions, kept in `SKILL.md` where the agent reads them first.
- [ ] Gotchas grow from real corrections; generic advice ("handle errors well") is cut.
- [ ] Output templates where the shape matters: short ones inline, long ones in `assets/`.
- [ ] Strict templates say "ALWAYS use this structure"; flexible ones invite adapting.
- [ ] Input/output example pairs where style matters.
- [ ] Multi-step workflows give a copyable checklist with ordered steps.
- [ ] Quality-critical work runs a loop: do, validate, fix, repeat until it passes.
- [ ] Batch or destructive work runs plan → validate the plan against a source of truth → execute.
- [ ] Decision points branch explicitly (creating vs editing), and long branches sit in references.

## Wording

- [ ] One term per concept throughout.
- [ ] Statements stay true over time; dated notes sit in an "Old patterns" `<details>` block.
- [ ] Every instruction is concrete and applies to the task.
- [ ] MCP tools use full names: `ServerName:tool_name`.
