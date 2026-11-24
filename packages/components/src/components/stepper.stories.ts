import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Stepper from "./__fixtures__/stepper.svelte";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          "Use Stepper to show the steps of a process in one row: a Step with `href` is a step passed, `current` the one open, and a Step with neither one still to come.",
      },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = ["Configuration", "Site", "Settings", "Client files", "Administrator"];
const at = (current: number) =>
  labels.map((label, index) => ({
    label,
    href: index < current ? `#${label}` : undefined,
    current: index === current,
  }));

export const First: Story = {
  args: { steps: at(0) },
  parameters: { docs: { description: { story: "The first step open, every other still to come." } } },
};

export const Middle: Story = {
  args: { steps: at(2) },
  parameters: { docs: { description: { story: "Two steps passed, as links, and two to come." } } },
};

export const Last: Story = {
  args: { steps: at(4) },
  parameters: { docs: { description: { story: "Every step passed but the last, which is open." } } },
};
