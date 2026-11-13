# Decisions

- [0001 Plans are feature slices in one bundle](/decisions/0001-plans-are-feature-slices-in-one-bundle.md) — New work is planned in plans/reborn by feature slice, each across every project it touches, with one folder of tasks; the bundles holo-port, server and client stay as history.
- [0002 A coordinator shares tasks with sub-agents and merges in batches](/decisions/0002-a-coordinator-shares-tasks-and-merges-in-batches.md) — Tasks live in one folder and name the packages they change; a task is taken by creating its worktree; sub-agents work tasks in parallel and never decide or merge; the coordinating session merges ready branches together after one run of the gates.
