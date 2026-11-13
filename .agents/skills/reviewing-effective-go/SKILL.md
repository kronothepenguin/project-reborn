---
name: reviewing-effective-go
description: Reviews Go code against Effective Go (formatting, names, control flow, functions, data, methods, interfaces, embedding, concurrency, errors) and reports concrete violations with file:line. Use when writing or reviewing Go code, or when the user asks for an Effective Go review.
---

# Reviewing Effective Go

Review Go code against the [Effective Go](https://go.dev/doc/effective_go) checklist and report each departure with its
exact `file:line`. Edit files only when the user asks for fixes.

## Workflow

Copy this checklist and tick each step:

```
Effective Go review:
- [ ] 1. Read references/checklist.md
- [ ] 2. Read the code under review
- [ ] 3. Apply the sections that match the code
- [ ] 4. Report findings as file:line — rule — concrete fix
- [ ] 5. Re-check each finding against its checklist item
```

1. Read [references/checklist.md](references/checklist.md). It follows the guide's order. Each item is what good code
   does; report the code that departs from it.
2. Read the target files. When none are given, ask which package to review.
3. Report the findings most severe first. ALWAYS use this structure:

```markdown
## Findings

- `path/file.go:42` — **Getters** ([#Getters](https://go.dev/doc/effective_go#Getters)) — `GetOwner` breaks the getter convention; rename it to `Owner`.
```

When the code meets the checklist, say so and list the sections checked.

## Gotchas

- Idioms newer than the guide belong to the `use-modern-go` skill. Accept them; the checklist's first section lists
  them.
- Report only what a checklist item states.
- Method sets: a value of type `T` has the methods of `T` only; a `*T` has the methods of `T` and `*T`. Check the
  receiver before reporting an interface finding.
- Report a missing doc comment on exported identifiers only.
- Report each problem once, under its most specific anchor. Embedded structs, for example, appear in Interfaces and in
  Embedding.
