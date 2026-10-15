import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Card from "../components/card.svelte";

const header = createRawSnippet(() => ({ render: () => "<h2>Profile</h2>" }));
const body = createRawSnippet(() => ({
  render: () => "<p>Card body content.</p>",
}));

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Use Card to group related content. It sits on Paper and takes an optional header plus a body.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header,
    children: body,
    color: "lightblue",
  },
};
