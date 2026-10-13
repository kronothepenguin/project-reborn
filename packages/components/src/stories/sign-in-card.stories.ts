import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SignInCard from "./sign-in-card.svelte";

const meta = {
  title: "Catalogue/Sign-in card",
  component: SignInCard,
  parameters: {
    docs: {
      description: {
        component:
          "An example page assembled entirely from design-system components (Card, Form field, Input, Button) with no page-specific UI code (FR-020, SC-002).",
      },
    },
  },
} satisfies Meta<typeof SignInCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A sign-in form built only from design-system components. It shows how the components compose into a real page.",
      },
    },
  },
};
