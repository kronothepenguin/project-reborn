import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Link from "../components/link.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Read more</span>" }));

const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Use Link for navigation. It renders a native <a> and forwards every anchor attribute such as href, target, and rel. Set `variant` to change only the colour and text decoration; Link is an explicit WCAG AA exception, so its reference colours are kept where they fall below AA. Link has no disabled state and uses the shared focus outline.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: label, href: "#", variant: "default" },
  parameters: {
    docs: {
      description: {
        story:
          "The default variant. Use it for ordinary links on a light surface; orange text with an underline. Its reference colour falls below WCAG AA on light backgrounds and is kept as documented.",
      },
    },
  },
};

export const White: Story = {
  args: { children: label, href: "#", variant: "white" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the white variant for links on a dark or coloured surface; white text with an underline.",
      },
    },
  },
};

export const PersonalInfo: Story = {
  args: { children: label, href: "#", variant: "personal-info" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the personal-info variant for links inside profile panels on a dark surface; white text with no underline.",
      },
    },
  },
};

export const Nav: Story = {
  args: { children: label, href: "#", variant: "nav" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the nav variant for navigation links on a light header; dark blue text with no underline.",
      },
    },
  },
};

export const Settings: Story = {
  args: { children: label, href: "#", variant: "settings" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the settings variant for links within settings content; dark grey text with no underline.",
      },
    },
  },
};

export const Yellow: Story = {
  args: { children: label, href: "#", variant: "yellow" },
  parameters: {
    docs: {
      description: {
        story:
          "Use the yellow variant for attention links on a dark surface; yellow text with an underline. Its reference colour falls below WCAG AA on light backgrounds and is kept as documented.",
      },
    },
  },
};