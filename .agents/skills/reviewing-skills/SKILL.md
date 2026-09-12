---
name: reviewing-skills
description: Reviews Agent Skills against authoring best practices for frontmatter, naming, descriptions, scope, progressive disclosure, instruction design, scripts, and evaluation. Use when creating, auditing, or improving a SKILL.md or its bundled references, scripts, or assets.
---

# Reviewing Skills

Audit a skill bundle (`SKILL.md` plus `references/`, `scripts/`, `assets/`) against the authoring best practices from agentskills.io and the Claude platform. Report concrete findings; do not rewrite the skill unless the user asks for fixes.

## Workflow

Copy this checklist and check items off as you go:

```
Skill review:
- [ ] 1. Read SKILL.md and list the bundle files
- [ ] 2. Run the structural validator
- [ ] 3. Load the checklists that apply
- [ ] 4. Report findings: file:line — severity — rule — concrete fix
- [ ] 5. Re-check every finding against the loaded checklists
```

1. Read the skill's `SKILL.md` and list every file in its directory.
2. Run the bundled structural validator (Python 3 standard library only):

   ```sh
   python3 scripts/validate_skill.py <skill-directory>
   ```

   It reports errors for frontmatter, name, description, links, and size, plus warnings. Use `--strict` to fail on warnings.
3. Load the checklists that match the bundle:

| The bundle contains | Read |
| --- | --- |
| Always | [references/structure-checklist.md](references/structure-checklist.md) |
| Instructions, workflows, examples, or templates | [references/content-checklist.md](references/content-checklist.md) |
| `scripts/` or any executable code | [references/scripts-checklist.md](references/scripts-checklist.md) |
| A skill being created or changed | [references/process-checklist.md](references/process-checklist.md) |

4. Report findings most severe first:

```markdown
## Findings

- `SKILL.md:12` — **error** — description is first person; rewrite in third person with what it does and when to use it.
- `references/api.md:140` — **warning** — reference exceeds 100 lines without a table of contents.
```

5. Re-check each finding against the loaded checklist before reporting it.

## Scope boundary

This skill reviews authoring quality and structure. It does not judge whether the subject-matter guidance inside the skill is correct; use a domain-specific review skill for that.

## Gotchas

- The validator covers mechanics; the checklists cover judgment. Do not report a finding twice.
- Length alone is not a defect. A long `SKILL.md` matters only when content belongs in a reference.
- Not every skill needs scripts, gotchas, templates, or evaluations. Flag a missing pattern only when the skill's content calls for it.
- The right detail level depends on the target models; a small model may need more guidance than a large one.
