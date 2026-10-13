import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts", "../src/**/*.mdx"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/svelte-vite",
};

export default config;