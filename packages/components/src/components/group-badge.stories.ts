import type { Meta, StoryObj } from "@storybook/svelte-vite";
import GroupBadge from "../components/group-badge.svelte";

const meta = {
  title: "Components/GroupBadge",
  component: GroupBadge,
  parameters: {
    docs: {
      description: {
        component:
          "Use GroupBadge to show a group's badge. It renders an <img> of /habbo-imaging/badge/{code}, which the CMS draws from the code, so the picture shows only where the CMS serves the page. The code can be a [[ ]] placeholder, which the server fills in and escapes.",
      },
    },
  },
} satisfies Meta<typeof GroupBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { code: "b0503Xs09114s05013s05015", alt: "A group" },
  parameters: {
    docs: {
      description: { story: "Holo's badge for a new group: a green base, a white symbol and two yellow dots." },
    },
  },
};
