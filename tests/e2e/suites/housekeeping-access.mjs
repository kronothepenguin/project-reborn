import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

const everyRoute = [
  ["GET", "/"],
  ["POST", "/note"],
  ["POST", "/logout"],
  ["GET", "/settings"],
  ["POST", "/settings/site"],
  ["GET", "/access-groups"],
  ["POST", "/access-groups"],
  ["GET", "/access-groups/1"],
  ["POST", "/access-groups/1"],
  ["POST", "/access-groups/1/delete"],
  ["POST", "/users/1/access-groups"],
  ["GET", "/logs"],
  ["GET", "/habbos"],
  ["GET", "/habbos/1"],
  ["POST", "/habbos/1"],
  ["POST", "/habbos/1/badges"],
  ["POST", "/habbos/1/badges/ADM/delete"],
  ["POST", "/users/1"],
  ["GET", "/settings.html"],
  ["GET", "/index.html"],
  ["GET", "/favicon.svg"],
];

// A browser sends Origin and Sec-Fetch-Site by itself, so a real same-origin form
// post is built on a page of the site, and the status is read from its response.
async function status(hk, page, method, path) {
  const url = `${hk}${path}`;
  return page.evaluate(
    async ({ method, url }) => {
      const response = await fetch(url, {
        method,
        redirect: "manual",
        body: method === "POST" ? new URLSearchParams({ x: "1" }) : undefined,
      });
      return response.type === "opaqueredirect" ? 303 : response.status;
    },
    { method, url },
  );
}

export default async function (t) {
  const { base: cms, check, hk, shot, sql } = t;

  {
    const { context, page } = await session(t);
    await page.goto(`${hk}/`);
    check("a guest ends on the CMS", page.url().startsWith(cms), page.url());
    const request = context.request;
    for (const [method, path] of everyRoute) {
      const response = await request.fetch(`${hk}${path}`, {
        method,
        maxRedirects: 0,
      });
      check(
        `guest ${method} ${path} goes to site.url`,
        response.status() === 303 && response.headers().location === cms,
        `${response.status()} ${response.headers().location}`,
      );
    }
    await context.close();
  }

  {
    const { context, page } = await session(t, "Visitor");
    const request = context.request;
    for (const [method, path] of everyRoute) {
      const response = await request.fetch(`${hk}${path}`, {
        method,
        maxRedirects: 0,
      });
      check(
        `non-staff ${method} ${path} gets 403`,
        response.status() === 403,
        String(response.status()),
      );
    }
    await page.goto(`${hk}/`);
    check(
      "a 403 shows no housekeeping",
      !(await page.content()).includes("Logged in as"),
    );
    await context.close();
  }

  {
    const { context, page } = await session(t, "Outsider");
    for (const [method, path] of everyRoute) {
      const response = await context.request.fetch(`${hk}${path}`, {
        method,
        maxRedirects: 0,
      });
      check(
        `attributes without housekeeping.access: ${method} ${path} gets 403`,
        response.status() === 403,
        String(response.status()),
      );
    }
    await page.close();
    await context.close();
  }

  {
    const { context, page, problems } = await session(t, "Helper");
    await page.goto(`${hk}/`);
    check(
      "staff with housekeeping.access enter",
      (await page.locator("h1").innerText()).includes("Housekeeping"),
    );
    await page.fill('textarea[name="notes"]', "From a helper");
    await page.getByRole("button", { name: "Save Admin Notes" }).click();
    await page.waitForLoadState();
    check(
      "any staff can save the note",
      (await page.inputValue('textarea[name="notes"]')) === "From a helper",
    );
    check(
      "a helper does not see addresses",
      !(await page.content()).includes("admin@example.com"),
    );
    for (const path of [
      "/settings",
      "/access-groups",
      "/access-groups/1",
      "/logs",
    ]) {
      const response = await page.goto(`${hk}${path}`);
      check(
        `a helper on ${path} gets Access Denied in the layout`,
        response.status() === 403 &&
          (await page.locator("h1").innerText()) === "Access Denied" &&
          (await page.locator("header").innerText()).includes("Helper"),
      );
    }
    await shot(page, "denied");
    for (const path of [
      "/settings/site",
      "/access-groups",
      "/access-groups/1",
      "/users/1/access-groups",
    ]) {
      check(
        `a helper's POST ${path} gets 403`,
        (await status(hk, page, "POST", path)) === 403,
      );
    }
    check(
      "no page failed for the helper",
      problems.length === 0,
      problems.join(", "),
    );
    await context.close();
  }

  {
    const { context, page } = await session(t, "Helper");
    sql(
      "INSERT INTO bans (user_id, reason, created_at) SELECT id, 'Scamming', '2026-01-01 00:00:00' FROM users WHERE email = 'helper@example.com'",
    );
    await page.goto(`${hk}/`);
    check(
      "a banned user reads Holo's message on the CMS",
      page.url().startsWith(cms) &&
        (await page
          .getByText(
            'You have been banned! The reason for this ban is "Scamming".',
          )
          .isVisible()),
      page.url(),
    );
    await page.goto(`${cms}/me`);
    check("and the session has ended", page.url() === `${cms}/`, page.url());
    await context.close();
  }
}
