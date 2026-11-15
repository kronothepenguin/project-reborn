#!/usr/bin/env python3
"""Validate Agent Skill directories against the Agent Skills specification and the authoring rules.

Usage:
    python3 -I scripts/validate_skill.py [--strict] <skill-directory> [<skill-directory> ...]

Exit status is 1 when any error is found. With --strict, warnings also fail.
Uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

MAX_NAME = 64
MAX_DESCRIPTION = 1024
MAX_COMPATIBILITY = 500
# Claude Code truncates description plus when_to_use at this length in its skill listing.
MAX_LISTING_TEXT = 1536
MIN_USEFUL_DESCRIPTION = 40
MAX_SKILL_LINES = 500
MAX_SKILL_TOKENS = 5000
# Rough English average; good enough to flag a body far over the token budget.
CHARS_PER_TOKEN = 4
LONG_REFERENCE_LINES = 100

SPEC_FIELDS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
CLAUDE_CODE_FIELDS = {
    "when_to_use", "argument-hint", "arguments", "disable-model-invocation", "user-invocable",
    "disallowed-tools", "model", "effort", "context", "agent", "background", "hooks", "paths", "shell",
}
REPO_ROOTS = ("apps", "packages", "tools", "tests", "knowledge")

NAME_RE = re.compile(r"^[a-z0-9-]+$")
XML_TAG_RE = re.compile(r"<[^>]+>")
KEY_RE = re.compile(r"^([A-Za-z0-9_-]+):\s*(.*)$")
MD_LINK_RE = re.compile(r"\]\(([^)]+)\)")
TOC_HEADING_RE = re.compile(r"^#{1,3}\s+(contents|table of contents)\b", re.IGNORECASE | re.MULTILINE)
FIRST_PERSON_RE = re.compile(r"(^|\b)(I|we|you)\s+(can|will|should|might|may)\b", re.IGNORECASE)
VAGUE_DESCRIPTION_RE = re.compile(
    r"^\s*(helps? with|processes data|does stuff|handles? (files|documents)|works? with)\b", re.IGNORECASE
)
VAGUE_REFERENCE_RE = re.compile(r"^(doc|file|tmp|untitled|misc)[-_]?\d*\.md$", re.IGNORECASE)
TIME_SENSITIVE_RE = re.compile(
    r"\b(before|after|as of|deprecated in|starting)\s+"
    r"(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b",
    re.IGNORECASE,
)
PROHIBITION_RE = re.compile(r"\b(never|do not|don['’]t|must not|cannot)\b", re.IGNORECASE)
INLINE_CODE_RE = re.compile(r"`[^`]*`")
REPO_PATH_RE = re.compile(r"`(?:\./)?((?:" + "|".join(REPO_ROOTS) + r")/[^`\s]*)`")


class Finding:
    def __init__(self, severity: str, path: Path, line: int, message: str, kind: str = "") -> None:
        self.severity = severity
        self.path = path
        self.line = line
        self.message = message
        self.kind = kind


def parse_frontmatter(lines: list[str]) -> tuple[dict[str, str], dict[str, int], int | None]:
    """Return (top-level fields, field lines, closing-line index)."""
    if not lines or lines[0].strip() != "---":
        return {}, {}, None

    closing = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if closing is None:
        return {}, {}, None

    fields: dict[str, str] = {}
    field_lines: dict[str, int] = {}
    index = 1
    while index < closing:
        match = KEY_RE.match(lines[index])
        if not match:
            index += 1
            continue

        key, value = match.group(1), match.group(2).strip()
        field_lines[key] = index + 1

        # Block scalars, nested maps and lists continue on indented lines.
        if value in ("", ">", "|", ">-", "|-", ">+", "|+"):
            block: list[str] = []
            index += 1
            while index < closing and (lines[index].startswith((" ", "\t")) or lines[index].strip() == ""):
                block.append(lines[index].strip())
                index += 1
            fields[key] = " ".join(part for part in block if part)
            continue

        fields[key] = value.strip('"').strip("'")
        index += 1

    return fields, field_lines, closing


def prose_lines(lines: list[str], start: int, quotes: bool = False) -> list[tuple[int, str]]:
    """Return (line number, text) for prose: skips frontmatter, fenced code, inline code, and blockquotes unless quotes."""
    result: list[tuple[int, str]] = []
    in_fence = False
    for number, line in enumerate(lines, start=1):
        if number <= start:
            continue
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
            continue
        if in_fence or (not quotes and line.lstrip().startswith(">")):
            continue
        result.append((number, INLINE_CODE_RE.sub("", line)))
    return result


def check_style(lines: list[str], start: int, path: Path, findings: list[Finding]) -> None:
    for number, text in prose_lines(lines, start):
        match = PROHIBITION_RE.search(text)
        if match:
            findings.append(
                Finding(
                    "warning", path, number,
                    f"prohibition sentence ({match.group(0)!r}); rewrite it as what to do: {text.strip()[:100]!r}",
                    "prohibition",
                )
            )
        if TIME_SENSITIVE_RE.search(text):
            findings.append(
                Finding("warning", path, number, "time-sensitive statement; move it to an old-patterns details block")
            )

    in_fence = False
    for number, line in enumerate(lines, start=1):
        if number <= start:
            continue
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        for match in REPO_PATH_RE.finditer(line):
            findings.append(
                Finding(
                    "warning", path, number,
                    f"hard-coded repo path {match.group(1)!r}; link the project knowledge that names it",
                    "repo-path",
                )
            )


def resolve_links(text: str, markdown_path: Path, skill_dir: Path, findings: list[Finding], from_skill_md: bool) -> None:
    skill_root = skill_dir.resolve()
    for line_number, line in prose_lines(text.splitlines(), 0, quotes=True):
        for match in MD_LINK_RE.finditer(line):
            target = match.group(1).strip()
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if "\\" in target:
                findings.append(
                    Finding("error", markdown_path, line_number, f"link uses backslashes: {target!r}; use forward slashes")
                )
                continue

            path_part = target.split("#", 1)[0]
            if not path_part:
                continue

            resolved = (markdown_path.parent / path_part).resolve()
            if not resolved.is_file():
                findings.append(Finding("error", markdown_path, line_number, f"link target is missing: {target!r}"))
                continue
            if skill_root not in resolved.parents:
                findings.append(
                    Finding("error", markdown_path, line_number, f"link leaves the skill directory: {target!r}")
                )
                continue

            relative = resolved.relative_to(skill_root)
            if from_skill_md and len(relative.parts) > 2 and relative.parts[0] == "references":
                findings.append(
                    Finding("warning", markdown_path, line_number, f"reference sits deeper than one level: {target!r}")
                )
            if not from_skill_md and resolved != markdown_path.resolve() and relative.parts[0] == "references":
                findings.append(
                    Finding(
                        "warning", markdown_path, line_number,
                        "reference links to another reference; link every reference from SKILL.md",
                    )
                )


def check_name(name: str, line: int, skill_md: Path, skill_dir: Path, findings: list[Finding]) -> None:
    def error(message: str) -> None:
        findings.append(Finding("error", skill_md, line, message))

    if len(name) > MAX_NAME:
        error(f"name is {len(name)} chars; max {MAX_NAME}")
    if not NAME_RE.match(name):
        error("name holds only lowercase letters, numbers and hyphens")
    if name.startswith("-") or name.endswith("-") or "--" in name:
        error("name starts or ends with a hyphen or holds two hyphens in a row")
    if XML_TAG_RE.search(name):
        error("name holds an XML tag")
    for reserved in ("anthropic", "claude"):
        if reserved in name.lower():
            error(f"name holds the reserved word {reserved!r}")
    if name != skill_dir.name:
        error(f"name {name!r} differs from directory name {skill_dir.name!r}")
    if re.search(r"\b(helper|utils?|tools?)\b", name):
        findings.append(Finding("warning", skill_md, line, "name is vague; name a specific activity"))


def check_description(fields: dict[str, str], field_lines: dict[str, int], skill_md: Path, findings: list[Finding]) -> None:
    description = fields["description"]
    line = field_lines.get("description", 1)

    def warn(message: str) -> None:
        findings.append(Finding("warning", skill_md, line, message))

    if len(description) > MAX_DESCRIPTION:
        findings.append(Finding("error", skill_md, line, f"description is {len(description)} chars; max {MAX_DESCRIPTION}"))
    if XML_TAG_RE.search(description):
        findings.append(Finding("error", skill_md, line, "description holds an XML tag"))
    listing = len(description) + len(fields.get("when_to_use", ""))
    if listing > MAX_LISTING_TEXT:
        warn(f"description plus when_to_use is {listing} chars; Claude Code cuts it at {MAX_LISTING_TEXT}")
    if FIRST_PERSON_RE.search(description) or re.match(r"^(I|We|You)\b", description):
        warn("description uses first or second person; write it in third person")
    if "when" not in (description + fields.get("when_to_use", "")).lower():
        warn("description lacks when to use the skill; add 'Use when ...'")
    if VAGUE_DESCRIPTION_RE.search(description) or len(description) < MIN_USEFUL_DESCRIPTION:
        warn("description is vague; name concrete tasks and triggers")


def validate(skill_dir: Path, findings: list[Finding]) -> None:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        findings.append(Finding("error", skill_dir, 1, "SKILL.md is missing"))
        return

    text = skill_md.read_text(encoding="utf-8")
    lines = text.splitlines()

    fields, field_lines, closing = parse_frontmatter(lines)
    if closing is None:
        findings.append(Finding("error", skill_md, 1, "YAML frontmatter delimited by '---' is missing"))

    for key, line in field_lines.items():
        if key not in SPEC_FIELDS and key not in CLAUDE_CODE_FIELDS:
            findings.append(Finding("warning", skill_md, line, f"frontmatter field {key!r} is outside the spec and Claude Code"))

    if fields.get("name"):
        check_name(fields["name"], field_lines.get("name", 1), skill_md, skill_dir, findings)
    else:
        findings.append(Finding("error", skill_md, 1, "frontmatter lacks 'name'"))

    if fields.get("description"):
        check_description(fields, field_lines, skill_md, findings)
    else:
        findings.append(Finding("error", skill_md, 1, "frontmatter lacks 'description'"))

    if len(fields.get("compatibility", "")) > MAX_COMPATIBILITY:
        findings.append(
            Finding("error", skill_md, field_lines["compatibility"], f"compatibility exceeds {MAX_COMPATIBILITY} chars")
        )

    body_start = closing + 1 if closing is not None else 0
    body_lines = len(lines) - body_start
    if body_lines > MAX_SKILL_LINES:
        findings.append(
            Finding("error", skill_md, len(lines), f"body is {body_lines} lines; keep it under {MAX_SKILL_LINES}")
        )
    elif body_lines > MAX_SKILL_LINES - 50:
        findings.append(
            Finding("warning", skill_md, len(lines), f"body is {body_lines} lines; near the {MAX_SKILL_LINES}-line limit")
        )
    tokens = len("\n".join(lines[body_start:])) // CHARS_PER_TOKEN
    if tokens > MAX_SKILL_TOKENS:
        findings.append(
            Finding("warning", skill_md, len(lines), f"body is about {tokens} tokens; keep it under {MAX_SKILL_TOKENS}")
        )

    check_style(lines, body_start, skill_md, findings)
    resolve_links(text, skill_md, skill_dir, findings, from_skill_md=True)

    for markdown in sorted(skill_dir.rglob("*.md")):
        if markdown == skill_md:
            continue
        markdown_text = markdown.read_text(encoding="utf-8")
        markdown_lines = markdown_text.splitlines()
        check_style(markdown_lines, 0, markdown, findings)
        if skill_dir / "references" not in markdown.parents:
            continue
        if len(markdown_lines) > LONG_REFERENCE_LINES and not TOC_HEADING_RE.search("\n".join(markdown_lines[:25])):
            findings.append(
                Finding("warning", markdown, 1, f"reference is {len(markdown_lines)} lines without a table of contents")
            )
        if VAGUE_REFERENCE_RE.match(markdown.name):
            findings.append(Finding("warning", markdown, 1, "reference filename is vague; name its content"))
        resolve_links(markdown_text, markdown, skill_dir, findings, from_skill_md=False)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--strict", action="store_true", help="treat warnings as failures")
    parser.add_argument("directories", nargs="+", type=Path)
    args = parser.parse_args()

    findings: list[Finding] = []
    for directory in args.directories:
        directory = directory.resolve()
        if not directory.is_dir():
            findings.append(Finding("error", directory, 1, "path is not a directory"))
            continue
        validate(directory, findings)

    for finding in findings:
        print(f"{finding.path}:{finding.line}: {finding.severity.upper()}: {finding.message}")

    errors = sum(1 for f in findings if f.severity == "error")
    warnings = sum(1 for f in findings if f.severity == "warning")
    prohibitions = sum(1 for f in findings if f.kind == "prohibition")
    repo_paths = sum(1 for f in findings if f.kind == "repo-path")
    print(
        f"\n{errors} error(s), {warnings} warning(s) "
        f"({prohibitions} prohibition sentence(s), {repo_paths} hard-coded repo path(s))"
    )
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
