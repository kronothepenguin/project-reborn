import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Menu from "./__fixtures__/menu.svelte";

const items = [
  { value: "profile", label: "Profile" },
  { value: "settings", label: "Settings" },
  { value: "signout", label: "Sign out", disabled: true },
];

const meta = {
  title: "Components/Menu",
  component: Menu,
  parameters: {
    docs: {
      description: {
        component:
          "Use Menu to present a list of actions. The trigger opens a popover list built on the Popover API, which provides light-dismiss and Escape for free.",
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: "Account", items } };