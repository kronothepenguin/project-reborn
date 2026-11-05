"""Checks a plan bundle under plans/ against the checks every bundle's rules list.

Usage: python3 -I check_bundle.py plans/<plan>

Exits 1 and prints one line per problem when a check fails:
- the root index.md declares okf_version "0.2", and no other index.md or log.md has frontmatter;
- every other .md file has frontmatter with a non-empty type and description;
- every concept is listed in the index.md of its directory;
- every bundle-absolute link resolves (placeholders such as /tasks/<file> are skipped);
- task, phase and decision statuses are allowed values, and every depends_on id names a task of the bundle.
"""
import os
import re
import sys

STATUSES = {
    "Task": {"todo", "in-progress", "blocked", "done", "dropped"},
    "Phase": {"planned", "active", "done"},
    "Decision": {"accepted", "superseded"},
}
LINK = re.compile(r"\]\((/[^)#\s]*)(#[^)\s]*)?\)")


def frontmatter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        return None
    fields = {}
    for line in m.group(1).splitlines():
        if line.startswith((" ", "-")) or ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip()] = value.split(" #", 1)[0].strip()
    return fields


def main(root):
    root = os.path.abspath(root)
    problems = []
    concepts = {}
    for dirpath, _, files in os.walk(root):
        for name in sorted(files):
            if not name.endswith(".md"):
                continue
            path = os.path.join(dirpath, name)
            rel = "/" + os.path.relpath(path, root)
            text = open(path, encoding="utf-8").read()
            for m in LINK.finditer(text):
                target = m.group(1)
                if "<" in target:
                    continue
                if not os.path.exists(os.path.join(root, target.lstrip("/"))):
                    problems.append(f"{rel}: link {target} does not resolve")
            if name in ("index.md", "log.md"):
                if rel == "/index.md":
                    if not re.match(r'---\nokf_version: "0\.2"\n---\n', text):
                        problems.append('/index.md: does not declare okf_version: "0.2"')
                elif text.startswith("---\n"):
                    problems.append(f"{rel}: reserved file has frontmatter")
                continue
            fields = frontmatter(text)
            if fields is None:
                problems.append(f"{rel}: no frontmatter")
                continue
            for key in ("type", "description"):
                if not fields.get(key):
                    problems.append(f"{rel}: empty {key}")
            concepts[rel] = fields

    task_ids = {
        re.match(r"/tasks/([a-z0-9-]+?-\d\d)-", rel).group(1)
        for rel, f in concepts.items()
        if f.get("type") == "Task" and re.match(r"/tasks/([a-z0-9-]+?-\d\d)-", rel)
    }
    for rel, fields in sorted(concepts.items()):
        directory = os.path.dirname(rel)
        index = os.path.join(root, directory.lstrip("/"), "index.md")
        if not os.path.exists(index):
            problems.append(f"{rel}: no index.md in {directory}")
        elif f"]({rel})" not in open(index, encoding="utf-8").read():
            problems.append(f"{rel}: not listed in {directory.rstrip('/')}/index.md")
        allowed = STATUSES.get(fields.get("type"))
        if allowed and fields.get("status") not in allowed:
            problems.append(f"{rel}: status {fields.get('status')!r} is not one of {sorted(allowed)}")
        if fields.get("type") == "Task":
            deps = fields.get("depends_on", "[]").strip("[]")
            for dep in filter(None, (d.strip() for d in deps.split(","))):
                if dep not in task_ids:
                    problems.append(f"{rel}: depends_on {dep} names no task")

    for p in problems:
        print(p)
    print(f"{len(concepts)} concepts, {len(problems)} problems")
    return 1 if problems else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
