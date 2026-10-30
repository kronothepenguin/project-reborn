import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Select from "../components/select.svelte";

const months = createRawSnippet(() => ({
  render: () =>
    '<optgroup label="Month"><option value="1">January</option><option value="2">February</option><option value="3">March</option></optgroup>',
}));

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Use Select to pick one value from a list, such as the parts of a birth date. It renders a native <select> around its options and supports two-way binding with bind:value. It has a 1px border, the white background and black text of Input, and the shared focus outline.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: months, name: "month" },
  parameters: {
    docs: {
      description: {
        story: "Pages pass their options as children, so a server template can render them.",
      },
    },
  },
};
