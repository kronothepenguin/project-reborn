import { session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export default async function (t) {
  const { base, check, hk, restart } = t;

  async function setClosed(closed) {
    const { context, page } = await session(t, "Admin-1");
    await page.goto(`${hk}/settings?section=maintenance`);
    await page.selectOption(
      'select[name="site.maintenance"]',
      closed ? "1" : "0",
    );
    await page.getByRole("button", { name: "Apply" }).click();
    await page.waitForURL(/saved=1/);
    check(
      `housekeeping says it ${closed ? "closed" : "opened"} the site`,
      (await page.getByRole("status").innerText()) ===
        "Settings saved successfully.",
    );
    check(
      "the form keeps the choice",
      (await page.inputValue('select[name="site.maintenance"]')) ===
        (closed ? "1" : "0"),
    );
    await context.close();
  }

  async function cmsStatus() {
    const { context, page } = await session(t);
    const response = await page.goto(`${base}/`);
    const text = await page.content();
    await context.close();
    return {
      status: response.status(),
      maintenance: text.includes("hit the wrong switch"),
    };
  }

  await setClosed(true);
  {
    const { status, maintenance } = await cmsStatus();
    check(
      "a running stand-alone CMS has not seen the change yet",
      status === 200 && !maintenance,
      String(status),
    );
  }
  await restart("cms");
  {
    const { status, maintenance } = await cmsStatus();
    check(
      "after its restart the CMS shows the maintenance page",
      status === 503 && maintenance,
      String(status),
    );
    const { context, page } = await session(t);
    const response = await page.goto(`${base}/register`);
    check("every page is closed", response.status() === 503);
    await context.close();
  }
  await setClosed(false);
  await restart("cms");
  {
    const { status, maintenance } = await cmsStatus();
    check(
      "with the row deleted and a restart the CMS is back",
      status === 200 && !maintenance,
      String(status),
    );
  }
}
