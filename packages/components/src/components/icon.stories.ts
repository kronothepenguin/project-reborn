import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Icon from "../components/icon.svelte";

const onColour = "background-color: var(--color-lime-600)";

const meta = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          "Use Icon inside a button or a link. It shows 16 pixels of Holo's button icon sprite and is hidden from assistive technology, so the control around it needs its own name. `variant` chooses the picture: Save, Cancel and Edit are white, for coloured buttons, and the others are black. Purse is Holo's name for the black check mark.",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Search: Story = {
  args: { variant: "search" },
  parameters: { docs: { description: { story: "The default variant." } } },
};

export const Envelope: Story = { args: { variant: "envelope" } };

export const Save: Story = {
  args: { variant: "save", style: onColour },
};

export const Cancel: Story = {
  args: { variant: "cancel", style: onColour },
};

export const Edit: Story = {
  args: { variant: "edit", style: onColour },
};

export const Purse: Story = { args: { variant: "purse" } };

export const NewTopic: Story = { args: { variant: "newtopic" } };
