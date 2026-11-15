import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Box from "../components/box.svelte";

const content = createRawSnippet(() => ({ render: () => "<p class='p-1'>Add or edit banners on your site!</p>" }));

const meta = {
  title: "Components/Box",
  component: Box,
  parameters: {
    docs: {
      description: {
        component:
          "Use Box to frame one section of a back-office page under a title bar: blue for navigation and forms, gold for data lists.",
      },
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blue: Story = {
  args: { title: "Add banners", color: "blue", children: content },
  parameters: { docs: { description: { story: "A navigation box or a form: a sky-blue bar with white text." } } },
};

export const Gold: Story = {
  args: { title: "Banner editer", color: "gold", children: content },
  parameters: { docs: { description: { story: "A data list: a gold bar with black text." } } },
};
