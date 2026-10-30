import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Notice from "../components/notice.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Invalid username or password.</p>" }));

const meta = {
  title: "Components/Notice",
  component: Notice,
  parameters: {
    docs: {
      description: {
        component:
          "Use Notice for a short message in a form or above a page, such as an error after a failed sign-in. It renders centred white text on a rounded coloured box, and `variant` changes only the colour.",
      },
    },
  },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Red: Story = {
  args: { children: content, variant: "red" },
  parameters: {
    docs: { description: { story: "The default variant. Use it for errors." } },
  },
};

export const Green: Story = {
  args: { children: content, variant: "green" },
  parameters: {
    docs: { description: { story: "Use it to confirm that something worked." } },
  },
};

export const Orange: Story = {
  args: { children: content, variant: "orange" },
  parameters: {
    docs: { description: { story: "Use it for warnings." } },
  },
};

export const Blue: Story = {
  args: { children: content, variant: "blue" },
  parameters: {
    docs: { description: { story: "Use it for neutral information." } },
  },
};

export const DarkGray: Story = {
  args: { children: content, variant: "darkgray" },
  parameters: {
    docs: { description: { story: "Use it for fine print, such as the terms of service." } },
  },
};
