import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tab from "../components/tab.svelte";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];
const withDisabled = [
  { value: "one", label: "One" },
  { value: "two", label: "Two", disabled: true },
];

const meta = {
  title: "Components/Tab",
  component: Tab,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tab as a child of Tabs. It selects among sibling panels and exposes its selected state; hover, focus, and disabled are native.",
      },
    },
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "one" } }),
};
export const Hover: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "one" } }),
};
export const Focus: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "one" } }),
};
export const Selected: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "two" } }),
};
export const Disabled: Story = {
  render: () => ({ Component: Tabs, props: { tabs: withDisabled } }),
};