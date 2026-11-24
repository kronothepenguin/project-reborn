import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Card from "../components/card.svelte";
import CardColors from "./__fixtures__/card-colors.svelte";

const header = createRawSnippet(() => ({ render: () => "<h2>Profile</h2>" }));
const body = createRawSnippet(() => ({
  render: () => "<p>Card body content.</p>",
}));

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Use Card to group related content, as Holo's box. It sits on Paper and takes an optional title bar, bold and bigger than the body, in one of Holo's colours, over a body inset as Holo's.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header,
    children: body,
    color: "lightblue",
  },
};

export const WhiteHeader: Story = {
  args: {
    header,
    children: body,
    color: "white",
  },
};

export const Colors: StoryObj<typeof CardColors> = {
  render: () => ({ Component: CardColors }),
  parameters: { docs: { description: { story: "Every title bar colour, each the closest class of Holo's hue." } } },
};
