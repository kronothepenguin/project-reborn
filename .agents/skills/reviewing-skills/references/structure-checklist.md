# Structure checklist

Frontmatter, naming, description and layout. Run the validator first and report its findings once.

## Contents

- Frontmatter
- Name
- Description
- SKILL.md body
- Progressive disclosure
- Bundle and paths

## Frontmatter

- [ ] `SKILL.md` starts with YAML frontmatter on its first line, and the YAML parses.
- [ ] Spec fields: `name` and `description` (required), `license`, `compatibility` (up to 500 chars), `metadata` (a
      map of strings), `allowed-tools` (experimental).
- [ ] Claude Code fields (`when_to_use`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `context`,
      `agent`, `paths` and the rest) appear only in skills used by Claude Code. Uploads to claude.ai or the API accept
      the spec fields only.
- [ ] `compatibility` appears only for real environment needs: product, system packages, network.

## Name

- [ ] 1–64 characters: lowercase letters, numbers and single hyphens, with a letter or number at each end.
- [ ] Equals the directory name.
- [ ] Free of XML tags and of the reserved words `anthropic` and `claude`.
- [ ] Gerund form (`processing-pdfs`) or another clear pattern (`pdf-processing`, `process-pdfs`), the same pattern
      across the collection.
- [ ] Specific: a named activity, in place of `helper`, `utils`, `tools`, `documents`, `data` or `files`.

## Description

- [ ] 1–1,024 characters, free of XML tags; angle brackets become square brackets.
- [ ] Third person, saying what the skill does and when to use it ("Use when …").
- [ ] Describes the user's intent and the contexts where the skill applies, including requests that skip its keywords.
- [ ] Holds the key terms a user says: file types, tools, domain words.
- [ ] Leads with the key use case; Claude Code cuts `description` plus `when_to_use` at 1,536 characters.
- [ ] Narrow enough to stay quiet on near-miss requests that share its keywords.

## SKILL.md body

- [ ] Under 500 lines and about 5,000 tokens.
- [ ] Reads as an overview with steps, pointing to references for detail.
- [ ] The most important instructions sit near the top; after compaction Claude Code keeps the first 5,000 tokens.
- [ ] Instructions hold for the whole task: Claude Code loads the body once and keeps it, without re-reading.
- [ ] A rule that has to hold on every action lives in a hook, in the skill's `hooks` frontmatter.

## Progressive disclosure

- [ ] Detail that only some tasks need lives in `references/`, templates in `assets/`.
- [ ] `SKILL.md` links every reference directly, one level deep, and says when to read each one.
- [ ] References link only to outside sources, each standing on its own.
- [ ] References over 100 lines open with a table of contents.
- [ ] Filenames name their content (`form-validation-rules.md`); folders split by domain when there are several.
- [ ] Large resources (full API docs, datasets) are bundled whole; they cost nothing until read.

## Bundle and paths

- [ ] Paths use forward slashes and are relative to the skill root.
- [ ] Every relative link resolves inside the skill directory.
- [ ] Scripts sit in `scripts/`, references in `references/`, static files in `assets/`, evals in `evals/`.
- [ ] The bundle stays free of machine-specific paths, credentials and secrets.
