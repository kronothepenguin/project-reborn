import type { Meta, StoryObj } from "@storybook/svelte-vite";
import TabPanel from "../components/tab-panel.svelte";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

const meta = {
  title: "Components/Tab panel",
  component: TabPanel,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tab panel as a child of Tabs. It shows its content only while the Tab with the same value is selected.",
      },
    },
  },
} satisfies Meta<typeof TabPanel>;

export default meta;
type Story = StoryObj;

export const Shown: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "one" } }),
};
export const Hidden: Story = {
  render: () => ({ Component: Tabs, props: { tabs, value: "two" } }),
};