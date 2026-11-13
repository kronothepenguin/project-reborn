"""Checks OKF bundles and the types of the workflow.

Usage: python3 -I check.py [bundle ...]

With no argument it checks every directory named knowledge in the repo. It prints one line per finding as
path:line: message and exits 1 when any check fails. A note never fails.
"""
import importlib.util
import os
import re
import sys

# -I leaves the script's folder off sys.path, so the shared module loads by its path.
_here = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("okf", os.path.join(_here, "okf.py"))
okf = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(okf)

SPEC_STATUS = ("planned", "active", "done", "parked")
TASK_NAME = re.compile(r"^([a-z0-9]+(-[a-z0-9]+)*/)?\d\d-[a-z0-9]+(-[a-z0-9]+)*$")
FENCE = re.compile(r"^(```|~~~).*?^\1[^\n]*$", re.S | re.M)
INLINE_CODE = re.compile(r"`[^`\n]*`")
LINK = re.compile(r"\]\(\s*([^)\s]+)[^)]*\)")
SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
REPO_PATH = re.compile(r"`([A-Za-z0-9_./-]*knowledge/[A-Za-z0-9_./-]*\.md)(#[^`\s]*)?`")


def blank(m):
    return re.sub(r"[^\n]", " ", m.group(0))


class Checker:
    def __init__(self, root):
        self.root = root
        self.failures = 0
        self.notes = 0

    def fail(self, path, line, message):
        self.failures += 1
        print(f"{okf.display(path)}:{line}: {message}")

    def note(self, path, line, message):
        self.notes += 1
        print(f"{okf.display(path)}:{line}: note: {message}")

    def links(self, bundle, path, text):
        """Resolved targets of the markdown links of a file, with their lines; code is left out."""
        prose = FENCE.sub(blank, text)
        prose = INLINE_CODE.sub(blank, prose)
        for m in LINK.finditer(prose):
            target = m.group(1).split("#", 1)[0].split("?", 1)[0]
            if not target or SCHEME.match(target) or "<" in target:
                continue
            line = prose.count("\n", 0, m.start()) + 1
            if target.startswith("/"):
                resolved = os.path.normpath(os.path.join(bundle, target.lstrip("/")))
            else:
                resolved = os.path.normpath(os.path.join(os.path.dirname(path), target))
            yield m.group(1), resolved, line

    def check_links(self, bundle, path, text):
        for target, resolved, line in self.links(bundle, path, text):
            if target.startswith("/") and not (resolved + os.sep).startswith(bundle + os.sep):
                self.fail(path, line, f"link {target} leaves the bundle")
            elif not os.path.exists(resolved):
                self.fail(path, line, f"link {target} does not resolve")
        prose = FENCE.sub(blank, text)
        for m in REPO_PATH.finditer(prose):
            if not os.path.exists(os.path.join(self.root, m.group(1))):
                line = prose.count("\n", 0, m.start()) + 1
                self.fail(path, line, f"path {m.group(1)} does not resolve from the repo root")

    def check_index(self, bundle, dirpath, dirs, files):
        path = os.path.join(dirpath, "index.md")
        if not os.path.exists(path):
            return set()
        with open(path, encoding="utf-8") as f:
            text = f.read()
        if okf.generated(text) and okf.render(bundle, dirpath, dirs, files, text) != text:
            self.fail(path, 1, "generated index is out of date: run index.py")
        return {resolved for _, resolved, _ in self.links(bundle, path, text)}

    def check_spec(self, path, fields, lines):
        status = fields.get("status")
        if status not in SPEC_STATUS:
            self.fail(path, lines.get("status", 1), f"status {status!r} is not one of {', '.join(SPEC_STATUS)}")
        if "projects" not in fields:
            self.fail(path, 1, "Spec has no projects")
        for project in as_list(fields.get("projects")):
            if not os.path.isdir(os.path.join(self.root, project)):
                self.note(path, lines["projects"], f"project {project} is not a folder yet: the feature creates it")

    def check_task(self, path, fields, lines):
        for key in ("scope", "depends_on", "skills"):
            if key not in fields:
                self.fail(path, 1, f"Task has no {key}")
        for skill in as_list(fields.get("skills")):
            if not os.path.isdir(os.path.join(self.root, ".agents", "skills", skill)):
                self.fail(path, lines["skills"], f"skill {skill} is not a folder of .agents/skills/")
        for name in as_list(fields.get("depends_on")):
            feature, _, task = name.rpartition("/")
            tasks = os.path.dirname(path)
            if feature:
                # a task of another feature: features/<feature>/tasks/NN-<slug>.md
                tasks = os.path.join(os.path.dirname(os.path.dirname(tasks)), feature, "tasks")
            if not TASK_NAME.match(name):
                message = f"depends_on {name} follows neither NN-<slug> nor <feature>/NN-<slug>"
                self.fail(path, lines["depends_on"], message)
            elif not os.path.exists(os.path.join(tasks, task + ".md")):
                self.note(path, lines["depends_on"], f"depends_on {name} has no file: counts as done")

    def check_bundle(self, bundle):
        root_index = os.path.join(bundle, "index.md")
        if not os.path.exists(root_index):
            self.fail(root_index, 1, "root index.md is missing: run index.py")
        for dirpath, dirs, files in okf.walk(bundle):
            listed = self.check_index(bundle, dirpath, dirs, files)
            has_index = "index.md" in files
            for name in files:
                path = os.path.join(dirpath, name)
                with open(path, encoding="utf-8") as f:
                    text = f.read()
                self.check_links(bundle, path, text)
                if name in okf.RESERVED:
                    fields = okf.frontmatter(text)
                    if path == root_index:
                        if not fields or not fields[0].get("okf_version"):
                            self.fail(path, 1, 'root index.md does not declare okf_version: "0.2"')
                    elif fields is not None:
                        self.fail(path, 1, f"{name} has frontmatter: only the root index.md has it")
                    continue
                parsed = okf.frontmatter(text)
                if parsed is None:
                    self.fail(path, 1, "no frontmatter")
                    continue
                fields, lines = parsed
                for key in ("type", "title", "description"):
                    if not fields.get(key) or not isinstance(fields[key], str):
                        self.fail(path, lines.get(key, 1), f"empty {key}")
                if not has_index:
                    self.fail(path, 1, "not listed: its directory has no index.md (run index.py)")
                elif path not in listed:
                    self.fail(path, 1, "not listed in the index.md of its directory")
                if fields.get("type") == "Spec":
                    self.check_spec(path, fields, lines)
                elif fields.get("type") == "Task":
                    self.check_task(path, fields, lines)


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def main(args):
    root = okf.repo_root()
    checker = Checker(root)
    found = okf.bundles(root, args)
    for bundle in found:
        checker.check_bundle(bundle)
    print(f"{len(found)} bundles, {checker.failures} failures, {checker.notes} notes")
    return 1 if checker.failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
