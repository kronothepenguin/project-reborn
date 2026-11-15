# Example: a button

A button of `@acme/components`, with its test and its story.

## Contents

- Primitive
- Test
- Story

## Primitive

```svelte
<!-- src/components/button.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Variant = "default" | "danger";

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    children: Snippet;
  }

  const variantClasses: Record<Variant, string> = {
    default: "bg-neutral-200 text-black hover:bg-neutral-100",
    danger: "bg-red-700 text-white hover:bg-red-600",
  };

  let { type = "button", variant = "default", children, ...rest }: Props = $props();
</script>

<button
  {type}
  class="rounded border-2 border-black px-4 py-1 text-xs font-bold focus-visible:outline-2 disabled:opacity-50 {variantClasses[
    variant
  ]}"
  {...rest}
>
  {@render children()}
</button>
```

```ts
// src/index.ts
export { default as Button } from "./components/button.svelte";
```

## Test

Each test presses the button as a visitor does and checks what follows.

```ts
// src/components/button.test.ts
import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import Button from "./button.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Save</span>" }));

describe("Button", () => {
  it("runs its action when pressed", async () => {
    const onclick = vi.fn();
    render(Button, { props: { children: label, onclick } });

    await userEvent.click(page.getByRole("button", { name: "Save" }));

    expect(onclick).toHaveBeenCalledOnce();
  });

  it("ignores a press while disabled", async () => {
    const onclick = vi.fn();
    render(Button, { props: { children: label, disabled: true, onclick } });

    await userEvent.click(page.getByRole("button", { name: "Save" }), { force: true });

    expect(onclick).not.toHaveBeenCalled();
  });
});
```

## Story

One story per variant and per state.

```ts
// src/components/button.stories.ts
import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Button from "./button.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Save</span>" }));

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: { description: { component: "Use Button to trigger an action on the page." } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: label } };
export const Danger: Story = { args: { children: label, variant: "danger" } };
export const Disabled: Story = { args: { children: label, disabled: true } };
```
