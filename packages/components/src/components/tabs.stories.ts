import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "one", label: "My Groups" },
  { value: "two", label: "Hot Groups" },
  { value: "three", label: "Others Like..." },
];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use Tabs to group content into switchable panels, as Holo's tabs inside boxes. Tabs owns which Tab is selected and the group's `color`, blue by default; a TabList holds the Tabs and provides Arrow/Home/End keyboard navigation with a roving tabindex.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs, value: "one" } };

export const Blue: Story = {
  args: { tabs, value: "one", color: "blue" },
  parameters: { docs: { description: { story: "Holo's blue tabs, the default." } } },
};

export const Green: Story = {
  args: { tabs, value: "one", color: "green" },
  parameters: { docs: { description: { story: "Holo's green tabs, as in the tags box." } } },
};

export const Orange: Story = {
  args: { tabs, value: "one", color: "orange" },
  parameters: { docs: { description: { story: "Holo's orange tabs." } } },
};
