import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Input from "../components/input.svelte";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Use Input to collect a single line of text. It renders a native <input> and supports two-way binding with bind:value. In the surface theme Input has a white background with black text, 2px padding on all four sides, and the shared focus outline; set `variant`, `size`, or `invalid` to change only the border, padding, or background.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "you@example.com", variant: "default" },
  parameters: {
    docs: {
      description: {
        story:
          "The default variant. Use it for most text fields; it has no border and the default 2px padding with the white background and black text.",
      },
    },
  },
};

export const Border: Story = {
  args: { placeholder: "you@example.com", variant: "border" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the border variant where the field needs a visible outline against its surface; it adds a 1px solid border and changes nothing else.",
      },
    },
  },
};

export const Large: Story = {
  args: { placeholder: "you@example.com", size: "lg" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the large size for a roomier field; it uses 4px padding on all four sides instead of the default 2px. Only the padding changes; the default size is shown by the Default entry.",
      },
    },
  },
};

export const Invalid: Story = {
  args: { placeholder: "you@example.com", invalid: true },
  parameters: {
    docs: {
      description: {
        story:
          "Use the invalid state when the field's value is rejected; it sets the background only, leaving the border, padding, and black text unchanged. It combines independently with the border variant.",
      },
    },
  },
};