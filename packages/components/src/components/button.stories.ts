import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Button from "../components/button.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Sign in</span>" }));

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Use Button to trigger an action. It renders a native <button> in the surface theme: a base colour with a lighter raised face, a 2px black border, and a 4px radius. Set `variant` to change only its colours; hover, focus, active, and disabled are visible states.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: label, variant: "default" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the default variant for the primary, neutral action. Black label on the mauve base colour.",
      },
    },
  },
};

export const Green: Story = {
  args: { children: label, variant: "green" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the green variant for a positive or confirmatory action. White label on the lime base colour.",
      },
    },
  },
};

export const Dark: Story = {
  args: { children: label, variant: "dark" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the dark variant for a secondary action that should recede. White label on the olive base colour.",
      },
    },
  },
};

export const Red: Story = {
  args: { children: label, variant: "red" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the red variant for a destructive or irreversible action. White label on the red base colour.",
      },
    },
  },
};

export const Wide: Story = {
  args: { children: label, size: "wide" },
  parameters: {
    docs: {
      description: {
        story:
          "The default size. Use wide for form actions and primary calls to action where the wider 16px horizontal padding gives the label more room. Vertical padding and typography are unchanged from compact.",
      },
    },
  },
};

export const Compact: Story = {
  args: { children: label, size: "compact" },
  parameters: {
    docs: {
      description: {
        story:
          "Use compact for toolbars, tables, and dense layouts where the narrower 8px horizontal padding saves space. Only the horizontal padding differs from wide.",
      },
    },
  },
};
