import type { Meta, StoryObj } from "@storybook/svelte-vite";
import MenuItem from "../components/menu-item.svelte";
import Menu from "./__fixtures__/menu.svelte";

const meta = {
  title: "Components/Menu item",
  component: MenuItem,
  parameters: {
    docs: {
      description: {
        component:
          "Use Menu item for a selectable entry inside a Menu. It reports its value through the Menu's onselect and supports selected and disabled states.",
      },
    },
  },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({ Component: Menu, props: { label: "Menu", items: [{ value: "a", label: "Item" }] } }),
};
export const Hover: Story = {
  render: () => ({ Component: Menu, props: { label: "Menu", items: [{ value: "a", label: "Item" }] } }),
};
export const Focus: Story = {
  render: () => ({ Component: Menu, props: { label: "Menu", items: [{ value: "a", label: "Item" }] } }),
};
export const Selected: Story = {
  render: () => ({
    Component: Menu,
    props: { label: "Menu", items: [{ value: "a", label: "Item", selected: true }] },
  }),
};
export const Disabled: Story = {
  render: () => ({
    Component: Menu,
    props: { label: "Menu", items: [{ value: "a", label: "Item", disabled: true }] },
  }),
};