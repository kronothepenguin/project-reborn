import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

export default async function (t) {
  const { check, hk, shot } = t;

  const { context, page, problems } = await session(t, "Admin-1");

  await page.goto(`${hk}/`);
  await page.fill('textarea[name="notes"]', "From the administrator");
  await page.getByRole("button", { name: "Save Admin Notes" }).click();
  await page.waitForLoadState();

  await page.goto(`${hk}/access-groups`);
  await shot(page, "groups");
  check(
    "the tab is active",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Users & Moderation",
  );
  const listed = await page.locator("main table").first().innerText();
  check(
    "the groups are listed",
    listed.includes("Administrators") && listed.includes("Helpers"),
  );

  await page.fill('input[name="name"]', "Moderators");
  await page.fill('input[name="description"]', 'They <moderate> & "care"');
  await page.getByRole("button", { name: "Create Group" }).click();
  await page.waitForURL(/access-groups\/\d+$/);
  const groupURL = page.url();
  check(
    "a new group opens its page",
    (await page.inputValue('input[name="description"]')) ===
      'They <moderate> & "care"',
  );
  const boxes = await page.locator('input[name="attribute"]').count();
  check(
    "every attribute of the catalogue has a checkbox",
    boxes === 19,
    String(boxes),
  );

  await page.fill('input[name="name"]', "administrators");
  const taken = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Group" }).click();
  check("a taken name answers 422", (await taken).status() === 422);
  await page.waitForLoadState();
  check(
    "a taken name is explained",
    (await page.getByRole("alert").innerText()).includes("already exists"),
  );
  await page.goto(groupURL);

  await page.check('input[name="attribute"][value="housekeeping.access"]');
  await page.check('input[name="attribute"][value="housekeeping.logs"]');
  await page.check('input[name="staffListed"]');
  await page.getByRole("button", { name: "Save Group" }).click();
  await page.waitForURL(/saved=1/);
  check(
    "the save is confirmed",
    (await page.getByRole("status").innerText()).includes(
      "updated successfully",
    ),
  );
  check(
    "the ticks stay",
    await page.isChecked('input[name="attribute"][value="housekeeping.logs"]'),
  );
  check(
    "the staff flag stays",
    await page.isChecked('input[name="staffListed"]'),
  );

  await page.fill('input[name="habbo"]', "NoSuchHabbo");
  await page.getByRole("button", { name: "Find User" }).click();
  await page.waitForLoadState();
  check(
    "an unknown user is explained",
    (await page.getByRole("alert").innerText()).includes("does not exist"),
  );

  await page.fill('input[name="habbo"]', "Frank");
  await page.getByRole("button", { name: "Find User" }).click();
  await page.waitForLoadState();
  const options = await page
    .locator('select[name="habbo"]')
    .last()
    .locator("option")
    .allInnerTexts();
  check(
    "both of Frank's habbos are offered",
    options.join() === "Frank,FrankStaff",
    options.join(),
  );
  await page.locator("#found-habbo").selectOption({ label: "FrankStaff" });
  await shot(page, "group");
  await page.getByRole("button", { name: "Add To Group" }).click();
  await page.waitForURL(/saved=1/);
  const members = await page.locator("main section").nth(1).innerText();
  check(
    "Frank is a member under his display habbo",
    members.includes("FrankStaff (ID:"),
    members.replace(/\s+/g, " ").slice(0, 120),
  );

  {
    const frank = await session(t, "Frank");
    const response = await frank.page.goto(`${hk}/logs`);
    check("Frank now enters and reads the log", response.status() === 200);
    await frank.context.close();
  }

  await page
    .locator("main section")
    .nth(1)
    .locator('select[name="habbo"]')
    .selectOption({ label: "Frank" });
  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Save" })
    .click();
  await page.waitForURL(/saved=1/);
  check(
    "the display habbo changed",
    (await page.locator("main section").nth(1).innerText()).includes(
      "Frank (ID:",
    ),
  );

  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Remove" })
    .click();
  await page.waitForURL(/saved=1/);
  check(
    "Frank left",
    (await page.locator("main section").nth(1).innerText()).includes(
      "This group has no members.",
    ),
  );

  await page.goto(`${hk}/access-groups`);
  await page.getByRole("link", { name: "Administrators" }).click();
  await page.waitForURL(/access-groups\/\d+$/);
  await page.uncheck(
    'input[name="attribute"][value="housekeeping.accessGroups"]',
  );
  const denied = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Group" }).click();
  check(
    "EXIT: taking housekeeping.accessGroups from its last holder answers 422",
    (await denied).status() === 422,
  );
  await page.waitForLoadState();
  check(
    "EXIT: the refusal is explained",
    (await page.getByRole("alert").innerText()).includes(
      "Access denied. The last user",
    ),
  );
  check(
    "EXIT: the attribute stays ticked",
    await page.isChecked(
      'input[name="attribute"][value="housekeeping.accessGroups"]',
    ),
  );
  await shot(page, "refused");

  await page.uncheck('input[name="attribute"][value="housekeeping.access"]');
  const way = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Group" }).click();
  check("the last manager keeps the way in", (await way).status() === 422);
  await page.waitForLoadState();

  const remove = page.waitForResponse((r) => r.request().method() === "POST");
  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Remove" })
    .click();
  check("the last manager cannot leave", (await remove).status() === 422);
  await page.waitForLoadState();
  check(
    "the last manager is still a member",
    (await page.locator("main section").nth(1).innerText()).includes(
      "Admin-1 (ID:",
    ),
  );

  await page.goto(`${hk}/logs`);
  const log = (await page.locator("main table").innerText()).replace(
    /\s+/g,
    " ",
  );
  for (const action of [
    "accessGroups.create",
    "accessGroups.update",
    "accessGroups.addMember",
    "accessGroups.setDisplayHabbo",
    "accessGroups.removeMember",
    "accessGroups.refused",
    "note.update",
  ]) {
    check(`the log holds ${action}`, log.includes(action));
  }
  await shot(page, "logs");

  const hrefs = await page
    .locator("aside a, nav a")
    .evaluateAll((all) => all.map((a) => a.href));
  for (const href of new Set(hrefs)) {
    const response = await page.goto(href);
    check(`link ${new URL(href).pathname} works`, response.status() === 200);
  }
  await page.goto(`${hk}/`);
  const style = await page.evaluate(() => ({
    padding: getComputedStyle(document.querySelector("main td")).paddingLeft,
    even: getComputedStyle(document.querySelector("main tbody tr:nth-child(2)"))
      .backgroundColor,
    odd: getComputedStyle(document.querySelector("main tbody tr:nth-child(1)"))
      .backgroundColor,
  }));
  check(
    "a served table has its padding and its stripes",
    style.padding === "4px" && style.even !== style.odd,
    JSON.stringify(style),
  );
  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();
}
