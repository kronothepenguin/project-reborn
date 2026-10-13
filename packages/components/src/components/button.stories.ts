import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { createRawSnippet } from "svelte";
import Button from "../components/button.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Sign in</span>" }));

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Use Button to trigger an action. It renders a native <button> and forwards every button attribute. Hover, focus, and active states are native; their styling arrives with the look & feel.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: label } };
export const Hover: Story = { args: { children: label } };
export const Focus: Story = { args: { children: label, autofocus: true } };
export const Active: Story = { args: { children: label } };
export const Disabled: Story = { args: { children: label, disabled: true } };