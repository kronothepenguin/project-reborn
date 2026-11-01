import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Spinner from "../components/spinner.svelte";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component: "Use Spinner in place of a value that is still loading or saving.",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
