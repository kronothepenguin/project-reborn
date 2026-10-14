import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Paper from "../components/paper.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Surface content</p>" }));

const meta = {
  title: "Components/Paper",
  component: Paper,
  parameters: {
    docs: {
      description: {
        component:
          "Use Paper as the plain flat surface primitive. It renders a container with no elevation — a 1px black/20 border, an 8px radius, and a 3px black/20 bottom border. Set `variant` to change only its background colour.",
      },
    },
  },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: content, variant: "default" },
  parameters: {
    docs: {
      description: {
        story:
          "The default plain surface. Use it for general content on any page; a white background.",
      },
    },
  },
};

export const Login: Story = {
  args: { children: content, variant: "login" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the login surface for authentication and sign-in content; a soft olive-grey background.",
      },
    },
  },
};

export const Gray: Story = {
  args: { children: content, variant: "gray" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the gray surface for secondary or subdued panels that should recede; a neutral grey background.",
      },
    },
  },
};

export const Black: Story = {
  args: { children: content, variant: "black" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the black surface for dark, high-contrast regions such as a dark header or footer; a near-black background.",
      },
    },
  },
};

export const HC: Story = {
  args: { children: content, variant: "hc" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the high-contrast surface where a warm light background is needed for legibility; a pale amber background.",
      },
    },
  },
};

export const Yellow: Story = {
  args: { children: content, variant: "yellow" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the yellow surface for attention or notice content; a warm amber background.",
      },
    },
  },
};

export const LightGreen: Story = {
  args: { children: content, variant: "lightgreen" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the light green surface for positive or success-adjacent content; a soft mint background.",
      },
    },
  },
};

export const Blue: Story = {
  args: { children: content, variant: "blue" },
  parameters: {
    docs: {
      description: {
        story: "Use the blue surface for informational content; a light sky-blue background.",
      },
    },
  },
};

export const RoomPattern: Story = {
  args: { children: content, variant: "room pattern" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the room pattern surface for a room's backdrop area; a flat cyan background, not a repeating image.",
      },
    },
  },
};
