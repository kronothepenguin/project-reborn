import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { page, userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";
import BBCodeEditor from "./bbcode-editor.svelte";
import EditorFixture from "./__fixtures__/bbcode-editor.svelte";

let forms: HTMLFormElement[] = [];

afterEach(() => {
  for (const form of forms) form.remove();
  forms = [];
});

// setup puts a form with the story textarea on the page and the editor in its
// place, as housekeeping does.
function setup(text = "", props: Record<string, unknown> = {}) {
  const form = document.createElement("form");
  const field = document.createElement("textarea");
  field.id = "story";
  field.name = "story";
  field.value = text;
  form.append(field);
  document.body.append(form);
  forms.push(form);
  const { container, unmount } = render(BBCodeEditor, { props: { field: "story", label: "Story", ...props } });
  const area = container.querySelector("[contenteditable]") as HTMLDivElement;
  return { form, field, area, container, unmount };
}

const settle = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done, 0)));

// selectText selects the first occurrence of text in the area, and lets the
// editor see the selection.
async function selectText(area: HTMLElement, text: string) {
  area.focus();
  const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const at = (node as Text).data.indexOf(text);
    if (at >= 0) {
      document.getSelection()?.setBaseAndExtent(node, at, node, at + text.length);
      await settle();
      return;
    }
  }
  throw new Error(`no ${text} in ${area.innerHTML}`);
}

async function caretAtEnd(area: HTMLElement) {
  area.focus();
  const range = document.createRange();
  range.selectNodeContents(area);
  range.collapse(false);
  document.getSelection()?.removeAllRanges();
  document.getSelection()?.addRange(range);
  await settle();
}

const button = (name: string) => page.getByRole("button", { name, exact: true });

describe("BBCodeEditor", () => {
  it("shows the field's BBCode as the site will, and hides the field", () => {
    const { field, area } = setup("[b]bold[/b] [color=red]red[/color]\n[quote]said[/quote]");
    expect(field.hidden).toBe(true);
    expect(area.querySelector("strong")?.textContent).toBe("bold");
    expect(area.querySelector("font.text-red-600")?.textContent).toBe("red");
    expect(area.querySelector("br")).not.toBeNull();
    expect(area.querySelector("div.bg-stone-300")?.textContent).toBe("said");
  });

  it("writes what is typed into the field, with Enter as a line break", async () => {
    const { field, area, form } = setup();
    await userEvent.click(area);
    await userEvent.keyboard("Hello{Enter}world");
    expect(field.value).toBe("Hello\nworld");
    expect(new FormData(form).get("story")).toBe("Hello\nworld");
    expect(area.querySelector("div, p")).toBeNull();
  });

  it("makes the selection bold, and plain again", async () => {
    const { field, area } = setup("Hello world");
    await selectText(area, "world");
    await userEvent.click(button("Bold"));
    expect(field.value).toBe("Hello [b]world[/b]");
    expect(area.querySelector("strong")?.textContent).toBe("world");
    await selectText(area, "world");
    expect(button("Bold").element().getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(button("Bold"));
    expect(field.value).toBe("Hello world");
  });

  it("applies italic, underline and strike", async () => {
    const { field, area } = setup("one two three");
    await selectText(area, "one");
    await userEvent.click(button("Italic"));
    await selectText(area, "two");
    await userEvent.click(button("Underline"));
    await selectText(area, "three");
    await userEvent.click(button("Strike"));
    expect(field.value).toBe("[i]one[/i] [u]two[/u] [s]three[/s]");
  });

  it("types bold after the shortcut, written as the renderer's strong", async () => {
    const { field, area } = setup();
    await userEvent.click(area);
    await userEvent.keyboard("a{Control>}b{/Control}b");
    expect(field.value).toBe("a[b]b[/b]");
    expect(area.querySelector("b")).toBeNull();
  });

  it("colours and sizes the selection", async () => {
    const { field, area } = setup("red small large");
    await selectText(area, "red");
    await userEvent.selectOptions(page.getByRole("combobox", { name: "Colours" }), "red");
    await selectText(area, "small");
    await userEvent.click(button("Small"));
    await selectText(area, "large");
    await userEvent.click(button("Large"));
    expect(field.value).toBe("[color=red]red[/color] [size=small]small[/size] [size=large]large[/size]");
    expect(area.querySelector("font.text-red-600")?.textContent).toBe("red");
  });

  it("puts the selection in a quote or a code box", async () => {
    const { field, area } = setup("said and done");
    await selectText(area, "said");
    await userEvent.click(button("Quote"));
    await selectText(area, "done");
    await userEvent.click(button("Code"));
    expect(field.value).toBe("[quote]said[/quote] and [code]done[/code]");
  });

  it("puts an empty quote at the caret, with the caret in it", async () => {
    const { field, area } = setup("a");
    await caretAtEnd(area);
    await userEvent.click(button("Quote"));
    await userEvent.keyboard("b");
    expect(field.value).toMatch(/^a\[quote\]b\n?\[\/quote\]$/);
  });

  it("links the selection to an http or https address only", async () => {
    const { field, area } = setup("our news");
    await selectText(area, "news");
    await userEvent.click(button("Link"));
    const input = page.getByRole("textbox", { name: "Address" });
    await userEvent.fill(input, "javascript:alert(1)");
    await userEvent.click(button("Add link"));
    expect(page.getByRole("alert").element().textContent).toBe("The address must start with http:// or https://.");
    await userEvent.fill(input, "https://hotel.example/news");
    await userEvent.click(button("Add link"));
    expect(field.value).toBe("our [url=https://hotel.example/news]news[/url]");
    await selectText(area, "news");
    await userEvent.click(button("Link"));
    await userEvent.click(button("Remove link"));
    expect(field.value).toBe("our news");
  });

  it("adds smilies when the field shows them", async () => {
    const { field, area } = setup("hi", { smilies: true });
    await caretAtEnd(area);
    await userEvent.click(button("Smiley :)"));
    await userEvent.keyboard("!");
    expect(field.value).toBe("hi:)!");
    expect(area.querySelector('img[data-code=":)"]')).not.toBeNull();
  });

  it("offers no smilies where the field does not show them", () => {
    setup("hi :)");
    expect(page.getByRole("button", { name: "Smiley :)" }).query()).toBeNull();
    expect(document.querySelector("[contenteditable] img")).toBeNull();
  });

  it("edits the raw codes in the BBCode view", async () => {
    const { field, area } = setup("[b]x[/b]");
    await userEvent.click(button("BBCode"));
    const raw = page.getByRole("textbox", { name: "Story (BBCode)" });
    expect((raw.element() as HTMLTextAreaElement).value).toBe("[b]x[/b]");
    expect(area.hidden).toBe(true);
    expect(button("Bold").element().hasAttribute("disabled")).toBe(true);
    await userEvent.fill(raw, "[i]y[/i]");
    expect(field.value).toBe("[i]y[/i]");
    await userEvent.click(button("BBCode"));
    expect(area.hidden).toBe(false);
    expect(area.querySelector("em")?.textContent).toBe("y");
  });

  it("keeps on paste what BBCode can say", async () => {
    const { field, area } = setup("x");
    await caretAtEnd(area);
    const data = new DataTransfer();
    data.setData(
      "text/html",
      '<h1>Title</h1><p>Some <b>bold</b>, <a href="https://a.example/">a link</a> and <span style="color: red; font-size: 40px">loud</span>.</p><img src="x.png">',
    );
    area.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await tick();
    expect(field.value).toBe("x\nTitle\nSome [b]bold[/b], [url=https://a.example/]a link[/url] and loud.");
    expect(area.querySelector("img, h1, p, span")).toBeNull();
  });

  it("adds no empty line where a pasted block meets the edge of a line", async () => {
    const { field, area } = setup("");
    await caretAtEnd(area);
    const data = new DataTransfer();
    data.setData("text/html", "<p>one</p><p>two</p>");
    area.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await tick();
    expect(field.value).toBe("one\ntwo");
  });

  it("pastes plain text with its lines", async () => {
    const { field, area } = setup("");
    await caretAtEnd(area);
    const data = new DataTransfer();
    data.setData("text/plain", "one\r\ntwo");
    area.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await tick();
    expect(field.value).toBe("one\ntwo");
  });

  it("undoes and redoes typing and the toolbar's changes", async () => {
    const { field, area } = setup("Hello world");
    await selectText(area, "world");
    await userEvent.click(button("Bold"));
    expect(field.value).toBe("Hello [b]world[/b]");
    await userEvent.keyboard("{Control>}z{/Control}");
    expect(field.value).toBe("Hello world");
    await userEvent.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    expect(field.value).toBe("Hello [b]world[/b]");
    await caretAtEnd(area);
    await userEvent.keyboard("!!");
    expect(field.value).toBe("Hello [b]world!![/b]");
    await userEvent.keyboard("{Control>}z{/Control}");
    expect(field.value).toBe("Hello [b]world[/b]");
  });

  it("shows another value given from outside", async () => {
    const { container } = render(EditorFixture, { props: { initial: "[u]first[/u]" } });
    const area = container.querySelector("[contenteditable]") as HTMLDivElement;
    expect(area.querySelector("u")?.textContent).toBe("first");
    await userEvent.click(page.getByRole("button", { name: "Replace" }));
    expect(area.querySelector("s")?.textContent).toBe("second");
    await caretAtEnd(area);
    await userEvent.keyboard("!");
    expect(page.getByTestId("value").element().textContent).toBe("[s]second![/s]");
  });

  it("has the housekeeping look in housekeeping", () => {
    const { container } = setup("", { variant: "housekeeping" });
    expect(container.querySelector('[role="toolbar"] button')?.classList.contains("bg-olive-200")).toBe(true);
    expect(container.querySelector("[contenteditable]")?.classList.contains("border-neutral-600")).toBe(true);
  });

  it("takes its name and its height from the field it stands in for", () => {
    const form = document.createElement("form");
    form.innerHTML = '<label for="box"><strong>Staff Content Box 1</strong></label><textarea id="box" rows="8">x</textarea>';
    document.body.append(form);
    forms.push(form);
    const { container } = render(BBCodeEditor, { props: { field: "box" } });
    const area = container.querySelector("[contenteditable]") as HTMLDivElement;
    expect(area.getAttribute("aria-label")).toBe("Staff Content Box 1");
    expect(area.style.minHeight).toBe("12em");
  });

  it("gives the field back when it goes", () => {
    const { field, unmount } = setup("x");
    expect(field.hidden).toBe(true);
    unmount();
    expect(field.hidden).toBe(false);
  });
});
