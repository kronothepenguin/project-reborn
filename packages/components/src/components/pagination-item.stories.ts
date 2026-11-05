import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import PaginationItem from "../components/pagination-item.svelte";

const number = createRawSnippet(() => ({ render: () => "<span>2</span>" }));

const meta = {
  title: "Components/PaginationItem",
  component: PaginationItem,
  parameters: {
    docs: {
      description: {
        component:
          "One page of a Pagination. It links to `href`, or with `current` it shows the number as plain text, marked as the current page.",
      },
    },
  },
} satisfies Meta<typeof PaginationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: { children: number, href: "#" },
  parameters: { docs: { description: { story: "A page that is not the current one, a black underlined link." } } },
};

export const Current: Story = {
  args: { children: number, current: true },
  parameters: { docs: { description: { story: "The current page, plain text." } } },
};
