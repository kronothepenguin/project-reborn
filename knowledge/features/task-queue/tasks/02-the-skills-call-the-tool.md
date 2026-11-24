---
type: Task
title: The skills and the workflow call the tasks command
description: The working-tasks and planning-features skills, the workflow and the checks' playbook name the tasks command for each step it carries out.
scope: [.agents/skills, knowledge]
depends_on: [01-the-tasks-command]
skills: [reviewing-skills, documenting-with-okf]
---

# Goal

An agent follows the delivery with one command per step.

# Context

- [Plan](/features/task-queue/plan.md) and the tool's README.
- `.agents/skills/working-tasks/SKILL.md`, `.agents/skills/planning-features/SKILL.md`, `knowledge/workflow.md`,
  `knowledge/checks.md`.

# Steps

- [ ] `working-tasks`: start, note, ready and deliver through the tool; the git commands stay as what the tool runs.
- [ ] `planning-features`: status, turn and merge through the tool; a new session starts by asking the status.
- [ ] The workflow and the checks' playbook name the tool.
- [ ] A slave's brief shrinks: what the tool does is left out of it.

# Checks

```sh
python3 -I .agents/skills/documenting-with-okf/scripts/check.py
```
