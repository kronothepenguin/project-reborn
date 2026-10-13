import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Dialog from "../components/dialog.svelte";

const content = createRawSnippet(() => ({
  render: () => `
    <h2>Confirm</h2>
    <p>Dialog content with centered overlay.</p>
    <form method="dialog"><button>Close</button></form>
  `,
}));

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "Use Dialog for a modal overlay. It renders a native <dialog> opened with showModal(), so Escape, backdrop clicks, and method=\"dialog\" forms dismiss it and the page behind is inert.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { args: { children: content, open: false, label: "Confirm" } };
export const Open: Story = { args: { children: content, open: true, label: "Confirm" } };