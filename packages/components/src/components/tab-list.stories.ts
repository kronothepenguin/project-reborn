import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const meta = {
  title: "Components/Tab list",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tab list as the row of Tabs inside a Tabs group. It draws a line in the group's colour under the row and keeps the tabs at its right edge, as Holo's tabs inside boxes.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs, value: "one" } };
