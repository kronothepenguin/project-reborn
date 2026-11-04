import type { Meta, StoryObj } from "@storybook/svelte-vite";
import BBCodeEditor from "../components/bbcode-editor.svelte";

const sample =
  "Welcome to the [b]hotel[/b]! Read the [url=https://hotel.example/news]news[/url].\n[quote]Be [i]nice[/i] to each other.[/quote][color=red]Red[/color], [size=small]small[/size] and [size=large]large[/size] :)";

const meta = {
  title: "Components/BBCodeEditor",
  component: BBCodeEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Use BBCodeEditor wherever a field takes BBCode. It shows the text as the site will, writes BBCode back, and its `BBCode` button shows the raw codes. Give `field` the id of a textarea to stand in for it in a form; without JavaScript that textarea stays the plain field. Set `smilies` where the page shows them, and `variant` to the site's or housekeeping's look.",
      },
    },
  },
} satisfies Meta<typeof BBCodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Site: Story = {
  args: { value: sample, smilies: true, variant: "site", label: "Note text", rows: 7 },
  parameters: {
    docs: {
      description: {
        story: "The site's look, with smilies, as the home notes and the forum use it.",
      },
    },
  },
};

export const Housekeeping: Story = {
  args: { value: sample, variant: "housekeeping", label: "Story", rows: 5 },
  parameters: {
    docs: {
      description: {
        story: "Housekeeping's look, without smilies, as the news story and the staff boxes use it.",
      },
    },
  },
};
