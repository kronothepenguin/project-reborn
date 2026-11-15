---
name: testing-behaviours
description: Writes tests that each prove one expected behaviour of a feature's spec.md (a situation, an action, an outcome), covers both the case that succeeds and the case that is refused, reviews the code when a test fails, and runs the checks of every dependant project. Use when writing, changing, fixing or reviewing tests, or when a change to a project could break the projects that depend on it.
---

# Testing behaviours

A behaviour is one line of `spec.md`: a situation, an action, an outcome. A test proves one behaviour.

Test your own code. Tools that are already tested, such as sqlc and SQLite, are trusted: a test checks what our code
does with them.

- A test needs our logic between a tool's input and its output. Leave the rest to the tool.
- A rule held in SQL is proven once, through the program that uses the query. Test the query alone when no program
  shows the rule.
- A test asserts what a user or a client observes. The shape of a struct, a JSON tag, a default that passes its own
  validator, a class name and the exact strings of a generated file are details: leave them to the code.
- A guard is a test over the whole repo that keeps a rule of the build true: every page wakes its islands, every seeded
  item has its art. A guard is a valid test.

## Write a test

1. Name the test after the behaviour it proves.
2. Build the situation.
3. Perform the action the user or the client performs.
4. Assert the outcome the user can observe.

A component's test proves what a visitor sees or does: a disabled button stays unpressed, Escape closes the dialog, the
tab list exposes its roles.

Both sides of a rule get a test: the case that succeeds and the case that is refused.

```go
func TestUserWithCreditsBuysItem(t *testing.T) {
	shop := newShop(t)
	user := shop.addUser(t, 100)

	err := shop.buy(user, "chair", 30)

	if err != nil {
		t.Fatalf("buy: %v", err)
	}
	if got := shop.credits(user); got != 70 {
		t.Errorf("credits = %d, want 70", got)
	}
	if !shop.owns(user, "chair") {
		t.Error("chair is missing from the inventory")
	}
}

func TestUserWithoutCreditsIsRefused(t *testing.T) {
	shop := newShop(t)
	user := shop.addUser(t, 0)

	err := shop.buy(user, "chair", 30)

	if err == nil {
		t.Fatal("buy succeeded, want refused")
	}
	if got := shop.credits(user); got != 0 {
		t.Errorf("credits = %d, want 0", got)
	}
}
```

A frontend test has the same shape: render the page in the situation, click as the user clicks, and assert what the
page shows.

## Level

Prove a behaviour once, at the lowest level that shows its outcome.

- A page or an action of a web app: a test through the HTTP router. A request goes in, a page or a redirect comes out.
- A browser suite: only for what needs a real browser, such as an island or a primitive working inside a page.

## A failing test

A failing test starts a review of the code: find what broke and fix it there. A test changes when the spec changes.

## Dependants

A change to a project runs the checks of every project that depends on it. The dependant works exactly as before, or it
gets the fix. Example: a change to a components package runs the checks of the site that uses it.

## Tests without a behaviour

A test that proves a real behaviour no spec lists stays. Report the missing spec line; the master adds it to the spec
with the user.

## Report

List each test beside the behaviour it proves:

```markdown
- TestUserWithCreditsBuysItem: a user with credits buys an item: the credits go down and the item is in the inventory.
- TestUserWithoutCreditsIsRefused: a user without credits buys an item: the purchase is refused and the credits stay.
```
