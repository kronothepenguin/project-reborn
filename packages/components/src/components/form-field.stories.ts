import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import FormField from "../components/form-field.svelte";

const control = createRawSnippet(() => ({
  render: () => '<input name="email" type="email" />',
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