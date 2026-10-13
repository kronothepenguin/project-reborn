import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Input from "../components/input.svelte";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Use Input to collect a single line of text. It renders a native <input> and supports two-way binding with bind:value.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { placeholder: "you@example.com" } };
export const Focused: Story = { args: { placeholder: "you@example.com", autofocus: true } };
export const Filled: Story = { args: { value: "you@example.com" } };
export const Disabled: Story = { args: { value: "you@example.com", disabled: true } };
export const Invalid: Story = { args: { value: "not-an-email", "aria-invalid": true } };