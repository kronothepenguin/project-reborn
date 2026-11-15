import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Menu from "./__fixtures__/menu.svelte";

const meta = {
  title: "Components/Menu item",
  component: Menu,
  parameters: {
    docs: {
      description: {
        component:
          "Use Menu item for a selectable entry inside a Menu. It reports its value through the Menu's onselect and supports selected and disabled states.",
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: "Menu", items: [{ value: "a", label: "Item" }] } };

export const Disabled: Story = {
  args: { label: "Menu", items: [{ value: "a", label: "Item" }, { value: "b", label: "Disabled item", disabled: true }] },
  parameters: { docs: { description: { story: "A disabled item stays in the list and ignores a press." } } },
};
