import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Bubble from "../components/bubble.svelte";

const content = createRawSnippet(() => ({
  render: () => "<p>Please enter a name for your Habbo (character).</p>",
}));

const meta = {
  title: "Components/Bubble",
  component: Bubble,
  parameters: {
    docs: {
      description: {
        component:
          "Use Bubble for a short hint beside what it explains, such as a tooltip on a form field. It is a white box with a black border and a tail; position it with `class`.",
      },
    },
  },
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TailDown: Story = {
  args: { children: content },
  parameters: {
    docs: { description: { story: "The default. Place the bubble above what it explains." } },
  },
};

export const TailUp: Story = {
  args: { children: content, tail: "top" },
  parameters: {
    docs: { description: { story: "Place the bubble below what it explains." } },
  },
};
