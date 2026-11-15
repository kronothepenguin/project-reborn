import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Icon from "./icon.svelte";
import "../styles.css";

const positions = {
  search: "0px 0px",
  envelope: "0px -49px",
  save: "0px -96px",
  cancel: "0px -145px",
  edit: "0px -193px",
  purse: "0px -241px",
  newtopic: "0px -289px",
} as const;

function icon(props: Record<string, unknown> = {}) {
  const { container } = render(Icon, { props });
  return container.querySelector("span") as HTMLSpanElement;
}

describe("Icon", () => {
  it("shows 16 pixels of the sprite without repeating it", () => {
    const style = getComputedStyle(icon());
    expect(style.backgroundImage).toContain("button_icons2");
    expect(style.backgroundRepeat).toBe("no-repeat");
    expect(style.width).toBe("16px");
    expect(style.height).toBe("16px");
  });

  it("can sit inside a button, which allows only inline content", () => {
    expect(icon().tagName).toBe("SPAN");
    expect(getComputedStyle(icon()).display).toBe("inline-block");
  });

  it("is hidden from assistive technology", () => {
    expect(icon().getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the sprite position of Holo's variant", () => {
    for (const [variant, position] of Object.entries(positions)) {
      expect(getComputedStyle(icon({ variant })).backgroundPosition).toBe(position);
    }
  });
});
