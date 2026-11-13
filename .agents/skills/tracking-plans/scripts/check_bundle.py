"""Checks plan bundles under plans/ against the checks their rules list.

Usage: python3 -I check_bundle.py plans/<plan> [plans/<plan> ...]

Exits 1 and prints one line per problem when a check fails, in every bundle named:
- the root index.md declares okf_version "0.2", and no other index.md or log.md has frontmatter;
- every other .md file has frontmatter with a non-empty type and description;
- every concept is listed in the index.md of its directory;
- every bundle-absolute link resolves (placeholders such as /tasks/<file> are skipped), and so does every path under
  plans/ written in backticks, which is how a bundle names a file of another bundle;
- task, phase, slice and decision statuses are allowed values;
- every depends_on id of a task names a task of the bundle, and its slice names a slice of the bundle;
- every depends_on of a slice names a slice of the bundle;
- a phase that moved names where to, and a superseded decision names the decision that took its place.
"""
import os
import re
import sys

STATUSES = {
    "Task": {"todo", "in-progress", "blocked", "done", "dropped"},
    "Phase": {"planned", "active", "done", "moved"},
    "Slice": {"planned", "active", "done", "parked"},
    "Decision": {"accepted", "superseded"},
}
LINK = re.compile(r"\]\((/[^)#\s]*)(#[^)\s]*)?\)")
PLAN_PATH = re.compile(r"`(plans/[A-Za-z0-9_./-]+\.md)(#[^`\s]*)?`")
TASK_ID = re.compile(r"/tasks/([a-z0-9-]+?-\d\d)-")


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


def ids(value):
    return [v.strip() for v in value.strip("[]").split(",") if v.strip()]


def repository(root):
    """The folder that holds plans/: the paths in backticks start there."""
    return os.path.dirname(os.path.dirname(root))


def superseder(root, value):
    """The decision file a superseded_by names: NNNN in this bundle, or <bundle>/NNNN in another."""
    bundle, _, number = value.strip('"').rpartition("/")
    folder = os.path.join(os.path.dirname(root), bundle, "decisions") if bundle else os.path.join(root, "decisions")
    if not os.path.isdir(folder):
        return False
    return any(name.startswith(number + "-") for name in os.listdir(folder))


def check(root):
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
            for m in PLAN_PATH.finditer(text):
                if not os.path.exists(os.path.join(repository(root), m.group(1))):
                    problems.append(f"{rel}: path {m.group(1)} does not resolve")
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
        TASK_ID.match(rel).group(1) for rel, f in concepts.items() if f.get("type") == "Task" and TASK_ID.match(rel)
    }
    slices = {os.path.basename(rel)[:-3] for rel, f in concepts.items() if f.get("type") == "Slice"}
    for rel, fields in sorted(concepts.items()):
        directory = os.path.dirname(rel)
        index = os.path.join(root, directory.lstrip("/"), "index.md")
        if not os.path.exists(index):
            problems.append(f"{rel}: no index.md in {directory}")
        elif f"]({rel})" not in open(index, encoding="utf-8").read():
            problems.append(f"{rel}: not listed in {directory.rstrip('/')}/index.md")
        kind = fields.get("type")
        allowed = STATUSES.get(kind)
        if allowed and fields.get("status") not in allowed:
            problems.append(f"{rel}: status {fields.get('status')!r} is not one of {sorted(allowed)}")
        if kind == "Task":
            for dep in ids(fields.get("depends_on", "[]")):
                if dep not in task_ids:
                    problems.append(f"{rel}: depends_on {dep} names no task")
            if "slice" in fields and fields["slice"] not in slices:
                problems.append(f"{rel}: slice {fields['slice']} names no slice")
        if kind == "Slice":
            for dep in ids(fields.get("depends_on", "[]")):
                if dep not in slices:
                    problems.append(f"{rel}: depends_on {dep} names no slice")
        if kind == "Phase" and fields.get("status") == "moved" and not fields.get("moved_to"):
            problems.append(f"{rel}: moved, and names no moved_to")
        if kind == "Decision" and fields.get("status") == "superseded":
            if not fields.get("superseded_by"):
                problems.append(f"{rel}: superseded, and names no superseded_by")
            elif not superseder(root, fields["superseded_by"]):
                problems.append(f"{rel}: superseded_by {fields['superseded_by']} names no decision")

    name = os.path.basename(root)
    for p in problems:
        print(f"{name}{p}")
    print(f"{name}: {len(concepts)} concepts, {len(problems)} problems")
    return len(problems)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__.strip(), file=sys.stderr)
        sys.exit(2)
    sys.exit(1 if sum(check(root) for root in sys.argv[1:]) else 0)
