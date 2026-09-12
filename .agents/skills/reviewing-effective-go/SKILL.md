---
name: reviewing-effective-go
description: Reviews Go code against Effective Go (formatting, names, control flow, functions, data, methods, interfaces, embedding, concurrency, errors) and reports concrete violations with file:line. Use when writing or reviewing Go code, or when the user asks for an Effective Go review.
---

# Reviewing Effective Go

Review Go code against the [Effective Go](https://go.dev/doc/effective_go) checklist and report violations with exact `file:line` references. Do not rewrite files during a review unless the user asks for fixes.

## Scope boundary: use-modern-go

Effective Go governs design and style that does not change with Go versions. For idioms that are newer than Effective Go (generics, `any`, `slices`/`maps` helpers, `errors.Is`/`errors.As`/`errors.AsType`, `min`/`max`, `strings.Cut`, `range` over int, ...) the `use-modern-go` skill is authoritative.

Do not flag modern idioms just because an old Effective Go example predates them:

- `any` where the page shows `interface{}`.
- `slices.SortFunc`/`slices.Contains` where the page writes manual loops.
- `errors.Is(err, io.EOF)` where the page compares with `==`.
- `for range n` instead of `for i := 0; i < n; i++`.

## Workflow

Copy this checklist and check items off as you go:

```
Effective Go review:
- [ ] 1. Read references/checklist.md
- [ ] 2. Read the code under review
- [ ] 3. Apply only the sections that match the code
- [ ] 4. Report findings as file:line — rule — concrete fix
- [ ] 5. Re-check every claimed rule against the checklist before reporting
```

1. Read [references/checklist.md](references/checklist.md). It follows the guide's section order; apply the sections that match the code.
2. Read the target files. If none are given, ask which package to review.
3. Report findings in this shape, most severe first:

```markdown
## Findings

- `path/file.go:42` — **Getters** ([#Getters](https://go.dev/doc/effective_go#Getters)) — `GetOwner` breaks the getter convention; rename it to `Owner`.
```

If nothing violates the checklist, say so explicitly and list the sections checked.

## Gotchas

- Report only what the checklist supports. This skill is a checklist, not general Go advice.
- The most common false positive is method sets: a value of type `T` cannot use methods declared on `*T` to satisfy an interface. Check the receiver before reporting.
- A missing doc comment on an exported identifier is a valid finding; unexported code does not need one.
- Do not report a rule twice when two sections cover it (for example embedded structs appear in both interfaces and embedding). Cite the most specific anchor once.
