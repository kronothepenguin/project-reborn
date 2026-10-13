import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import Dialog from "./dialog.svelte";
import MenuFixture from "./__fixtures__/menu.svelte";
import TabsFixture from "./__fixtures__/tabs.svelte";
import FormField from "./form-field.svelte";

describe("accessibility roles", () => {
  it("exposes the tabs pattern roles", () => {
    render(TabsFixture, {
      props: {
        tabs: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      },
    });
    expect(page.getByRole("tablist").query()).toBeTruthy();
    expect(page.getByRole("tab", { name: "Alpha" }).query()).toBeTruthy();
    expect(page.getByRole("tabpanel").query()).toBeTruthy();
  });

  it("exposes the menu pattern roles", async () => {
    const { container } = render(MenuFixture, {
      props: { label: "Account", items: [{ value: "a", label: "Alpha", selected: true }] },
    });
    await fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(page.getByRole("menu").query()).toBeTruthy();
    expect(page.getByRole("menuitemradio", { name: "Alpha" }).query()).toBeTruthy();
  });

  it("exposes the dialog role with its accessible name", () => {
    const children = createRawSnippet(() => ({ render: () => "<p>Body</p>" }));
    render(Dialog, { props: { children, open: true, label: "Example" } });
    expect(page.getByRole("dialog", { name: "Example" }).query()).toBeTruthy();
  });

  it("gives the form control its accessible name from the wrapping label", () => {
    const control = createRawSnippet(() => ({
      render: () => '<input name="email" type="email" />',
    }));
    render(FormField, { props: { label: "Email", children: control } });
    expect(page.getByRole("textbox", { name: "Email" }).query()).toBeTruthy();
  });
});