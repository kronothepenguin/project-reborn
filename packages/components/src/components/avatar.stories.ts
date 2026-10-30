import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Avatar from "../components/avatar.svelte";

const imagingUrl = "https://www.habbo.com/habbo-imaging/avatarimage";
const figure = "hd-180-1.ch-215-82.lg-270-82";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Use Avatar to show a habbo. It renders an <img> from the imager at `imagingUrl`, which the page passes in from the imaging.avatarUrl setting. Values can be [[ ]] placeholders, which the server fills in and escapes.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { imagingUrl, figure, alt: "A habbo" },
  parameters: {
    docs: {
      description: { story: "The full-body size, facing front-left and smiling." },
    },
  },
};

export const Small: Story = {
  args: { imagingUrl, figure, alt: "A habbo", size: "s" },
  parameters: {
    docs: { description: { story: "Use the small size in lists." } },
  },
};

export const Direction: Story = {
  args: { imagingUrl, figure, alt: "A habbo", direction: 2, headDirection: 3 },
  parameters: {
    docs: {
      description: { story: "`direction` turns the body and `headDirection` turns the head." },
    },
  },
};
