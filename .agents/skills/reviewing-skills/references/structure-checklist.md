# Structure checklist

Sources: agentskills.io best practices; Claude platform agent-skills best practices.

Items the validator (`scripts/validate_skill.py`) cannot decide mechanically. Run the validator first; do not duplicate its errors here.

## Contents

- Frontmatter
- Name
- Description
- SKILL.md body
- Progressive disclosure
- Bundle and paths

## Frontmatter

- [ ] `SKILL.md` starts with YAML frontmatter.
- [ ] Only documented fields are used (`name`, `description`); no app-specific metadata is required by the runtime.
- [ ] Frontmatter parses cleanly; no tabs, unquoted colons, or broken block scalars.

## Name

- [ ] At most 64 characters, lowercase letters, numbers, and hyphens only.
- [ ] Contains no XML tags.
- [ ] Contains no reserved words (`anthropic`, `claude`).
- [ ] Matches the skill directory name.
- [ ] Uses the gerund form (`processing-pdfs`) or another recognized pattern (`pdf-processing`, `process-pdfs`).
- [ ] Is specific: no `helper`, `utils`, `tools`.
- [ ] Is not overly generic: no `documents`, `data`, `files`.
- [ ] Follows the same naming pattern as the rest of the collection.

## Description

- [ ] Non-empty and at most 1,024 characters.
- [ ] Contains no XML tags.
- [ ] Written in third person, not "I can" or "You can".
- [ ] States what the skill does.
- [ ] States when to use it, with concrete triggers and contexts.
- [ ] Includes the key terms a user or agent would say (`PDF`, `forms`, `spreadsheets`, file extensions).
- [ ] Is specific; avoids "Helps with documents" and "Processes data".

## SKILL.md body

- [ ] Body is under 500 lines.
- [ ] Body stays within a reasonable token budget (roughly 5,000 tokens).
- [ ] Body reads as an overview and table of contents, not as exhaustive documentation.
- [ ] Content that only matters for some tasks is not inlined.

## Progressive disclosure

- [ ] Detailed material lives in separate files (`references/`, `FORMS.md`, `EXAMPLES.md`).
- [ ] Every reference is linked directly from `SKILL.md` (one level deep).
- [ ] No reference links to another reference.
- [ ] `SKILL.md` says when to read each reference, not just "see references/".
- [ ] Reference files longer than 100 lines have a table of contents.
- [ ] Reference filenames describe their content (`form_validation_rules.md`, not `doc2.md`).
- [ ] Files are organized by domain when multiple domains exist.
- [ ] Advanced or optional details are separated from basic usage.
- [ ] Comprehensive resources (complete API docs, large datasets) are bundled rather than summarized away; they cost no context until read.
- [ ] Nested references are avoided; agents may read partial files when chasing chains.

## Bundle and paths

- [ ] All paths use forward slashes.
- [ ] Every relative link resolves to an existing file.
- [ ] No link escapes the skill directory.
- [ ] Scripts live in `scripts/`, reference material in `references/`, and static assets in `assets/` unless the collection uses another convention.
- [ ] File references from instructions are relative, not absolute.
- [ ] No machine-specific paths, credentials, or environment secrets are embedded.
