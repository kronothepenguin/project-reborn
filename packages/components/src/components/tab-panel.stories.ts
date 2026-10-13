import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const meta = {
  title: "Components/Tab panel",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tab panel as a child of Tabs. It shows its content only while the Tab with the same value is selected.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs, value: "one" } };