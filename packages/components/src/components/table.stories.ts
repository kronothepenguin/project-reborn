import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Table from "../components/table.svelte";

const rows = createRawSnippet(() => ({
  render: () => `
    <tbody>
      <tr><th>Habbo</th><th>Group</th></tr>
      <tr><td>Admin</td><td>Administrators</td></tr>
      <tr><td>Frank</td><td>Moderators</td></tr>
      <tr><td>Greggers</td><td>Moderators</td></tr>
    </tbody>`,
}));

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          "Use Table for rows of data, and for forms laid out as a label column and an input column. It renders a native <table> that fills its container, with its header cells on a grey bar and every second row shaded. Pass <thead> and <tbody> as children.",
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: rows },
};
