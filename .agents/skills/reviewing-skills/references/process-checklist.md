# Process checklist

Sources: agentskills.io best practices; Claude platform agent-skills best practices.

Apply when a skill is being created, changed, or reviewed for long-term quality.

## Contents

- Evaluation-driven development
- Model coverage
- Real execution
- Navigation observation
- Grounding in expertise
- Team iteration

## Evaluation-driven development

- [ ] Gaps were identified by running a representative task without the skill.
- [ ] Specific failures or missing context were documented, not imagined.
- [ ] At least three evaluation scenarios exist.
- [ ] Evaluations define the query, the files, and the expected behavior.
- [ ] A baseline without the skill was measured before writing instructions.
- [ ] Only enough content to close the gaps was written.
- [ ] Evaluations are re-run after changes and compared to the baseline.
- [ ] Evaluations live somewhere the skill maintainers can run them.

## Model coverage

- [ ] The skill was tested with every model it will run on.
- [ ] A small, fast model can follow the guidance without extra detail.
- [ ] A balanced model finds the skill clear and efficient.
- [ ] A large model is not burdened with over-explaining.
- [ ] Instructions work across the model range or state which model they target.

## Real execution

- [ ] The skill was used on real tasks, not only synthetic cases.
- [ ] Execution traces were reviewed, not just final outputs.
- [ ] Vague instructions that caused flailing were rewritten.
- [ ] Instructions that never applied were deleted.
- [ ] Menus of options without a default were replaced.
- [ ] Corrections made during use were added to the gotchas section.
- [ ] The skill was executed after each revision.

## Navigation observation

- [ ] Unexpected exploration paths were investigated and the structure adjusted.
- [ ] Missed reference links were made more explicit or prominent.
- [ ] Content the agent repeatedly read was promoted into `SKILL.md`.
- [ ] Bundled files the agent never read were removed or better signposted.
- [ ] Partial reads caused by deep reference chains were fixed by flattening references.
- [ ] The name and description trigger on the intended prompts.

## Grounding in expertise

- [ ] The skill was extracted from a real hands-on task or real project artifacts.
- [ ] Source material includes internal docs, runbooks, or style guides.
- [ ] API specifications, schemas, or configuration files are reflected.
- [ ] Code review comments or recurring reviewer concerns are reflected.
- [ ] Version control history or patches informed the patterns.
- [ ] Real failure cases and their resolutions are captured.
- [ ] The skill captures project-specific schemas, failure modes, and procedures.

## Team iteration

- [ ] The skill was shared with the people who will use it.
- [ ] Usage was observed rather than assumed.
- [ ] One agent instance refined the skill while another tested it in real tasks.
- [ ] Feedback about activation, clarity, and gaps was collected.
- [ ] The observe → refine → retest cycle is followed.
