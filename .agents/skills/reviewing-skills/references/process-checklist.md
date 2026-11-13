# Process checklist

How the skill was built and tested. Apply it to a skill being created or changed, or one that holds `evals/`.

## Contents

- Grounding
- Output evals
- Trigger evals
- Models
- Real use

## Grounding

- [ ] The skill comes from a real task or real project material: runbooks, specs, review comments, fixes, failures.
- [ ] It captures the corrections, formats and context the user gave during that task.
- [ ] Generic advice gives way to the project's own patterns and failure modes.

## Output evals

- [ ] Gaps were found by running representative tasks without the skill first.
- [ ] Test cases live in `evals/evals.json`: a realistic prompt, the expected output, input files.
- [ ] The set starts with two or three cases and grows; at least one case tests a boundary.
- [ ] Each case runs with the skill and without it, or against a snapshot of the old version, in a fresh context.
- [ ] Assertions are added after the first run, each specific and checkable; scripts check the mechanical ones.
- [ ] Grading records PASS or FAIL with quoted evidence from the output.
- [ ] Results compare pass rate, time and tokens against the baseline.
- [ ] A human reviews the outputs and records specific feedback per case.
- [ ] Each iteration generalizes from the feedback, keeps the skill lean and re-runs every case.

## Trigger evals

- [ ] About 20 labelled queries: half should trigger, half should stay quiet.
- [ ] Should-trigger queries vary phrasing, detail and directness, including ones that skip the skill's keywords.
- [ ] Should-stay-quiet queries are near misses that share keywords with the skill.
- [ ] Each query runs about three times; a trigger rate above 0.5 counts as triggered.
- [ ] Description changes use a fixed train set (about 60%) and a held-out validation set (about 40%).
- [ ] The chosen description has the best validation pass rate and generalizes past the train queries.

## Models

- [ ] The skill was tested on every model it runs on: small models get enough guidance, large ones stay unburdened.

## Real use

- [ ] The skill ran on real tasks, and the traces were read along with the outputs.
- [ ] Vague instructions that caused wasted steps were rewritten; unused instructions were cut.
- [ ] Each correction made during use became a gotcha.
- [ ] Navigation was observed: files the agent rereads move into `SKILL.md`, files it ignores are signposted or cut.
- [ ] The name and description were checked against real prompts.
- [ ] The people who use the skill gave feedback on activation, clarity and gaps.
