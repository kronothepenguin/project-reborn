import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Link from "../components/link.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Read more</span>" }));

const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Use Link for navigation. It renders a native <a> and forwards every anchor attribute such as href, target, and rel.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: label, href: "#" } };
export const Hover: Story = { args: { children: label, href: "#" } };
export const Focus: Story = { args: { children: label, href: "#", autofocus: true } };
export const Active: Story = { args: { children: label, href: "#" } };
export const Disabled: Story = {
  args: { children: label, "aria-disabled": true, tabindex: -1 },
};