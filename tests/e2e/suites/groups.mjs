// Groups: Frank, with 30 credits, is a member of Admin-1's Retro Club and buys
// his own; Admin-1 owns two more for the Hot Groups tab.
export const programs = ["cms"];

const at = (minute) => `2026-11-01 12:${String(minute).padStart(2, "0")}:00.000000000+00:00`;

export const prepare = ({ sql }) => {
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${at(0)}', '${at(0)}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${at(0)}')`);
  sql(`INSERT INTO wallets (user_id, credits, updated_at) VALUES (${frank}, 30, '${at(0)}')`);
  sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
    VALUES (${frank}, 'Frank', 'hd-180-1', 'M', '', '${at(0)}', '${at(0)}')`);
  const [[frankHabbo]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${frankHabbo}, '${at(0)}', '${at(0)}')`);
  const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${frankHabbo}`);
  sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at(0)}')`);

  const [[admin]] = sql("SELECT id FROM avatars WHERE name = 'Admin-1'");
  const group = (name, badge, minute) => {
    sql(`INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
      VALUES (${admin}, '${name}', 'About ${name}', '${badge}', 'open', '${at(minute)}', '${at(minute)}')`);
    const [[id]] = sql(`SELECT id FROM groups WHERE name = '${name}'`);
    sql(`INSERT INTO group_members (group_id, avatar_id, role, requested_at, joined_at)
      VALUES (${id}, ${admin}, 'admin', '${at(minute)}', '${at(minute)}')`);
    sql(`INSERT INTO homes (group_id, updated_at) VALUES (${id}, '${at(minute)}')`);
    return id;
  };
  const retro = group("Retro Club", "b0711Xs01124", 1);
  group("Pixel Art", "b1405Xs09114", 2);
  group("Night Owls", "b2213X", 3);
  sql(`INSERT INTO group_members (group_id, avatar_id, role, requested_at, joined_at)
    VALUES (${retro}, ${frankHabbo}, 'member', '${at(4)}', '${at(4)}')`);
};

export default async function ({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500 || (r.status() >= 400 && r.status() !== 422)) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + "/");
  await page.fill("#username", "Frank");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);

  const mine = page.getByRole("tabpanel", { name: "My Groups" });
  await mine.getByRole("link", { name: "Retro Club" }).waitFor();
  await shot(page, "me-groups");
  check(
    "the Me page has Holo's Groups box, on My Groups, with its text",
    (await page.getByRole("heading", { name: "Groups", exact: true }).isVisible()) &&
      (await page.getByRole("tab", { name: "My Groups" }).getAttribute("aria-selected")) === "true" &&
      (await page.getByRole("tab", { name: "Hot Groups" }).isVisible()) &&
      (await mine
        .getByText("View the groups you are in, create your own group, or get some inspiration from the 'Hot Groups'-tab!")
        .isVisible()),
  );
  const retroLink = mine.getByRole("link", { name: "Retro Club" });
  const retroRow = mine.locator("li", { has: page.getByRole("link", { name: "Retro Club" }) });
  check(
    "My Groups lists the habbo's group with its badge, as Holo's two columns",
    (await mine.locator("li a").count()) === 1 &&
      (await retroLink.getAttribute("href")).match(/^\/groups\/\d+$/) !== null &&
      (await retroRow.evaluate((li) => li.style.backgroundImage)).includes("/habbo-imaging/badge/b0711Xs01124") &&
      (await mine.locator("li").count()) === 2,
    await mine.innerText(),
  );
  const drawn = await page.evaluate(async () => {
    const image = new Image();
    image.src = "/habbo-imaging/badge/b0711Xs01124";
    await image.decode();
    return image.naturalWidth;
  });
  check("the badge is drawn by the CMS", drawn === 39, String(drawn));

  await page.getByRole("tab", { name: "Hot Groups" }).click();
  const hot = page.getByRole("tabpanel", { name: "Hot Groups" });
  await hot.getByRole("link").first().waitFor();
  check(
    "Hot Groups loads the groups at random, with the purchase button",
    JSON.stringify((await hot.locator("li a").allInnerTexts()).sort()) ===
      JSON.stringify(["Night Owls", "Pixel Art", "Retro Club"]) &&
      (await hot.getByRole("button", { name: "Create/buy a Group" }).isVisible()),
    await hot.innerText(),
  );
  await shot(page, "me-hot-groups");

  await hot.getByRole("button", { name: "Create/buy a Group" }).click();
  const dialog = page.getByRole("dialog", { name: "Create a group" });
  await dialog.waitFor();
  await shot(page, "group-purchase");
  check(
    "the purchase dialog shows Holo's form, its price and the new group's badge",
    (await dialog.innerText()).includes("Fill in the form below to create your own group. Creating a group will cost you 20 credits.") &&
      (await dialog.getByLabel("Group Name").getAttribute("maxlength")) === "25" &&
      (await dialog.getByLabel("Group Description").getAttribute("maxlength")) === "200" &&
      (await dialog.getByText("You can modify these settings at any time after creating the group.").isVisible()) &&
      (await dialog.locator('img[src="/habbo-imaging/badge/b0503Xs09114s05013s05015"]').count()) === 1,
    await dialog.innerText(),
  );

  await dialog.getByRole("button", { name: "Purchase" }).click();
  await dialog.getByText("Please fill in all fields!").waitFor();
  check("a blank form answers Holo's Please fill in all fields!", true);
  await dialog.getByRole("button", { name: "Back" }).click();
  await dialog.getByLabel("Group Name").fill("retro club");
  await dialog.getByLabel("Group Description").fill("Mine");
  await dialog.getByRole("button", { name: "Purchase" }).click();
  await dialog.getByText("A group with this name already exists.").waitFor();
  check("a name another group has is refused, ignoring case", true);
  await dialog.getByRole("button", { name: "Back" }).click();
  check(
    "Back brings an empty form again, as Holo reopened it",
    (await dialog.getByLabel("Group Name").inputValue()) === "",
  );

  await dialog.getByLabel("Group Name").fill("Frank's <Gang>");
  await dialog.getByLabel("Group Description").fill("We fight & play.");
  await dialog.getByRole("button", { name: "Purchase" }).click();
  await dialog.getByText("Group Purchased").waitFor();
  await shot(page, "group-purchased");
  const [[groupID, description, badge]] = sql("SELECT id, description, badge FROM groups WHERE name = 'Frank''s <Gang>'");
  check(
    "the purchase congratulates the owner and links to the group home",
    (await dialog.innerText()).includes("Congratulations! You are now the proud owner of Frank's <Gang>.") &&
      (await dialog.getByRole("link", { name: "here" }).getAttribute("href")) === `/groups/${groupID}`,
    await dialog.innerText(),
  );
  const [[credits]] = sql("SELECT credits FROM wallets JOIN users ON users.id = wallets.user_id WHERE users.email = 'frank@example.com'");
  const ledger = sql("SELECT credits, reason, detail FROM wallet_transactions JOIN users ON users.id = wallet_transactions.user_id WHERE users.email = 'frank@example.com'");
  check(
    "buying takes 20 credits with Holo's ledger row, and keeps the text as typed",
    credits === 10 &&
      JSON.stringify(ledger) === JSON.stringify([[-20, "group", "Group purchase"]]) &&
      description === "We fight & play." &&
      badge === "b0503Xs09114s05013s05015",
    JSON.stringify({ credits, ledger, description, badge }),
  );
  await dialog.getByRole("button", { name: "Done" }).click();
  await dialog.waitFor({ state: "hidden" });

  await page.getByRole("tab", { name: "Hot Groups" }).click();
  await hot.getByRole("button", { name: "Create/buy a Group" }).click();
  await dialog.waitFor();
  check(
    "with 10 credits the dialog opens on Holo's refusal, with its link to the credits",
    (await dialog.innerText()).includes("Purchasing the group failed. Please try again later.") &&
      (await dialog.innerText()).includes("You don't have enough Credits. Get more here!") &&
      (await dialog.getByRole("link", { name: "Get more here!" }).getAttribute("href")) === "/credits",
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Done" }).click();

  sql(`UPDATE wallets SET credits = 100 WHERE user_id = (SELECT id FROM users WHERE email = 'frank@example.com')`);
  sql(`INSERT INTO settings (key, value, updated_at) VALUES ('features.groupPurchase', 'false', '${at(9)}')`);
  let switchedOff = false;
  for (let i = 0; i < 20 && !switchedOff; i++) {
    await page.waitForTimeout(250);
    await page.goto(base + "/me");
    await page.getByRole("button", { name: "Create/buy a Group" }).first().click();
    await dialog.waitFor();
    switchedOff = (await dialog.innerText()).includes("Purchasing groups has been disabled by the Hotel Management.");
    if (!switchedOff) await dialog.getByRole("button", { name: /Done|Cancel/ }).first().click();
  }
  check("with buying switched off, the dialog says so as Holo did", switchedOff, await dialog.innerText());
  check(
    "My Groups now lists the bought group too",
    JSON.stringify(await mine.locator("li a").allInnerTexts()) === JSON.stringify(["Retro Club", "Frank's <Gang>"]),
    await mine.innerText(),
  );

  check("no page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}
