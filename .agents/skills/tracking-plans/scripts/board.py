"""Prints what is being worked on in plans/reborn, and keeps its task index.

Usage: python3 -I board.py [--write]

For each active slice it prints the tasks in progress, the ones done on a branch that main does not have yet, the ones
ready to start, and the ones blocked or waiting. A task is taken when a worktree named after it exists, so the board
reads `git worktree list` and never a field of the task. With --write it also rewrites plans/reborn/tasks/index.md from
the task files, grouped by slice, so that nobody edits that index by hand.
"""
import os
import re
import subprocess
import sys

BUNDLE = os.path.join("plans", "reborn")
HOT = ("packages/store", "packages/virtual", "go.work", "pnpm-lock.yaml")


def repository():
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True)
    return out.stdout.strip()


def frontmatter(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    fields = {}
    for line in (m.group(1).splitlines() if m else []):
        if line.startswith((" ", "-")) or ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip()] = value.split(" #", 1)[0].strip()
    return fields


def ids(value):
    return [v.strip() for v in value.strip("[]").split(",") if v.strip()]


def concepts(root, folder):
    found = {}
    directory = os.path.join(root, BUNDLE, folder)
    for name in sorted(os.listdir(directory)):
        if name.endswith(".md") and name != "index.md":
            found[name] = frontmatter(os.path.join(directory, name))
    return found


def task_id(name):
    return re.match(r"([a-z0-9-]+?-\d\d)-", name).group(1)


def worktrees(root):
    out = subprocess.run(["git", "-C", root, "worktree", "list", "--porcelain"], capture_output=True, text=True, check=True)
    return {os.path.basename(line.split(" ", 1)[1]) for line in out.stdout.splitlines() if line.startswith("worktree ")}


def write_index(root, slices, tasks):
    lines = ["# Tasks", "", "Written by `.agents/skills/tracking-plans/scripts/board.py --write`, from the task files.", ""]
    for name, slice_ in slices.items():
        own = [(n, t) for n, t in tasks.items() if t.get("slice") == name[:-3]]
        if not own:
            continue
        lines += ["## " + slice_.get("title", name[:-3]), ""]
        for n, t in own:
            mark = "" if t.get("status") == "todo" else f" **{t.get('status')}**"
            lines.append(f"- [{task_id(n)} {t.get('title', '')}](/tasks/{n}) — {t.get('description', '')}{mark}")
        lines.append("")
    open(os.path.join(root, BUNDLE, "tasks", "index.md"), "w", encoding="utf-8").write("\n".join(lines).rstrip("\n") + "\n")


def main():
    root = repository()
    slices, tasks = concepts(root, "slices"), concepts(root, "tasks")
    if "--write" in sys.argv[1:]:
        write_index(root, slices, tasks)
    taken = worktrees(root)
    done = {task_id(n) for n, t in tasks.items() if t.get("status") == "done"}
    for name, slice_ in slices.items():
        if slice_.get("status") != "active":
            continue
        print(f"{slice_.get('title', name)} ({name[:-3]})")
        rows = []
        for n, t in tasks.items():
            if t.get("slice") != name[:-3]:
                continue
            tid, status = task_id(n), t.get("status")
            waits = [d for d in ids(t.get("depends_on", "[]")) if d not in done]
            if tid in taken and status == "done":
                state = "ready to merge"
            elif tid in taken:
                state = "in progress"
            elif status == "done":
                continue
            elif status in ("blocked", "dropped"):
                state = status
            elif waits:
                state = "waits for " + ", ".join(waits)
            else:
                state = "ready to start"
            rows.append((state, tid, t.get("title", ""), ids(t.get("packages", "[]"))))
        for state, tid, title, packages in rows:
            print(f"  {state:<16} {tid}  {title}  [{', '.join(packages)}]")
        if not rows:
            print("  nothing open")
    busy = {}
    for n, t in tasks.items():
        if task_id(n) in taken and t.get("status") != "done":
            for package in ids(t.get("packages", "[]")):
                busy.setdefault(package, []).append(task_id(n))
    for package, holders in sorted(busy.items()):
        if len(holders) > 1 and package.startswith(HOT):
            print(f"warning: {package} is changed by {', '.join(holders)} at once")
    planned = [s.get("title", n) for n, s in slices.items() if s.get("status") == "planned"]
    if planned:
        print("planned: " + ", ".join(planned))


if __name__ == "__main__":
    main()
