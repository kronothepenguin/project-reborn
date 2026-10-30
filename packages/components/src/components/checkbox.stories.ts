import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Checkbox from "../components/checkbox.svelte";

const content = createRawSnippet(() => ({ render: () => "<span>Remember me</span>" }));

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Use Checkbox for a yes or no choice in a form. It renders a native checkbox inside a label with its content, so clicking the text toggles it, and it supports two-way binding with bind:checked. Attributes go to the input; `class` goes to the label.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: content, name: "remember" },
  parameters: {
    docs: {
      description: {
        story: "The unchecked state. Use it for choices the visitor has to opt in to.",
      },
    },
  },
};

export const Checked: Story = {
  args: { children: content, name: "remember", checked: true },
  parameters: {
    docs: {
      description: {
        story: "Use the checked state for a choice that is already on, such as a saved preference.",
      },
    },
  },
};
