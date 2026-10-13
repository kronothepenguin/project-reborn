import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Paper from "../components/paper.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Surface content</p>" }));

const meta = {
  title: "Components/Paper",
  component: Paper,
  parameters: {
    docs: {
      description: {
        component:
          "Use Paper as the plain surface primitive. It renders a container with no elevation of its own; elevation belongs to the look & feel.",
      },
    },
  },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: content } };