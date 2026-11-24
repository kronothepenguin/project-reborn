import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import FormField from "../components/form-field.svelte";

const control = createRawSnippet(() => ({
  render: () => '<input name="email" type="email" />',
}));

const disabledControl = createRawSnippet(() => ({
  render: () => '<input name="email" type="email" disabled />',
}));

const meta = {
  title: "Components/Form field",
  component: FormField,
  parameters: {
    docs: {
      description: {
        component:
          "Use Form field to label any form control. It wraps the control as children so the label associates without an id, and provides help text and an error message.",
      },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: "Email", children: control } };

export const WithHelp: Story = {
  args: { label: "Email", help: "We never share it", children: control },
  parameters: {
    docs: { description: { story: "The help line is grey, so it reads apart from the label." } },
  },
};

export const WithError: Story = {
  args: { label: "Email", error: "Enter a valid email", children: control },
};

export const Invalid: Story = {
  args: { label: "Email", invalid: true, children: control },
};

export const Disabled: Story = {
  args: { label: "Email", disabled: true, children: disabledControl },
};
