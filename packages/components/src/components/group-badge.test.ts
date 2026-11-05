import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import GroupBadge from "./group-badge.svelte";

const code = "b0503Xs09114s05013s05015";

describe("GroupBadge", () => {
  it("shows the badge the CMS draws for the code", () => {
    const { container } = render(GroupBadge, { props: { code } });
    expect(container.querySelector("img")?.getAttribute("src")).toBe(`/habbo-imaging/badge/${code}`);
  });

  it("keeps a template placeholder, which the server fills in", () => {
    const { container } = render(GroupBadge, { props: { code: "[[ .Badge ]]" } });
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/habbo-imaging/badge/[[ .Badge ]]");
  });

  it("is decorative unless it gets an alt text", () => {
    const { container: plain } = render(GroupBadge, { props: { code } });
    const { container: named } = render(GroupBadge, { props: { code, alt: "Cool Kids" } });
    expect(plain.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(named.querySelector("img")?.getAttribute("alt")).toBe("Cool Kids");
  });

  it("forwards native attributes and not its own props", () => {
    const { container } = render(GroupBadge, {
      props: { code, title: "Cool Kids", class: "float-left", "data-testid": "badge" },
    });
    const image = container.querySelector("img");
    expect(image?.getAttribute("title")).toBe("Cool Kids");
    expect(image?.getAttribute("class")).toBe("float-left");
    expect(image?.getAttribute("data-testid")).toBe("badge");
    expect(image?.hasAttribute("code")).toBe(false);
  });
});
