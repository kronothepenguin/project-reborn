#!/usr/bin/env python3
"""Validate an Agent Skill directory against structural best practices.

Checks the hard requirements from the Agent Skills specification and the
authoring best practices: frontmatter fields, name and description rules,
SKILL.md size, reference hygiene, and relative links.

Usage:
    python3 validate_skill.py [--strict] <skill-directory> [<skill-directory> ...]

Exit status is 1 when any error is found. With --strict, warnings also fail.
Only the Python standard library is required.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

MAX_NAME = 64
MAX_DESCRIPTION = 1024
MIN_USEFUL_DESCRIPTION = 40
MAX_SKILL_LINES = 500
LONG_REFERENCE_LINES = 100

NAME_RE = re.compile(r"^[a-z0-9-]+$")
XML_TAG_RE = re.compile(r"<[^>]+>")
KEY_RE = re.compile(r"^([A-Za-z0-9_-]+):\s*(.*)$")
MD_LINK_RE = re.compile(r"\]\(([^)]+)\)")
TOC_HEADING_RE = re.compile(
    r"^#{1,3}\s+(contents|table of contents)\b", re.IGNORECASE | re.MULTILINE
)
FIRST_PERSON_RE = re.compile(r"(^|\b)(I|we|you)\s+(can|will|should|might|may)\b", re.IGNORECASE)
VAGUE_DESCRIPTION_RE = re.compile(
    r"^\s*(helps? with|processes data|does stuff|handles? (files|documents)|works? with)\b",
    re.IGNORECASE,
)
VAGUE_REFERENCE_RE = re.compile(r"^(doc|file|tmp|untitled|misc)[-_]?\d*\.md$", re.IGNORECASE)
TIME_SENSITIVE_RE = re.compile(
    r"\b(before|after|as of|deprecated in|starting)\s+"
    r"(january|february|march|april|may|june|july|august|september|october|november|december)"
    r"\s+\d{4}\b",
    re.IGNORECASE,
)


class Finding:
    def __init__(self, severity: str, path: Path, line: int, message: str) -> None:
        self.severity = severity
        self.path = path
        self.line = line
        self.message = message


def parse_frontmatter(lines: list[str]) -> tuple[dict[str, str], dict[str, int], int | None]:
    """Return (fields, field-lines, closing-line-index)."""
    if not lines or lines[0].strip() != "---":
        return {}, {}, None

    closing = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            closing = index
            break
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

        if value in (">", "|", ">-", "|-", "+", ">+", "|+"):
            block: list[str] = []
            index += 1
            while index < closing and (
                lines[index].startswith((" ", "\t")) or lines[index].strip() == ""
            ):
                block.append(lines[index].strip())
                index += 1
            fields[key] = " ".join(part for part in block if part)
            continue

        fields[key] = value.strip().strip('"').strip("'")
        index += 1

    return fields, field_lines, closing


def resolve_links(
    text: str,
    markdown_path: Path,
    skill_dir: Path,
    findings: list[Finding],
    from_skill_md: bool,
) -> None:
    for line_number, line in enumerate(text.splitlines(), start=1):
        for match in MD_LINK_RE.finditer(line):
            target = match.group(1).strip()
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if "\\" in target:
                findings.append(
                    Finding(
                        "error",
                        markdown_path,
                        line_number,
                        f"link uses a Windows-style path: {target!r}; use forward slashes",
                    )
                )
                continue

            path_part = target.split("#", 1)[0]
            if not path_part:
                continue

            resolved = (markdown_path.parent / path_part).resolve()
            skill_root = skill_dir.resolve()

            if not resolved.is_file():
                findings.append(
                    Finding(
                        "error",
                        markdown_path,
                        line_number,
                        f"link target does not exist: {target!r}",
                    )
                )
                continue

            if resolved != skill_root and skill_root not in resolved.parents:
                findings.append(
                    Finding(
                        "error",
                        markdown_path,
                        line_number,
                        f"link escapes the skill directory: {target!r}",
                    )
                )
                continue

            try:
                relative = resolved.relative_to(skill_root)
            except ValueError:
                continue

            if from_skill_md and len(relative.parts) > 2 and relative.parts[0] == "references":
                findings.append(
                    Finding(
                        "warning",
                        markdown_path,
                        line_number,
                        f"reference is nested more than one level from SKILL.md: {target!r}",
                    )
                )
            if (
                not from_skill_md
                and resolved != markdown_path.resolve()
                and relative.parts
                and relative.parts[0] == "references"
            ):
                findings.append(
                    Finding(
                        "warning",
                        markdown_path,
                        line_number,
                        "reference links to another reference; keep references one level from SKILL.md",
                    )
                )


def validate(skill_dir: Path, findings: list[Finding]) -> None:
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        findings.append(Finding("error", skill_dir, 1, "SKILL.md not found"))
        return

    text = skill_md.read_text(encoding="utf-8")
    lines = text.splitlines()

    if len(lines) > MAX_SKILL_LINES:
        findings.append(
            Finding(
                "error",
                skill_md,
                len(lines),
                f"SKILL.md is {len(lines)} lines; keep it under {MAX_SKILL_LINES} and move detail to references/",
            )
        )
    elif len(lines) > MAX_SKILL_LINES - 50:
        findings.append(
            Finding(
                "warning",
                skill_md,
                len(lines),
                f"SKILL.md is {len(lines)} lines; approaching the {MAX_SKILL_LINES}-line limit",
            )
        )

    fields, field_lines, closing = parse_frontmatter(lines)
    if closing is None:
        findings.append(
            Finding("error", skill_md, 1, "missing YAML frontmatter delimited by '---'")
        )

    name = fields.get("name", "")
    if not name:
        findings.append(Finding("error", skill_md, 1, "frontmatter is missing 'name'"))
    else:
        name_line = field_lines.get("name", 1)
        if len(name) > MAX_NAME:
            findings.append(
                Finding("error", skill_md, name_line, f"name is {len(name)} chars; max {MAX_NAME}")
            )
        if not NAME_RE.match(name):
            findings.append(
                Finding(
                    "error",
                    skill_md,
                    name_line,
                    "name may contain only lowercase letters, numbers, and hyphens",
                )
            )
        if XML_TAG_RE.search(name):
            findings.append(Finding("error", skill_md, name_line, "name must not contain XML tags"))
        lowered = name.lower()
        for reserved in ("anthropic", "claude"):
            if reserved in lowered:
                findings.append(
                    Finding("error", skill_md, name_line, f"name must not contain {reserved!r}")
                )
        if name != skill_dir.name:
            findings.append(
                Finding(
                    "warning",
                    skill_md,
                    name_line,
                    f"name {name!r} does not match directory name {skill_dir.name!r}",
                )
            )
        if re.search(r"\b(helper|utils?|tools?)\b", name):
            findings.append(
                Finding("warning", skill_md, name_line, "name is vague; prefer a specific activity")
            )

    description = fields.get("description", "")
    if not description:
        findings.append(Finding("error", skill_md, 1, "frontmatter is missing 'description'"))
    else:
        description_line = field_lines.get("description", 1)
        if len(description) > MAX_DESCRIPTION:
            findings.append(
                Finding(
                    "error",
                    skill_md,
                    description_line,
                    f"description is {len(description)} chars; max {MAX_DESCRIPTION}",
                )
            )
        if XML_TAG_RE.search(description):
            findings.append(
                Finding("error", skill_md, description_line, "description must not contain XML tags")
            )
        if FIRST_PERSON_RE.search(description) or re.match(r"^(I|We|You)\b", description):
            findings.append(
                Finding(
                    "warning",
                    skill_md,
                    description_line,
                    "description uses first/second person; write it in third person",
                )
            )
        if "when" not in description.lower():
            findings.append(
                Finding(
                    "warning",
                    skill_md,
                    description_line,
                    "description does not say when to use the skill",
                )
            )
        if VAGUE_DESCRIPTION_RE.search(description) or len(description) < MIN_USEFUL_DESCRIPTION:
            findings.append(
                Finding(
                    "warning",
                    skill_md,
                    description_line,
                    "description is vague; name concrete tasks and triggers",
                )
            )

    for line_number, line in enumerate(lines, start=1):
        if TIME_SENSITIVE_RE.search(line):
            findings.append(
                Finding(
                    "warning",
                    skill_md,
                    line_number,
                    "time-sensitive statement; move it to an 'old patterns' details section",
                )
            )

    resolve_links(text, skill_md, skill_dir, findings, from_skill_md=True)

    references = skill_dir / "references"
    if references.is_dir():
        for reference in sorted(references.rglob("*.md")):
            reference_text = reference.read_text(encoding="utf-8")
            reference_lines = reference_text.splitlines()
            if len(reference_lines) > LONG_REFERENCE_LINES:
                head = "\n".join(reference_lines[:25])
                if not TOC_HEADING_RE.search(head):
                    findings.append(
                        Finding(
                            "warning",
                            reference,
                            1,
                            f"reference is {len(reference_lines)} lines without a table of contents",
                        )
                    )
            if VAGUE_REFERENCE_RE.match(reference.name):
                findings.append(
                    Finding("warning", reference, 1, "reference filename is not descriptive")
                )
            resolve_links(
                reference_text, reference, skill_dir, findings, from_skill_md=False
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict", action="store_true", help="treat warnings as failures")
    parser.add_argument("directories", nargs="+", type=Path)
    args = parser.parse_args()

    findings: list[Finding] = []
    for directory in args.directories:
        directory = directory.resolve()
        if not directory.is_dir():
            findings.append(Finding("error", directory, 1, "not a directory"))
            continue
        validate(directory, findings)

    errors = sum(1 for finding in findings if finding.severity == "error")
    warnings = sum(1 for finding in findings if finding.severity == "warning")

    for finding in findings:
        print(
            f"{finding.path}:{finding.line}: {finding.severity.upper()}: {finding.message}"
        )

    print(f"\n{errors} error(s), {warnings} warning(s)")
    if errors or (args.strict and warnings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
