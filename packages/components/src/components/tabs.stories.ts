import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tabs to group content into switchable panels. The parent owns which Tab is selected and provides Arrow/Home/End keyboard navigation with a roving tabindex.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs, value: "one" } };