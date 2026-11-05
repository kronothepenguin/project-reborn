import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Pagination from "../components/pagination.svelte";

const pages = createRawSnippet(() => ({
  render: () =>
    `<span><a class="text-black underline" href="#">1</a> <span aria-current="page">2</span> <a class="text-black underline" href="#">3</a></span>`,
}));

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          "Use Pagination for Holo's page links, as on the discussion board: `View page:` and then one PaginationItem per page. A page served with [[ ]] data writes the items in a [[ range ]], one static PaginationItem for the current page and one for the others.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: pages },
  parameters: {
    docs: { description: { story: "Three pages with the second one current, which shows as plain text." } },
  },
};
