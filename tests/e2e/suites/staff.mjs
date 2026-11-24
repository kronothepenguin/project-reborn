// The staff page: Admin-1 under Administrator, Frank in Moderator and Gold Hobba,
// shown once under Moderator, with Helpers his favourite group, and a player who
// is not staff.
export const programs = ["cms"];

export const prepare = ({ sql }) => {
  const at = "2026-11-01 12:00:00.000000000+00:00";
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  for (const [email, name, motto] of [["frank@example.com", "Frank", "Here to help"], ["player@example.com", "Player", ""]]) {
    sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
      VALUES ('${email}', '1990-05-01', '127.0.0.1', '${at}', '${at}')`);
    const [[user]] = sql(`SELECT id FROM users WHERE email = '${email}'`);
    sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${user}, '${hash}', '${at}')`);
    sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${user}, '${at}')`);
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
      VALUES (${user}, '${name}', 'hd-180-1', 'M', '${motto}', '${at}', '${at}')`);
  }
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  const [[frankHabbo]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  for (const group of ["Moderator", "Gold Hobba"]) {
    const [[id]] = sql(`SELECT id FROM access_groups WHERE name = '${group}'`);
    sql(`INSERT INTO access_group_members (access_group_id, user_id, granted_at) VALUES (${id}, ${frank}, '${at}')`);
  }
  sql(`INSERT INTO avatar_badges (avatar_id, code, slot, granted_at) VALUES (${frankHabbo}, 'ADM', 1, '${at}')`);
  sql(`INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
    VALUES (${frankHabbo}, 'Helpers', '', 'b0503Xs01124', 'open', '${at}', '${at}')`);
  const [[helpers]] = sql("SELECT id FROM groups WHERE name = 'Helpers'");
  sql(`INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at)
    VALUES (${helpers}, ${frankHabbo}, 'admin', TRUE, '${at}', '${at}')`);
};

export default async function ({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });

  await page.goto(base + "/staff");
  await shot(page, "staff");
  check("the staff page has Holo's title", (await page.title()).endsWith("~ Staff Team"));
  check("the Staff sub-tab is the active one", (await page.locator("nav li.font-bold").innerText()) === "Staff");
  check("a guest sees no Housekeeping tab", (await page.getByRole("link", { name: "Housekeeping" }).count()) === 0);

  const entries = page.locator("#staff-list > p");
  const names = await page.locator("#staff-list > p b a").allInnerTexts();
  check("each member is listed once, by name, and the player is not", JSON.stringify(names) === JSON.stringify(["Admin-1", "Frank"]), JSON.stringify(names));
  const admin = await entries.nth(0).innerText();
  const frank = await entries.nth(1).innerText();
  check(
    "a member without a motto says so, under the highest group",
    admin.includes("No motto") && admin.includes("Rank: Administrator") && admin.includes("Last Visit: "),
    admin,
  );
  check(
    "a member in two groups shows the higher one, with the motto and Holo's last visit",
    frank.includes("Here to help") && frank.includes("Rank: Moderator") && frank.includes("Last Visit: 01-11-2026 12:00:00"),
    frank,
  );
  const [[helpers]] = sql("SELECT id FROM groups WHERE name = 'Helpers'");
  const groupBadge = entries.nth(1).locator(`a[href="/groups/${helpers}"] img[src="/habbo-imaging/badge/b0503Xs01124"]`);
  check(
    "a member shows the favourite group's badge after the worn one, linking to the group, as Holo's",
    (await groupBadge.count()) === 1 &&
      (await groupBadge.evaluate((img) => img.complete && img.naturalWidth === 39)) &&
      (await entries.nth(0).locator('img[src^="/habbo-imaging/badge/"]').count()) === 0,
  );
  check(
    "a member shows the worn badge, the offline state and the avatar from the imager",
    (await entries.nth(1).locator('img[src="/c_images/album1584/ADM.gif"]').count()) === 1 &&
      (await entries.nth(1).locator('img[alt="Offline"]').getAttribute("title")) === "Offline" &&
      (await entries.nth(1).locator('img[alt="Frank"]').evaluate((img) => img.complete && img.naturalWidth > 0)),
  );
  check(
    "a name links to the habbo's home",
    (await entries.nth(1).getByRole("link", { name: "Frank" }).getAttribute("href")) === "/home?name=Frank",
  );

  const headings = page.locator("main header");
  check(
    "the two boxes carry Holo's headings in green",
    JSON.stringify(await headings.allInnerTexts()) === JSON.stringify(["Staff", "Need our help?", "Joining the Team"]) &&
      (await headings.nth(1).getAttribute("class")).includes("bg-lime-550") &&
      (await page.getByText("You can find the staff members all over the hotel").isVisible()),
  );

  sql(`INSERT INTO settings (key, value, updated_at) VALUES
    ('staffPage.box1Heading', '"Ask us"', '2026-11-01 00:00:00'),
    ('staffPage.box1Color', '"white"', '2026-11-01 00:00:00'),
    ('staffPage.box2Body', '"[b]Bold[/b] and :)"', '2026-11-01 00:00:00')`);
  let changed = false;
  for (let i = 0; i < 20 && !changed; i++) {
    await page.waitForTimeout(250);
    await page.goto(base + "/staff");
    changed = (await headings.nth(1).innerText()) === "Ask us";
  }
  await shot(page, "staff-boxes");
  const white = await headings.nth(1).getAttribute("class");
  check(
    "a white box shows its heading in black on white, and a body shows its BBCode without smilies",
    changed &&
      white.includes("bg-white") &&
      white.includes("text-black") &&
      (await page.locator("main strong").filter({ hasText: "Bold" }).count()) === 1 &&
      (await page.getByText("and :)").count()) === 1,
  );

  sql("INSERT INTO settings (key, value, updated_at) VALUES ('features.staffPage', 'false', '2026-11-01 00:00:00')");
  let sent = false;
  for (let i = 0; i < 20 && !sent; i++) {
    await page.waitForTimeout(250);
    await page.goto(base + "/staff");
    sent = new URL(page.url()).pathname === "/";
  }
  check("with the staff page off, it sends the visitor to the landing page", sent, page.url());

  check("no page failed", problems.length === 0, problems.join(", "));
  await context.close();
}
