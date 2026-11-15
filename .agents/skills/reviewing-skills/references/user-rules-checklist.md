# User rules checklist

The user's own rules for every skill. Check them on each skill, the reviewing skill included.

The user's words:

> Please keep everything small and simple. do not overexplain, only mention what it's, only make affirmative sentences,
> do not use negative sentences. Prefer to specify what to do and only specify what don't do if to make the agent
> focus on the scope.

## Contents

- Rules in skills, facts in knowledge
- Small and simple
- Affirmative sentences
- Instruction over explanation
- One home per rule

## Rules in skills, facts in knowledge

A skill holds how the user likes to build and works in any repo of theirs. Repo facts live in the project's knowledge
(OKF files in `knowledge/` folders), and a task links them.

- [ ] One finding per repo fact the skill hard-codes: a repo path, a package name, a command, a make target.
- [ ] The validator flags backticked paths under the apps, packages, tools, tests and plans folders; read the rest.
- [ ] The fix moves the fact to the project's knowledge and keeps the rule in the skill.

## Small and simple

- [ ] Each thing gets a one-line mention of what it is, then what to do with it.
- [ ] Sentences are short and use plain words.
- [ ] Each section earns its place; a section the agent follows without help goes.

## Affirmative sentences

- [ ] One finding per prohibition sentence (`never`, `do not`, `don't`, `must not`, `cannot`), quoted, with an
      affirmative rewrite. Example: `Never edit generated files` → `Edit the source files; regenerate the rest`.
- [ ] A limit stays only where it keeps the agent inside the skill's scope.
- [ ] The validator lists prohibition sentences with file and line; read each in context before reporting it.

## Instruction over explanation

- [ ] One finding per passage that explains background, history or reasons the agent can act without.
- [ ] The fix turns the passage into the instruction it supports, or cuts it.

## One home per rule

- [ ] One finding per rule that another skill of the same folder already states. Name both files.
- [ ] The fix keeps the rule in the skill whose task owns it; the other skill names that skill.
