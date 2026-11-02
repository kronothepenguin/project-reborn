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
    (await page.inputValue('input[name="email"]')) === "frank@example.com" &&
      habboPage.includes("Frank"),
    habboPage,
  );
  check(
    "the habbo page shows the IP history",
    habboPage.includes("10.1.2.3") && habboPage.includes("WHOIS"),
    habboPage,
  );

  const frankStaffURL = page.url();
  const motto = 'Seen by <staff> & "friends"';
  await page.fill('input[name="motto"]', motto);
  await page.getByRole("button", { name: "Save Habbo" }).click();
  await page.waitForURL(/saved=1/);
  check(
    "a saved habbo says so",
    (await page.getByRole("status").innerText()).includes(
      "User updated successfully.",
    ),
  );
  check(
    "the motto comes back as it was typed",
    (await page.inputValue('input[name="motto"]')) === motto,
  );

  await page.fill('input[name="email"]', "frank.new@example.com");
  await page.fill('input[name="tickets"]', "12");
  await page.check('input[name="newsletter"]');
  await page.getByRole("button", { name: "Save User" }).click();
  await page.waitForURL(/saved=1/);
  check(
    "the owner's form saves and comes back to the habbo",
    page.url().startsWith(frankStaffURL) &&
      (await page.inputValue('input[name="email"]')) ===
        "frank.new@example.com" &&
      (await page.inputValue('input[name="tickets"]')) === "12" &&
      (await page.isChecked('input[name="newsletter"]')),
  );

  await page.fill('input[name="figure"]', "not a figure");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Habbo" }).click();
  check("a bad figure answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "a bad figure is explained",
    (await page.getByRole("alert").innerText()).includes("not valid"),
  );

  await page.goto(frankStaffURL);
  await page.fill('input[name="badge"]', "adm");
  await page.getByRole("button", { name: "Give badge" }).click();
  await page.waitForURL(/given=1/);
  check(
    "a badge is given and worn",
    (await page.getByRole("status").innerText()).includes(
      "Gave the user this badge (ADM)",
    ) && (await page.getByRole("row", { name: /^ADM/ }).innerText()).includes("Yes"),
  );
  await page.getByRole("row", { name: /^ADM/ }).getByRole("button", { name: "Remove" }).click();
  await page.waitForURL(/removed=1/);
  check(
    "a badge is removed",
    (await page.locator("main").innerText()).includes("This habbo has no badges."),
  );

  await page.goto(frankStaffURL);
  await page.fill('input[name="amount"]', "250");
  await page.getByRole("button", { name: "Give Credits" }).click();
  await page.waitForURL(/gave=250/);
  check(
    "credits are given",
    (await page.getByRole("status").innerText()).includes(
      "Gave user FrankStaff 250 credits.",
    ),
  );
  await page.fill('input[name="amount"]', "-251");
  const debit = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Give Credits" }).click();
  check("a wallet cannot go below zero", (await debit).status() === 422);
  await page.waitForLoadState();
  await page.getByRole("link", { name: "Transaction logs" }).click();
  await page.waitForURL(/transactions$/);
  await shot(page, "transactions");
  const ledger = await page.locator("main table").first().innerText();
  check(
    "the ledger shows the transfer and the habbo",
    ["FrankStaff", "Housekeeping transfer/refund", "250"].every((text) =>
      ledger.includes(text),
    ) && !ledger.includes("-251"),
    ledger,
  );

  await page.goto(`${hk}/habbos?q=Admin-1`);
  await page.getByRole("row", { name: /Admin-1/ }).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/habbos\/\d+$/);
  await page.fill('input[name="motto"]', "My own");
  const own = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Habbo" }).click();
  check("nobody edits themselves", (await own).status() === 422);
  await page.waitForLoadState();
  check(
    "the refusal is explained",
    (await page.getByRole("alert").innerText()).includes("below your level"),
  );

  await page.goto(`${hk}/logs`);
  const logs = await page.locator("main table").first().innerText();
  check(
    "the staff log has the edits and the refusal",
    [
      "habbos.update",
      "users.update",
      "users.refused",
      "badges.give",
      "badges.delete",
      "credits.give",
    ].every((action) =>
      logs.includes(action),
    ),
    logs,
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();
}
