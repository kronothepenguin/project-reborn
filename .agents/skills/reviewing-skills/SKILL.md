---
name: reviewing-skills
description: Reviews Agent Skills against the Agent Skills specification, the Claude authoring best practices and the user's own rules for skills (small, affirmative, rules over repo facts). Use when creating, auditing or improving a SKILL.md or its bundled references, scripts or assets, or when a skill fails to trigger or to be followed.
---

# Reviewing Skills

Audit one skill bundle: `SKILL.md` plus `references/`, `scripts/`, `assets/` and `evals/`. Report findings. Edit the
skill only when the user asks for fixes.

## Workflow

Copy this checklist and tick each step:

```
Skill review:
- [ ] 1. Read SKILL.md and list every file of the bundle
- [ ] 2. Run the validator
- [ ] 3. Read the checklists that apply
- [ ] 4. Write the findings
- [ ] 5. Re-check each finding against its checklist
```

1. Read `SKILL.md` and list every file in the skill directory and in its sibling skills.
2. Run the validator from this skill's directory (Python 3, standard library):

   ```sh
   python3 -I scripts/validate_skill.py <skill-directory>
   ```

   It reports errors and warnings with `file:line`, then a count of prohibition sentences and hard-coded repo paths.
   Add `--strict` to fail on warnings.
3. Read the checklists that match the bundle:

| The bundle holds | Read |
| --- | --- |
| Any skill | [references/structure-checklist.md](references/structure-checklist.md) |
| Any skill | [references/user-rules-checklist.md](references/user-rules-checklist.md) |
| Instructions, workflows, examples or templates | [references/content-checklist.md](references/content-checklist.md) |
| `scripts/`, inline commands or any code | [references/scripts-checklist.md](references/scripts-checklist.md) |
| A skill being created or changed, or `evals/` | [references/process-checklist.md](references/process-checklist.md) |

4. Write the findings, most severe first. ALWAYS use this structure:

```markdown
## Findings

- `SKILL.md:12` — **error** — description in first person — rewrite in third person: "Extracts … Use when …".
- `SKILL.md:30` — **warning** — affirmative sentences — "Never edit X" → "Edit only Y".
```

   Severity: **error** breaks the specification or makes the skill fail to load; **warning** covers every other rule.
5. Re-check each finding against the checklist item it names. Report each problem once.

## Gotchas

- The validator decides the mechanics; the checklists hold the judgment. Each finding comes from one of them.
- The validator reads prose only: it skips code spans, code blocks and blockquotes. Read each hit in context.
- A long `SKILL.md` is a finding only when part of it belongs in a reference.
- Flag a missing pattern (scripts, gotchas, templates, evals) only when the skill's task calls for it.
- Scope: this review judges authoring and structure. Domain correctness belongs to a domain review skill.

## Sources

The URLs these checklists come from: [references/sources.md](references/sources.md).
