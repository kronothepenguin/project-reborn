import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Avatar from "./avatar.svelte";

const imagingUrl = "https://imager.example/avatarimage";
const figure = "hd-180-1.ch-215-82.lg-270-82";

describe("Avatar", () => {
  it("builds the imager URL with Holo's defaults", () => {
    const { container } = render(Avatar, { props: { imagingUrl, figure } });
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      `${imagingUrl}?figure=${figure}&size=b&direction=4&head_direction=4&gesture=sml`,
    );
  });

  it("uses the given size, directions and gesture", () => {
    const { container } = render(Avatar, {
      props: { imagingUrl, figure, size: "s", direction: 2, headDirection: 3, gesture: "agr" },
    });
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      `${imagingUrl}?figure=${figure}&size=s&direction=2&head_direction=3&gesture=agr`,
    );
  });

  it("keeps template placeholders, which the server fills in", () => {
    const { container } = render(Avatar, {
      props: { imagingUrl: "[[ .ImagingURL ]]", figure: "[[ .Figure ]]" },
    });
    const src = container.querySelector("img")?.getAttribute("src");
    expect(src).toContain("[[ .ImagingURL ]]?figure=[[ .Figure ]]&size=b");
  });

  it("is decorative unless it gets an alt text", () => {
    const { container: plain } = render(Avatar, { props: { imagingUrl, figure } });
    const { container: named } = render(Avatar, { props: { imagingUrl, figure, alt: "Admin" } });
    expect(plain.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(named.querySelector("img")?.getAttribute("alt")).toBe("Admin");
  });

  it("forwards native attributes", () => {
    const { container } = render(Avatar, {
      props: { imagingUrl, figure, loading: "lazy", "data-testid": "avatar" },
    });
    const image = container.querySelector("img");
    expect(image?.getAttribute("loading")).toBe("lazy");
    expect(image?.getAttribute("data-testid")).toBe("avatar");
  });

  it("does not forward its own props as attributes", () => {
    const { container } = render(Avatar, { props: { imagingUrl, figure } });
    const image = container.querySelector("img") as HTMLImageElement;
    for (const name of ["imagingurl", "figure", "size", "direction", "headdirection", "gesture"]) {
      expect(image.hasAttribute(name)).toBe(false);
    }
  });
});
