import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => {
  seedStaff(sql);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  const [[habbo]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  sql(`INSERT INTO login_attempts (user_id, avatar_id, ip, succeeded, created_at)
    VALUES (${frank}, ${habbo}, '10.1.2.3', TRUE, '2026-11-01 12:00:00.000000000+00:00')`);
};

export default async function (t) {
  const { check, hk, shot } = t;

  const { context, page, problems } = await session(t, "Admin-1");

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "User Listing" }).click();
  await page.waitForURL("**/housekeeping/habbos");
  await shot(page, "user-listing");
  const listing = await page.locator("main table").first().innerText();
  check(
    "the listing has Holo's columns",
    ["ID", "Name", "E-Mail Address", "Join date", "Last Activity", "Edit"].every(
      (column) => listing.includes(column),
    ),
    listing,
  );
  check(
    "the listing shows the owner's address and last IP",
    listing.includes("frank@example.com") && listing.includes("10.1.2.3"),
    listing,
  );

  await page.fill('input[name="q"]', "10.1.2.3");
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/q=10\.1\.2\.3/);
  const clones = await page.locator("main table").first().innerText();
  check(
    "a search by address finds the user's habbos",
    clones.includes("Frank") &&
      clones.includes("FrankStaff") &&
      !clones.includes("Visitor"),
    clones,
  );

  await page.getByRole("row", { name: /FrankStaff/ }).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/habbos\/\d+$/);
  await shot(page, "habbo");
  const habboPage = await page.locator("main").innerText();
  check(
    "the habbo page shows the owner and the other habbo",
    habboPage.includes("frank@example.com") && habboPage.includes("Frank"),
    habboPage,
  );
  check(
    "the habbo page shows the IP history",
    habboPage.includes("10.1.2.3") && habboPage.includes("WHOIS"),
    habboPage,
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();
}
