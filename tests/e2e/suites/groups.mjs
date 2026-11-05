// Groups: Frank, with 30 credits, is a member of Admin-1's Retro Club and buys
// his own; Admin-1 owns two more for the Hot Groups tab. Dora, an admin of Quiet
// Corner, has put a sticker on its home, and Admin-1 holds one to put there.
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
  const owls = group("Night Owls", "b2213X", 3);
  sql(`UPDATE groups SET access = 'closed' WHERE id = ${owls}`);
  const society = group("Secret Society", "b0913X", 4);
  sql(`UPDATE groups SET access = 'moderated' WHERE id = ${society}`);
  const corner = group("Quiet Corner", "b1102X", 5);
  for (const [name, role] of [["Dora", "admin"], ["Eve", "member"]]) {
    sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
      VALUES ('${name.toLowerCase()}@example.com', '1990-05-01', '127.0.0.1', '${at(0)}', '${at(0)}')`);
    const [[user]] = sql(`SELECT id FROM users WHERE email = '${name.toLowerCase()}@example.com'`);
    sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${user}, '${hash}', '${at(0)}')`);
    sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${user}, '${at(0)}')`);
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
      VALUES (${user}, '${name}', 'hd-180-1', 'F', '', '${at(0)}', '${at(0)}')`);
    const [[avatar]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO group_members (group_id, avatar_id, role, requested_at, joined_at)
      VALUES (${corner}, ${avatar}, '${role}', '${at(6)}', '${at(6)}')`);
  }
  sql(`INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at)
    VALUES (${retro}, ${frankHabbo}, 'member', TRUE, '${at(4)}', '${at(4)}')`);
  const [[home]] = sql(`SELECT id FROM homes WHERE group_id = ${retro}`);
  const widget = (name, skin, x, z) =>
    sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
      VALUES (${home}, 'widget', '${name}', '${skin}', ${x}, 25, ${z}, '${at(5)}', '${at(5)}')`);
  widget("group_info", "defaultskin", 25, 5);
  widget("members", "goldenskin", 320, 6);

  const [[sticker]] = sql("SELECT id FROM home_store_items WHERE kind = 'sticker' ORDER BY id LIMIT 1");
  const [[cornerHome]] = sql(`SELECT id FROM homes WHERE group_id = ${corner}`);
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
    VALUES (${cornerHome}, 'widget', 'group_info', 'defaultskin', 25, 25, 5, '${at(5)}', '${at(5)}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, skin, x, y, z, created_by_avatar_id, created_at, updated_at)
    VALUES (${cornerHome}, 'sticker', ${sticker}, '', 420, 260, 6, (SELECT id FROM avatars WHERE name = 'Dora'), '${at(7)}', '${at(7)}')`);
  sql(`INSERT INTO home_inventory (user_id, home_store_item_id, quantity)
    VALUES ((SELECT user_id FROM avatars WHERE name = 'Admin-1'), ${sticker}, 1)`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, skin, body, x, y, z, created_by_avatar_id, created_at, updated_at)
    VALUES (${cornerHome}, 'note', (SELECT id FROM home_store_items WHERE kind = 'note' ORDER BY id LIMIT 1), 'noteitskin',
      'Corner rules', 600, 400, 4, (SELECT id FROM avatars WHERE name = 'Admin-1'), '${at(8)}', '${at(8)}')`);
};

export default async function ({ base, browser, check, shot, sql }) {
  await groupPages({ base, browser, check, shot, sql });
  await membership({ base, browser, check, shot, sql });

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
      JSON.stringify(["Night Owls", "Pixel Art", "Quiet Corner", "Retro Club", "Secret Society"]) &&
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

  await ownerTools({ base, browser, check, shot, sql });
  await decorating({ base, browser, check, shot, sql });
}

// A guest reads a group's home, a missing group's page and its search.
async function groupPages({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/groups/9999") && !r.url().includes("/groups?name=nothing")) {
      problems.push(`${r.status()} ${r.url()}`);
    }
  });
  const [[retro]] = sql("SELECT id FROM groups WHERE name = 'Retro Club'");
  const [[owls]] = sql("SELECT id FROM groups WHERE name = 'Night Owls'");

  await page.goto(`${base}/groups/${retro}`);
  const info = page.locator(".group-info-widget");
  const members = page.locator(".members-widget");
  await info.waitFor();
  await shot(page, "group-home");
  check(
    "the header names the hotel, not the group",
    !(await page.getByRole("banner").innerText()).includes("Retro Club"),
    await page.getByRole("banner").innerText(),
  );
  check(
    "a guest reads a group's home, named after it, with no icon for a Regular group",
    (await page.title()).endsWith("~ Retro Club") &&
      (await page.locator("#mypage-wrapper h2").innerText()).trim() === "Retro Club" &&
      (await page.locator("#mypage-wrapper h2 img").count()) === 0,
    await page.title(),
  );
  check(
    "the Group information widget shows the badge, the name, the date, the members and the text",
    (await info.locator("h3").innerText()).includes("Group information") &&
      (await info.locator("h4").innerText()) === "Retro Club" &&
      /Created: \d\d-\d\d-\d{4} \d\d:\d\d:\d\d/.test(await info.innerText()) &&
      (await info.innerText()).includes("2 members") &&
      (await info.innerText()).includes("About Retro Club") &&
      (await info.locator('img[src="/habbo-imaging/badge/b0711Xs01124"]').evaluate((img) => img.complete && img.naturalWidth)) === 39,
    await info.innerText(),
  );
  const tiles = members.locator("li");
  check(
    "the Group Members widget lists the owner first with Holo's icon, then the member with the favourite mark",
    (await members.locator("h3").innerText()).includes("Members of this group (2)") &&
      (await tiles.count()) === 2 &&
      (await tiles.nth(0).getAttribute("title")) === "Admin-1" &&
      (await tiles.nth(0).locator('img[alt="Owner"]').count()) === 1 &&
      (await tiles.nth(1).getAttribute("title")) === "Frank" &&
      (await tiles.nth(1).getByRole("img", { name: "Favorite" }).count()) === 1 &&
      (await tiles.nth(1).getByRole("link", { name: "Frank" }).getAttribute("href")) === "/home?name=Frank",
    await members.innerText(),
  );
  const placed = {
    playground: await page.locator("#playground").evaluate((el) => el.offsetWidth),
    info: await info.evaluate((el) => el.style.left),
    members: await members.evaluate((el) => el.style.left),
  };
  check(
    "the widgets stand where they were placed, on the wide playground",
    placed.playground >= 922 && placed.info === "25px" && placed.members === "320px",
    JSON.stringify(placed),
  );

  await page.goto(`${base}/groups/${owls}`);
  check(
    "a Private group shows Holo's closed icon",
    (await page.locator('#mypage-wrapper h2 img[alt="Closed Group"]').count()) === 1,
  );

  const missing = await page.goto(`${base}/groups/9999`);
  await shot(page, "group-missing");
  check(
    "a missing group answers 404 with Holo's page and its search",
    missing.status() === 404 &&
      (await page.getByText("Sorry, but the page you were looking for was not found.").isVisible()) &&
      (await page.getByText("Search for group").isVisible()) &&
      (await page.getByText("A friend's group or personal page?").isVisible()),
  );
  await page.getByLabel("Group Name:").fill("nothing");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL("**/groups?name=nothing");
  check(
    "a search that finds nothing says so, keeping the name",
    (await page.getByText("Sorry, but no results were found for 'nothing'.").isVisible()) &&
      (await page.getByLabel("Group Name:").inputValue()) === "nothing",
  );
  await page.getByLabel("Group Name:").fill("rETRO cLUB");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(`**/groups/${retro}`);
  check("a search opens the group with that name, ignoring case", page.url().endsWith(`/groups/${retro}`), page.url());

  check("no group page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}

// Frank joins, favours and leaves groups with the view tools of the group page.
async function membership({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + "/");
  await page.fill("#username", "Frank");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  const id = (name) => sql(`SELECT id FROM groups WHERE name = '${name}'`)[0][0];
  const [[frank]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  const tools = () => page.locator("#mypage-wrapper button").allInnerTexts();
  const dialog = page.getByRole("dialog", { name: "Group" });

  await page.goto(`${base}/groups/${id("Retro Club")}`);
  await page.getByRole("button", { name: "Leave group" }).waitFor();
  check(
    "a member who chose the group as favourite is offered Remove favourite and Leave group",
    JSON.stringify(await tools()) === JSON.stringify(["Remove favourite", "Leave group"]),
    JSON.stringify(await tools()),
  );

  await page.goto(`${base}/groups/${id("Pixel Art")}`);
  await page.getByRole("button", { name: "Join" }).click();
  await dialog.getByText("You have now joined this group.").waitFor();
  await shot(page, "group-joined");
  await Promise.all([page.waitForLoadState("load"), dialog.getByRole("button", { name: "OK" }).click()]);
  await page.getByRole("button", { name: "Make favourite" }).waitFor();
  check(
    "Join answers in Holo's dialog, and its OK reloads the page with the member's tools",
    JSON.stringify(await tools()) === JSON.stringify(["Make favourite", "Leave group"]) &&
      sql(`SELECT COUNT(*) FROM group_members WHERE group_id = ${id("Pixel Art")} AND avatar_id = ${frank} AND joined_at IS NOT NULL`)[0][0] === 1,
    JSON.stringify(await tools()),
  );

  await page.getByRole("button", { name: "Make favourite" }).click();
  check(
    "Make favourite asks first, as Holo did",
    await dialog.getByText("Are you sure you want to have this group as your favorite Group?").isVisible(),
  );
  await Promise.all([page.waitForEvent("load"), dialog.getByRole("button", { name: "OK" }).click()]);
  await page.getByRole("button", { name: "Remove favourite" }).waitFor();
  check(
    "the favourite moves to this group, and the old one is no longer the favourite",
    JSON.stringify(sql(`SELECT group_id FROM group_members WHERE avatar_id = ${frank} AND favourite`)) ===
      JSON.stringify([[id("Pixel Art")]]),
  );

  await page.getByRole("button", { name: "Leave group" }).click();
  check("Leave group asks first", await dialog.getByText("Are you sure you want to leave this group?").isVisible());
  await dialog.getByRole("button", { name: "Cancel" }).click();
  check(
    "Cancel keeps the membership",
    sql(`SELECT COUNT(*) FROM group_members WHERE group_id = ${id("Pixel Art")} AND avatar_id = ${frank}`)[0][0] === 1,
  );
  await page.getByRole("button", { name: "Leave group" }).click();
  await Promise.all([page.waitForEvent("load"), dialog.getByRole("button", { name: "OK" }).click()]);
  await page.getByRole("button", { name: "Join" }).waitFor();
  check(
    "leaving takes the membership and the favourite, and the page offers Join again",
    sql(`SELECT COUNT(*) FROM group_members WHERE group_id = ${id("Pixel Art")} AND avatar_id = ${frank}`)[0][0] === 0 &&
      JSON.stringify(await tools()) === JSON.stringify(["Join"]),
  );

  await page.goto(`${base}/groups/${id("Secret Society")}`);
  await page.getByRole("button", { name: "Request membership" }).click();
  await dialog.getByText("A request to join this group has been made.", { exact: false }).waitFor();
  await Promise.all([page.waitForLoadState("load"), dialog.getByRole("button", { name: "OK" }).click()]);
  await page.locator("#mypage-wrapper h2").waitFor();
  await page.waitForTimeout(300);
  check(
    "an Exclusive group takes a request, and then offers nothing more",
    (await tools()).length === 0 &&
      sql(`SELECT COUNT(*) FROM group_members WHERE group_id = ${id("Secret Society")} AND avatar_id = ${frank} AND joined_at IS NULL`)[0][0] === 1,
    JSON.stringify(await tools()),
  );

  await page.goto(`${base}/groups/${id("Night Owls")}`);
  await page.locator("#mypage-wrapper h2").waitFor();
  await page.waitForTimeout(300);
  check("a Private group offers no way in", (await tools()).length === 0, JSON.stringify(await tools()));

  check("no membership page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}

// Admin-1 owns the seeded groups: the Edit menu, the settings and deleting a group.
async function ownerTools({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.status() !== 422) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + "/");
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  const id = (name) => sql(`SELECT id FROM groups WHERE name = '${name}'`)[0][0];
  const settings = page.getByRole("dialog", { name: "Group settings" });
  const answer = page.getByRole("dialog", { name: "Edit Group Settings" });
  const openSettings = async () => {
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("button", { name: "Settings" }).click();
    await settings.waitFor();
  };

  const retro = id("Retro Club");
  await page.goto(`${base}/groups/${retro}`);
  await page.getByRole("button", { name: "Edit" }).click();
  check(
    "the owner's Edit opens Holo's menu with Settings",
    (await page.getByText("Edit group", { exact: true }).isVisible()) &&
      (await page.getByRole("button", { name: "Settings" }).isVisible()),
  );
  await page.getByRole("button", { name: "Settings" }).click();
  await settings.waitFor();
  await shot(page, "group-settings");
  check(
    "the settings show the name, the text with its counter from 200, and the four types with Holo's texts",
    (await settings.getByLabel("Edit group name:").inputValue()) === "Retro Club" &&
      (await settings.getByLabel("Edit text:").inputValue()) === "About Retro Club" &&
      (await settings.getByLabel("Characters left:").inputValue()) === "184" &&
      (await settings.getByRole("radio", { name: /^Regular/ }).isChecked()) &&
      (await settings.innerText()).includes("Anyone can join. 500 members limit.") &&
      (await settings.innerText()).includes("Group Admin controls who can join.") &&
      (await settings.innerText()).includes("No one can join.") &&
      (await settings.innerText()).includes("Note: If you choose the option 'unlimited' you will not be able to change the type later!"),
    await settings.innerText(),
  );
  await settings.getByLabel("Edit text:").fill("Retro forever");
  check("the counter follows the text", (await settings.getByLabel("Characters left:").inputValue()) === "187");
  await settings.getByRole("radio", { name: /^Exclusive/ }).check();
  await settings.getByRole("button", { name: "Save changes" }).click();
  check(
    "changing the type asks first, in Holo's words",
    await answer.getByText("Are you sure you want to change the group type to exclusive?").isVisible(),
  );
  await answer.getByRole("button", { name: "OK" }).click();
  await answer.getByText("Editing group settings successful").waitFor();
  await Promise.all([page.waitForEvent("load"), answer.getByRole("button", { name: "Done" }).click()]);
  await page.locator("#mypage-wrapper h2").waitFor();
  check(
    "the saved settings show at once: the text and the Exclusive icon",
    (await page.locator('#mypage-wrapper h2 img[alt="Moderated Group"]').count()) === 1 &&
      sql(`SELECT description, access FROM groups WHERE id = ${retro}`)[0].join("|") === "Retro forever|moderated",
  );

  await openSettings();
  await settings.getByLabel("Edit group name:").fill("pixel art");
  await settings.getByRole("button", { name: "Save changes" }).click();
  await answer.getByText("A group with this name already exists.").waitFor();
  check("a name another group has is refused", true);
  await Promise.all([page.waitForEvent("load"), answer.getByRole("button", { name: "Done" }).click()]);

  const pixel = id("Pixel Art");
  await page.goto(`${base}/groups/${pixel}`);
  await openSettings();
  await settings.getByRole("radio", { name: /^Unlimited/ }).check();
  await settings.getByRole("button", { name: "Save changes" }).click();
  check(
    "choosing Unlimited warns that it cannot be undone",
    await answer
      .getByText("Are you sure you want to change the group type to large? If you continue you can't change it back later!")
      .isVisible(),
  );
  await answer.getByRole("button", { name: "OK" }).click();
  await Promise.all([page.waitForEvent("load"), answer.getByRole("button", { name: "Done" }).click()]);
  await openSettings();
  check(
    "an Unlimited group's types are locked",
    (await settings.getByRole("radio", { name: /^Unlimited/ }).isChecked()) &&
      (await settings.getByRole("radio", { name: /^Regular/ }).isDisabled()),
  );

  await page.goto(`${base}/groups/${retro}`);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Members" }).click();
  const members = page.getByRole("dialog", { name: "Members" });
  await members.getByRole("tab", { name: "Members (2)" }).waitFor();
  await shot(page, "group-members");
  const frankBox = members.getByRole("checkbox", { name: "Select Frank" });
  check(
    "Members lists the owner, who cannot be ticked, and Frank, with Holo's counts and paging",
    (await members.getByRole("tab", { name: "Pending Members (0)" }).isVisible()) &&
      (await members.getByRole("checkbox", { name: "Select Admin-1" }).isDisabled()) &&
      (await members.locator('img[alt="Owner"]').count()) === 1 &&
      (await frankBox.isEnabled()) &&
      (await members.getByText("1 - 2 / 2").isVisible()) &&
      (await members.innerText()).includes("First | << | >> | Last"),
    await members.innerText(),
  );
  const isOn = async (label) => (await members.getByRole("button", { name: label }).getAttribute("aria-disabled")) !== "true";
  check(
    "with nobody ticked every action is off",
    !(await isOn("Give rights")) && !(await isOn("Revoke rights")) && !(await isOn("Remove")),
  );
  await frankBox.check();
  check(
    "ticking a member turns on Give rights and Remove, as Holo's script did",
    (await isOn("Give rights")) && !(await isOn("Revoke rights")) && (await isOn("Remove")),
  );
  await members.getByRole("button", { name: "Give rights" }).click();
  const memberConfirm = page.getByRole("dialog", { name: "Group" });
  check(
    "Give rights asks first",
    await memberConfirm.getByText("Are you sure you want to give admin rights to the selected member(s)?").isVisible(),
  );
  await memberConfirm.getByRole("button", { name: "OK" }).click();
  await members.locator('img[alt="Administrator"]').waitFor();
  check(
    "Frank is an admin now, and the list came back",
    sql(`SELECT role FROM group_members WHERE group_id = ${retro} AND avatar_id = (SELECT id FROM avatars WHERE name = 'Frank')`)[0][0] === "admin",
  );
  await members.getByRole("tabpanel").getByRole("button", { name: "Close" }).click();

  const society = id("Secret Society");
  await page.goto(`${base}/groups/${society}`);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Members" }).click();
  await members.getByRole("tab", { name: "Pending Members (1)" }).click();
  await members.getByRole("checkbox", { name: "Select Frank" }).check();
  await members.getByRole("button", { name: "Accept" }).click();
  check(
    "Accept asks first",
    await memberConfirm.getByText("Are you sure you want to accept this (these) new member(s) into the group?").isVisible(),
  );
  await memberConfirm.getByRole("button", { name: "OK" }).click();
  await members.getByText("There are no pending membership requests at this time. Please check back later.").waitFor();
  check(
    "the request becomes a membership, and the titles count it",
    (await members.getByRole("tab", { name: "Members (2)" }).isVisible()) &&
      sql(`SELECT joined_at IS NOT NULL FROM group_members WHERE group_id = ${society} AND avatar_id = (SELECT id FROM avatars WHERE name = 'Frank')`)[0][0] === 1,
  );
  await members.getByRole("tabpanel").getByRole("button", { name: "Close" }).click();

  await page.goto(`${base}/groups/${retro}`);
  const colourFile = page.waitForResponse((r) => r.url().endsWith("/habbo-widgets/badge-editor/data/badge_data.xml"));
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Badge" }).click();
  const editor = page.locator("#editor-container canvas");
  await editor.waitFor();
  check("the badge editor reads the CMS's colours", (await colourFile).status() === 200);
  await page.waitForTimeout(500);
  await shot(page, "group-badge-editor");
  // Base colour 2 sits at 173,303 of the editor's canvas, and Save at 50,354.
  await editor.click({ position: { x: 173, y: 303 } });
  await Promise.all([page.waitForEvent("load"), editor.click({ position: { x: 50, y: 354 } })]);
  await page.locator(".group-info-widget img").waitFor();
  const [[saved]] = sql(`SELECT badge FROM groups WHERE id = ${retro}`);
  const drawn = await page
    .locator(`.group-info-widget img[src="/habbo-imaging/badge/${saved}"]`)
    .evaluate((img) => img.complete && img.naturalWidth);
  check(
    "Save stores the editor's code, with the base's new colour, and the page draws it",
    saved === "b0702Xs01124" && drawn === 39,
    `${saved} ${drawn}`,
  );

  await page.goto(`${base}/groups/${id("Quiet Corner")}`);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Members" }).click();
  await members.getByRole("checkbox", { name: "Select Dora" }).check();
  check(
    "ticking an admin alone turns on Revoke rights and Remove",
    !(await isOn("Give rights")) && (await isOn("Revoke rights")) && (await isOn("Remove")),
  );
  await members.getByRole("checkbox", { name: "Select Eve" }).check();
  check(
    "an admin and a member ticked together leave only Remove on, as Holo's script did",
    !(await isOn("Give rights")) && !(await isOn("Revoke rights")) && (await isOn("Remove")),
  );
  await members.getByRole("tabpanel").getByRole("button", { name: "Close" }).click();

  const owls = id("Night Owls");
  await page.goto(`${base}/groups/${owls}`);
  await openSettings();
  await settings.getByRole("button", { name: "Delete group" }).click();
  const confirm = page.getByRole("dialog", { name: "Group" });
  check(
    "Delete group warns as Holo did",
    (await confirm.getByText("Are you sure you want to delete this Group?").isVisible()) &&
      (await confirm.getByText("You will lose everything currently on your group home!").isVisible()),
  );
  await confirm.getByRole("button", { name: "OK" }).click();
  await confirm.getByText("The group has been deleted successfully.").waitFor();
  await shot(page, "group-deleted");
  await Promise.all([page.waitForURL("**/me"), confirm.getByRole("link", { name: "OK" }).click()]);
  check(
    "the group is gone, and its OK leads to the Me page",
    sql(`SELECT COUNT(*) FROM groups WHERE id = ${owls}`)[0][0] === 0 && page.url().endsWith("/me"),
  );

  check("no owner page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}

// Admin-1 decorates Quiet Corner's home with Holo's editor: the Group Members
// widget, his sticker, and Dora's sticker going back to her.
async function decorating({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + "/");
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  const [[corner]] = sql("SELECT id FROM groups WHERE name = 'Quiet Corner'");
  const [[home]] = sql(`SELECT id FROM homes WHERE group_id = ${corner}`);
  const [[sticker, stickerName]] = sql("SELECT id, name FROM home_store_items WHERE kind = 'sticker' ORDER BY id LIMIT 1");
  const [[doraSticker]] = sql(`SELECT id FROM home_items WHERE home_id = ${home} AND kind = 'sticker'`);
  const held = (name) =>
    sql(`SELECT COALESCE(SUM(quantity), 0) FROM home_inventory WHERE home_store_item_id = ${sticker}
      AND user_id = (SELECT user_id FROM avatars WHERE name = '${name}')`)[0][0];

  await page.goto(`${base}/groups/${corner}`);
  await page.getByRole("button", { name: "Edit" }).click();
  await Promise.all([page.waitForURL(`**/groups/${corner}/edit`), page.getByRole("link", { name: "Modify page" }).click()]);
  check(
    "Modify page opens the group's home in Holo's edit mode",
    (await page.getByRole("button", { name: "Save" }).isVisible()) && (await page.title()).endsWith("~ Quiet Corner"),
  );

  const menu = page.getByRole("dialog", { name: "Edit" });
  await page.locator(".group-info-widget").getByRole("button", { name: "Edit", exact: true }).click();
  await menu.waitFor();
  check("the Group information widget cannot be removed, as in Holo", (await menu.getByRole("button", { name: "Remove" }).count()) === 0);
  await menu.getByRole("button", { name: "Close" }).click();

  const warning = "This item belongs to another user. If you remove it, it will return to their inventory.";
  await page.locator(`#sticker-${doraSticker}`).getByRole("button", { name: "Edit", exact: true }).click();
  await menu.waitFor();
  check("Dora's sticker carries Holo's warning", await menu.getByText(warning).isVisible());
  await shot(page, "group-edit-warning");
  await menu.getByRole("button", { name: "Remove" }).click();
  await page.locator(`#sticker-${doraSticker}`).waitFor({ state: "detached" });
  check("the removed sticker goes back to Dora", held("Dora") === 1 && held("Admin-1") === 1, `${held("Dora")} ${held("Admin-1")}`);

  await page.locator("#playground .stickie").getByRole("button", { name: "Edit", exact: true }).click();
  await menu.waitFor();
  check(
    "Admin-1's note on the group home is not deleted for good, so the menu does not say so (0098)",
    (await menu.getByRole("button", { name: "Remove" }).isVisible()) &&
      !(await menu.getByText("permanently deleted").isVisible()) &&
      !(await menu.getByText(warning).isVisible()),
  );
  await menu.getByRole("button", { name: "Close" }).click();

  const inventory = page.getByRole("dialog", { name: "Inventory" });
  await page.getByRole("button", { name: "Inventory" }).click();
  await inventory.getByRole("button", { name: "Widgets", exact: true }).click();
  await inventory.getByRole("button", { name: "Group Members" }).click();
  await inventory.getByRole("button", { name: "Place" }).click();
  await page.locator("#playground .members-widget").waitFor();
  const widget = page.locator("#playground .members-widget");
  const [[widgetId]] = sql(`SELECT id FROM home_items WHERE home_id = ${home} AND widget = 'members'`);
  check(
    "Group Members goes on the home with the group's members, named after its row as the page names it",
    (await widget.count()) === 1 &&
      (await widget.getAttribute("id")) === `widget-${widgetId}` &&
      (await widget.locator(".widget-corner").getAttribute("id")) === `widget-${widgetId}-handle` &&
      (await widget.getByRole("link", { name: "Dora" }).isVisible()) &&
      (await widget.getByRole("link", { name: "Eve" }).isVisible()),
  );
  await page.getByRole("button", { name: "Inventory" }).click();
  await inventory.getByRole("button", { name: "Widgets", exact: true }).click();
  check("a placed Group Members is greyed out, as Holo's", await inventory.getByRole("button", { name: "Group Members" }).isDisabled());
  await inventory.getByRole("button", { name: "Stickers", exact: true }).click();
  await inventory.getByRole("button", { name: stickerName }).click();
  await inventory.getByRole("button", { name: "Place" }).click();
  await page.locator("#playground .sticker").first().waitFor();
  await widget.getByRole("button", { name: "Edit", exact: true }).click();
  await menu.waitFor();
  check(
    "Admin-1's own items carry no warning, and Group Members can be removed",
    !(await menu.getByText(warning).isVisible()) && (await menu.getByRole("button", { name: "Remove" }).isVisible()),
  );
  await menu.getByRole("button", { name: "Close" }).click();
  await shot(page, "group-decorating");

  await Promise.all([page.waitForURL(`**/groups/${corner}`), page.getByRole("button", { name: "Save" }).click()]);
  await shot(page, "group-decorated");
  const [[members, placed, left]] = sql(`SELECT
    (SELECT COUNT(*) FROM home_items WHERE home_id = ${home} AND widget = 'members'),
    (SELECT COUNT(*) FROM home_items WHERE home_id = ${home} AND kind = 'sticker'
      AND created_by_avatar_id = (SELECT id FROM avatars WHERE name = 'Admin-1')),
    ${held("Admin-1")}`);
  check(
    "after Save the group's page shows Group Members and Admin-1's sticker",
    members === 1 && placed === 1 && left === 0 &&
      (await page.locator("#playground .members-widget").count()) === 1 &&
      (await page.locator("#playground .sticker").count()) === 1,
    `${members} ${placed} ${left}`,
  );

  check("no decorating page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}
