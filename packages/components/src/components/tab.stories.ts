import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const meta = {
  title: "Components/Tab",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tab as a child of Tabs. It selects among sibling panels and exposes its selected state; hover, focus, and disabled are native.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs, value: "one" } };