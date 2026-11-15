import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// Frank joins the installer's Moderator group, which holds the vouchers, as
// Holo's rank 6 reached them.
export const prepare = ({ sql }) => {
  seedStaff(sql);
  sql(`INSERT INTO access_group_members (access_group_id, user_id, granted_at)
    SELECT access_groups.id, users.id, '2026-11-01 12:00:00.000000000+00:00'
    FROM access_groups, users
    WHERE access_groups.name = 'Moderator' AND users.email = 'frank@example.com'`);
};

// Holo's characters leave out c.
const holoCode = /^[0-9abd-zA-Z]{8}$/;

export default async function (t) {
  const { check, hk, shot, sql } = t;
  const { context, page, problems } = await session(t, "Admin-1");
  const createBox = page.locator("main section").first();
  const listBox = page.locator("main section").nth(1);
  const listed = async () =>
    (await listBox.locator("tbody tr").allInnerTexts()).map((row) =>
      row.split("\t").slice(0, 2).join(" "),
    );
  const post = (label) => {
    const answer = page.waitForResponse((r) => r.request().method() === "POST");
    return page
      .getByRole("button", { name: label })
      .click()
      .then(() => answer);
  };

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Users & Moderation" }).click();
  await page.waitForURL("**/housekeeping/access-groups");
  const boxes = await page.locator("aside section h2").allInnerTexts();
  const credits = await page
    .locator("aside section")
    .filter({ has: page.locator("h2", { hasText: /^Credits$/ }) })
    .locator("a")
    .allInnerTexts();
  check(
    "Voucher Management is in a Credits box between User Management and Moderation, as in Holo's menu",
    boxes.join("|") ===
      "User Management|Credits|Moderation|Customer Support|Logs & Statistics" &&
      credits.join("|") === "Voucher Management",
    `${boxes.join("|")} :: ${credits.join("|")}`,
  );
  await page.getByRole("link", { name: "Voucher Management" }).click();
  await page.waitForURL("**/housekeeping/vouchers");
  check(
    "the vouchers are under Users & Moderation, with Holo's page name",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Users & Moderation" &&
      (await page.title()) === "Project Reborn Housekeeping | Vouchers",
    await page.title(),
  );
  const form = await createBox.innerText();
  const type = createBox.getByLabel("Type");
  const types = await type
    .locator("option")
    .evaluateAll((options) =>
      options.map((o) => `${o.value}:${o.textContent}`).join("|"),
    );
  check(
    "Create Voucher has Holo's heading, labels and help, and a Type of Credits or Item",
    [
      "Create Voucher",
      "Redemption Code",
      "The voucher code the user must enter to recieve the credits.",
      "Type",
      "The type of voucher that can be redeemed, there are two options; Credits or Item, Credits will be a normal credit voucher, Item will be a furniture redemption voucher.",
      "Amount",
      "The amount of credits/item a user will recieve upon entering the redemption code. For Item purchases input the correct item CCT name.",
    ].every((text) => form.includes(text)) &&
      (await type.getAttribute("name")) === "type" &&
      types === "credits:Credits|item:Item" &&
      (await type.inputValue()) === "credits",
    `${form} :: ${types}`,
  );
  const offered = await page.inputValue("#voucher-code");
  check(
    "the code is 8 of Holo's characters, and the amount is empty",
    holoCode.test(offered) &&
      (await page.inputValue("#voucher-credits")) === "",
    offered,
  );
  check(
    "the list has Holo's heading and columns, and nothing in it yet",
    (await listBox.locator("h2").innerText()) === "Existing vouchers" &&
      (await listBox.locator("th").allInnerTexts()).join("|") ===
        "Redemption Code|Credits|Delete" &&
      (await listBox.innerText()).includes("Nothing found."),
  );
  await shot(page, "vouchers");

  const blank = await post("Create Voucher");
  await page.waitForLoadState();
  check(
    "a blank amount answers Holo's message with 422, and keeps the code",
    blank.status() === 422 &&
      (await page.getByRole("alert").innerText()) ===
        "Please do not leave any fields blank." &&
      (await page.inputValue("#voucher-code")) === offered,
  );

  await page.fill("#voucher-credits", "1.5");
  const decimals = await post("Create Voucher");
  await page.waitForLoadState();
  check(
    "an amount that is not a whole number is refused",
    decimals.status() === 422 &&
      (await page.getByRole("alert").innerText()) ===
        "The amount must be a number from 1 to 2147483647.",
  );

  await page.fill("#voucher-credits", "50");
  await page.getByRole("button", { name: "Create Voucher" }).click();
  await page.waitForURL(/created=1/);
  const [[admin]] = sql(
    "SELECT id FROM users WHERE email = 'admin@example.com'",
  );
  const [[credited, creator, redeemed]] = sql(
    `SELECT credits, created_by_user_id, redeemed_at FROM vouchers WHERE code = '${offered}'`,
  );
  check(
    "the voucher is saved with its credits and its creator, unused",
    Number(credited) === 50 &&
      Number(creator) === Number(admin) &&
      redeemed === null,
    `${credited} ${creator} ${redeemed}`,
  );
  const next = await page.inputValue("#voucher-code");
  check(
    "a new voucher gets Holo's answer, and the form offers another code",
    (await page.getByRole("status").innerText()) ===
      "The voucher has been created successfully." &&
      holoCode.test(next) &&
      next !== offered,
    next,
  );
  check(
    "the list shows the code and its credits",
    (await listed()).join("|") === `${offered} 50`,
    (await listed()).join("|"),
  );

  const otherCase = [...offered]
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
  await page.fill("#voucher-code", otherCase);
  await page.fill("#voucher-credits", "5");
  const taken = await post("Create Voucher");
  await page.waitForLoadState();
  check(
    "a code that a voucher has, in any case, is refused and kept",
    taken.status() === 422 &&
      (await page.getByRole("alert").innerText()) ===
        "A voucher with this redemption code already exists." &&
      (await page.inputValue("#voucher-code")) === otherCase,
  );

  await page.fill("#voucher-code", " Summer/08 gift? ");
  await page.fill("#voucher-credits", "10");
  await page.getByRole("button", { name: "Create Voucher" }).click();
  await page.waitForURL(/created=1/);
  check(
    "any code is taken, trimmed, and listed in the order made",
    (await listed()).join("|") === `${offered} 50|Summer/08 gift? 10`,
    (await listed()).join("|"),
  );
  await shot(page, "vouchers-created");

  await listBox
    .getByRole("row", { name: "Summer/08 gift?" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForURL(/deleted=1/);
  const [[left]] = sql(
    "SELECT COUNT(*) FROM vouchers WHERE code = 'Summer/08 gift?'",
  );
  check(
    "Delete removes an unused voucher, whatever its code holds",
    (await page.getByRole("status").innerText()) ===
      "The voucher has been deleted successfully." &&
      Number(left) === 0 &&
      (await listed()).join("|") === `${offered} 50`,
    (await listed()).join("|"),
  );

  // A browser reads . and .. in the delete's address as folders (0106).
  for (const code of [".", ".."]) {
    await page.fill("#voucher-code", code);
    await page.fill("#voucher-credits", "5");
    const dots = await post("Create Voucher");
    await page.waitForLoadState();
    check(
      `the code ${code} alone is refused and kept`,
      dots.status() === 422 &&
        (await page.getByRole("alert").innerText()) ===
          "The redemption code cannot be . or .." &&
        (await page.inputValue("#voucher-code")) === code,
    );
  }
  await page.fill("#voucher-code", "...");
  await page.fill("#voucher-credits", "5");
  await page.getByRole("button", { name: "Create Voucher" }).click();
  await page.waitForURL(/created=1/);
  const withDots = (await listed()).join("|");
  await listBox
    .getByRole("row", { name: "..." })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForURL(/deleted=1/);
  const [[dotted]] = sql("SELECT COUNT(*) FROM vouchers WHERE code = '...'");
  check(
    "a code of three dots is created, and deleted through its address",
    withDots === `${offered} 50|... 5` &&
      (await page.getByRole("status").innerText()) ===
        "The voucher has been deleted successfully." &&
      Number(dotted) === 0 &&
      (await listed()).join("|") === `${offered} 50`,
    `${withDots} :: ${(await listed()).join("|")}`,
  );

  const [[visitor]] = sql("SELECT id FROM avatars WHERE name = 'Visitor'");
  sql(`UPDATE vouchers SET redeemed_by_avatar_id = ${visitor},
    redeemed_at = '2026-11-07 00:00:00.000000000+00:00' WHERE code = '${offered}'`);
  const stale = await post("Delete");
  await page.waitForLoadState();
  const [[kept]] = sql(
    `SELECT COUNT(*) FROM vouchers WHERE code = '${offered}' AND redeemed_at IS NOT NULL`,
  );
  check(
    "a voucher redeemed meanwhile stays, and the answer says so with 404",
    stale.status() === 404 &&
      (await page.getByRole("alert").innerText()) ===
        "Unable to delete voucher; this voucher does not exist or has been redeemed!" &&
      Number(kept) === 1 &&
      (await listBox.innerText()).includes("Nothing found."),
  );
  await shot(page, "vouchers-redeemed");

  await page.goto(`${hk}/logs`);
  const logged = (action) =>
    page
      .getByRole("row", { name: new RegExp(action.replace(".", "\\.")) })
      .allInnerTexts();
  const created = await logged("vouchers.create");
  const deleted = await logged("vouchers.delete");
  const rows = [...created, ...deleted];
  check(
    "the log holds each change in Holo's words, and who made it",
    created.length === 3 &&
      created.some((row) =>
        row.includes(`Created voucher ${offered} worth 50 credits`),
      ) &&
      created.some((row) =>
        row.includes("Created voucher Summer/08 gift? worth 10 credits"),
      ) &&
      created.some((row) =>
        row.includes("Created voucher ... worth 5 credits"),
      ) &&
      deleted.length === 2 &&
      deleted.some((row) => row.includes("Deleted voucher Summer/08 gift?")) &&
      deleted.some((row) => row.includes("Deleted voucher ...")) &&
      rows.every((row) => row.includes("Admin-1 (ID:")),
    rows.join(" | "),
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();

  const moderator = await session(t, "Frank");
  const reached = await moderator.page.goto(`${hk}/vouchers`);
  check(
    "a moderator manages the vouchers",
    reached.status() === 200,
    String(reached.status()),
  );
  await moderator.context.close();

  const helper = await session(t, "Helper");
  await helper.page.goto(`${hk}/`);
  const denied = helper.page.waitForResponse((r) =>
    r.url().endsWith("/housekeeping/vouchers"),
  );
  await helper.page.getByRole("link", { name: "Voucher Management" }).click();
  check(
    "staff without the attribute see the link, and get Access Denied",
    (await denied).status() === 403 &&
      (await helper.page.locator("h1").innerText()) === "Access Denied",
  );
  await helper.context.close();
}
