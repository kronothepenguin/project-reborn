import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => {
  seedStaff(sql);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  const [[habbo]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  sql(`INSERT INTO login_attempts (user_id, avatar_id, ip, succeeded, created_at)
    VALUES (${frank}, ${habbo}, '10.1.2.3', TRUE, '2026-11-01 12:00:00.000000000+00:00')`);
  sql(`INSERT INTO help_tickets (avatar_id, subject, message, ip, created_at)
    VALUES (${habbo}, 'My <credits>', 'They are gone & I am sad', '10.1.2.3', '2026-11-01 13:00:00.000000000+00:00')`);
};

export default async function (t) {
  const { base, check, hk, shot } = t;

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

  const frank = await session(t, "Frank");
  await page.goto(frankStaffURL);
  await page.getByRole("link", { name: "Ban this user" }).click();
  await page.waitForURL(/bans\?user=FrankStaff/);
  check(
    "the ban form starts from the habbo",
    (await page.inputValue('input[name="user"]')) === "FrankStaff",
  );
  await page.fill('input[name="reason"]', "Being <rude>");
  await page.selectOption('select[name="length"]', "2h");
  await shot(page, "bans");
  await page.getByRole("button", { name: "Ban", exact: true }).click();
  await page.waitForURL(/banned=\d+/);
  check(
    "the ban says until when",
    /User FrankStaff has been banned untill \d\d-\d\d-\d{4} /.test(
      await page.getByRole("status").innerText(),
    ),
  );
  const banList = await page.locator("main table").nth(1).innerText();
  check(
    "the ban is listed",
    banList.includes("Being <rude>") && banList.includes("Not an IP Ban"),
    banList,
  );

  await frank.page.goto(`${base}/me`);
  check(
    "a banned user is out at once",
    !frank.page.url().endsWith("/me"),
    frank.page.url(),
  );
  await frank.page.goto(`${base}/`);
  await frank.page.fill('input[name="username"]', "Frank");
  await frank.page.fill('input[name="password"]', "secret123");
  await frank.page.click('button[type="submit"]');
  await frank.page.waitForLoadState();
  const refusal = await frank.page.locator("body").innerText();
  check(
    "the next login shows the reason and the expiry",
    refusal.includes('The reason for this ban is "Being <rude>"') &&
      refusal.includes("The ban will expire at"),
    refusal,
  );

  await page.getByRole("button", { name: "Lift" }).click();
  await page.waitForURL(/lifted=1/);
  check(
    "a lifted ban leaves the list",
    (await page.getByRole("status").innerText()).includes("Affected bans: 1") &&
      (await page.locator("main table").nth(1).innerText()).includes(
        "Nothing found.",
      ),
  );
  await frank.page.goto(`${base}/`);
  await frank.page.fill('input[name="username"]', "Frank");
  await frank.page.fill('input[name="password"]', "secret123");
  await frank.page.click('button[type="submit"]');
  await frank.page.waitForURL("**/me");
  check("after the lift the user signs in", frank.page.url().endsWith("/me"));
  await frank.context.close();

  const reader = await session(t, "Frank");
  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Site/Remote Alert" }).click();
  await page.waitForURL("**/housekeeping/alerts");
  await page.fill('input[name="username"]', "Frank");
  await page.fill('textarea[name="alert"]', "Be <nice> & calm");
  await shot(page, "alerts");
  await page.getByRole("button", { name: "Give Alert" }).first().click();
  await page.waitForURL(/sent=1/);
  check(
    "an alert is sent and listed",
    (await page.getByRole("status").innerText()).includes(
      "Gave alert to user.",
    ) &&
      (await page.locator("main table").last().innerText()).includes(
        "Be <nice> & calm",
      ),
  );
  await reader.page.goto(`${base}/me`);
  check(
    "the habbo reads the alert on its page",
    (await reader.page.locator("body").innerText()).includes(
      "Be <nice> & calm",
    ),
  );
  await reader.context.close();

  await page.fill('textarea[name="everyone"]', "The hotel closes at nine");
  await page.getByRole("button", { name: "Give Alert" }).last().click();
  await page.waitForURL(/everyone=\d+/);
  const [[habbos]] = t.sql(
    "SELECT COUNT(*) FROM avatars WHERE archived_at IS NULL",
  );
  check(
    "a mass alert reaches every habbo",
    (await page.getByRole("status").innerText()).includes(
      `Gave mass alert. Users processed: ${habbos}`,
    ),
    String(habbos),
  );

  await page.getByRole("link", { name: "Help Queries" }).click();
  await page.waitForURL("**/housekeeping/help");
  await shot(page, "help");
  const queue = await page.locator("main table").first().innerText();
  check(
    "the queue has Holo's columns",
    ["ID", "Subject", "Date", "Username", "Picked up?", "Reply"].every((column) =>
      queue.includes(column),
    ) && queue.includes("My <credits>"),
    queue,
  );
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForLoadState();
  check(
    "a ticket nobody picked up does not close",
    (await page.getByRole("alert").innerText()).includes("not picked up yet"),
  );
  await page.getByRole("link", { name: "My <credits>" }).click();
  await page.waitForURL(/help\/\d+$/);
  await shot(page, "help-ticket");
  const ticketURL = page.url();
  const ticket = await page.locator("main").innerText();
  check(
    "a ticket shows who asked, from where and what",
    ["Frank", "10.1.2.3", "They are gone & I am sad"].every((text) =>
      ticket.includes(text),
    ),
    ticket,
  );
  await page.getByRole("button", { name: "Reply" }).click();
  await page.waitForURL(/alerts\?reply=\d+/);
  const reply = await page.inputValue('textarea[name="alert"]');
  check(
    "Quick Reply fills in Holo's text",
    (await page.inputValue('input[name="username"]')) === "Frank" &&
      reply.startsWith(
        "Hello, my name is Admin-1. I am sending you this message in reply to your help inquiry sent on 01-11-2026 13:00:00, with the subject 'My <credits>'.",
      ) &&
      reply.endsWith("Player Support"),
    reply,
  );
  await page.getByRole("button", { name: "Give Alert" }).first().click();
  await page.waitForURL(/sent=1/);
  await page.goto(ticketURL);
  check(
    "Quick Reply picked the ticket up",
    (await page.locator("main").innerText()).includes("Already picked up"),
  );
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForURL(/closed=1/);
  check(
    "a closed ticket leaves the queue",
    (await page.locator("main table").first().innerText()).includes(
      "Nothing found.",
    ),
  );
  await page.goto(ticketURL);
  check(
    "a closed ticket stays readable",
    (await page.locator("main").innerText()).includes(
      "They are gone & I am sad",
    ),
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
      "bans.create",
      "bans.lift",
      "alerts.send",
      "alerts.broadcast",
      "help.pick",
      "help.close",
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
