# Content checklist

Sources: agentskills.io best practices; Claude platform agent-skills best practices.

Review the instructions as a product: scope, context economy, control calibration, and reusable patterns.

## Contents

- Scope and composition
- Context economy
- Specificity and control
- Instruction patterns
- Content rules

## Scope and composition

- [ ] The skill encapsulates one coherent unit of work.
- [ ] The unit composes well with other skills instead of overlapping them.
- [ ] The skill is not so narrow that several skills must load for one task.
- [ ] The skill is not so broad that activation is imprecise.
- [ ] Unrelated responsibilities are split into separate skills.
- [ ] A unit that queries and formats data does not also cover administration.

## Context economy

- [ ] The skill adds what the agent lacks and omits what it knows.
- [ ] Each paragraph answers "would the agent get this wrong without this instruction?".
- [ ] Project-specific conventions, domain procedures, and non-obvious edge cases are included.
- [ ] General background (what a PDF is, how HTTP works) is cut.
- [ ] Guidance is stepwise with a working example rather than exhaustive documentation.
- [ ] Most edge cases are left to the agent's judgment.
- [ ] Every edge case is not documented "just in case".

## Specificity and control

- [ ] Flexible instructions are used where multiple approaches are valid.
- [ ] Flexible instructions explain why, so the agent can adapt.
- [ ] Fragile operations are prescriptive and exact.
- [ ] Sequences that must run in order are given exactly, without optional flags.
- [ ] Specificity is calibrated per section, not applied uniformly.
- [ ] A default approach is provided instead of a menu of equal options.
- [ ] Alternatives appear only as escape hatches with clear triggers.
- [ ] Procedures generalize to a class of problems instead of one instance.
- [ ] Output-format templates, constraints, and tool-specific details stay specific.

## Instruction patterns

- [ ] A gotchas section captures environment-specific facts that defy assumptions.
- [ ] Gotchas are not generic advice ("handle errors appropriately").
- [ ] Gotchas stay where the agent reads them before the situation occurs.
- [ ] Output-format templates are provided where the output shape matters.
- [ ] Strict templates use "ALWAYS use this exact structure".
- [ ] Flexible templates invite adaptation for the specific case.
- [ ] Multi-step workflows provide a copyable checklist.
- [ ] Workflows have clear, ordered steps and validation gates.
- [ ] Quality-critical tasks have a validator → fix → repeat loop.
- [ ] Batch or destructive operations use plan → validate → execute with an intermediate artifact.
- [ ] Plan validation checks the plan against a source of truth.
- [ ] Examples use input/output pairs where output style matters.
- [ ] Conditional workflows branch explicitly for creation vs editing.
- [ ] Large workflows are pushed to reference files with clear load triggers.

## Content rules

- [ ] Terminology is consistent throughout (one term per concept).
- [ ] No time-sensitive statements remain in the main instructions.
- [ ] Outdated patterns are moved to a details/summary "old patterns" section.
- [ ] File references are correct and relative.
- [ ] Instructions are concrete and apply to the task, not filler.
- [ ] The skill avoids presenting more choices than the agent can reasonably act on.
