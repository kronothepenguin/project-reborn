// Homes on the installed hotel, whose store the installer seeded: Admin-1 owns the
// one habbo, and a second user, Frank, looks on.
export const programs = ["cms"];

export const prepare = ({ sql }) => {
  const now = "2026-11-01 12:00:00.000000000+00:00";
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${now}', '${now}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${now}')`);
  sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${frank}, '${now}')`);
  sql(`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at)
    VALUES (${frank}, 'Frank', 'hd-180-1', 'M', '${now}', '${now}')`);
  const [[avatar]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${avatar}, '${now}', '${now}')`);
  const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${avatar}`);
  sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${now}')`);
  const [[home]] = sql(`SELECT id FROM homes WHERE profile_id = ${profile}`);
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
    VALUES (${home}, 'widget', 'profile', 'metalskin', 25, 25, 5, '${now}', '${now}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, skin, body, x, y, z, created_at, updated_at)
    VALUES (${home}, 'note', 13, 'noteitskin', 'Hello [b]there[/b] <i>friend</i>', 300, 40, 9, '${now}', '${now}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, x, y, z, created_at, updated_at)
    VALUES (${home}, 'sticker', 1, 500, 200, 10, '${now}', '${now}')`);
  sql(`INSERT INTO profile_tags (profile_id, tag, created_at) VALUES (${profile}, 'retro', '${now}')`);

  const [[adminHome]] = sql(`SELECT homes.id FROM homes JOIN profiles ON profiles.id = homes.profile_id
    JOIN avatars ON avatars.id = profiles.avatar_id WHERE avatars.name = 'Admin-1'`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, x, y, z, created_at, updated_at)
    VALUES (${adminHome}, 'sticker', 1, 400, 300, 20, '${now}', '${now}')`);
};

async function signIn(browser, base, name) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  if (name) {
    await page.goto(base + "/");
    await page.fill("#username", name);
    await page.fill("#password", "secret123");
    await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  }
  return { context, page, problems };
}

export default async function ({ base, browser, check, shot }) {
  const guest = await signIn(browser, base);
  await guest.page.goto(base + "/home/Frank");
  await shot(guest.page, "home-guest");
  check("a guest reads a home", (await guest.page.title()).endsWith("~ User Profile - Frank"));
  check(
    "the note shows its BBCode and not its HTML",
    (await guest.page.locator(".stickie strong").innerText()) === "there" &&
      (await guest.page.locator(".stickie").innerText()).includes("<i>friend</i>"),
  );
  check(
    "the sticker shows its art",
    (await guest.page.locator(".sticker img").getAttribute("src")).endsWith("sticker_geniefirehead.gif"),
  );
  check(
    "the profile widget wears its skin",
    (await guest.page.locator('.profile-widget [data-widget-skin="metalskin"]').count()) === 1,
  );
  check("a guest has no Edit", (await guest.page.getByRole("link", { name: "Edit", exact: true }).count()) === 0);
  await guest.page.goto(base + "/home/Nobody");
  check("an unknown habbo shows Holo's page", await guest.page.getByText("Page not found!").isVisible());
  check("no page failed for the guest", guest.problems.length === 0, guest.problems.join(", "));
  await guest.context.close();

  const admin = await signIn(browser, base, "Admin-1");
  await admin.page.getByRole("link", { name: "My Page" }).click();
  await admin.page.waitForURL("**/home/Admin-1");
  await shot(admin.page, "home-own");
  check("My Page opens the own home with Edit", await admin.page.getByRole("link", { name: "Edit", exact: true }).isVisible());
  await admin.page.fill('input[aria-label="New tag"]', "Holo");
  await admin.page.getByRole("button", { name: "Add tag" }).click();
  await admin.page.getByRole("link", { name: "holo" }).waitFor();
  check("a tag is added in lower case", await admin.page.getByRole("link", { name: "holo" }).isVisible());
  await admin.page.fill('input[aria-label="New tag"]', "no way");
  await admin.page.getByRole("button", { name: "Add tag" }).click();
  check("a bad tag is refused with Holo's text", (await admin.page.getByRole("alert").innerText()).includes("Invalid tag"));
  await admin.page.getByRole("button", { name: "Remove holo" }).click();
  const panelEmpty = admin.page.locator("#profile-tags-panel").getByText("No tags").last();
  await panelEmpty.waitFor();
  check("a tag is removed", await panelEmpty.isVisible());

  await admin.page.getByRole("link", { name: "Edit", exact: true }).click();
  await admin.page.waitForURL("**/home/Admin-1/edit");
  await shot(admin.page, "home-edit");
  const sticker = admin.page.locator(".sticker").first();
  const place = (element) => element.evaluate((e) => [e.offsetLeft, e.offsetTop]);
  const before = await sticker.boundingBox();
  const placedBefore = await place(sticker);
  await admin.page.mouse.move(before.x + 10, before.y + 30);
  await admin.page.mouse.down();
  await admin.page.mouse.move(before.x + 60, before.y + 80, { steps: 5 });
  await admin.page.mouse.up();
  const widget = admin.page.locator(".profile-widget");
  const corner = await widget.locator(".widget-corner").boundingBox();
  const widgetBefore = await widget.boundingBox();
  await admin.page.mouse.move(corner.x + 10, corner.y + 5);
  await admin.page.mouse.down();
  await admin.page.mouse.move(corner.x - 600, corner.y + 5, { steps: 5 });
  await admin.page.mouse.up();
  const widgetDropped = await widget.boundingBox();
  check(
    "an item dropped off the playground goes back",
    widgetDropped.x === widgetBefore.x && widgetDropped.y === widgetBefore.y,
    JSON.stringify({ widgetBefore, widgetDropped }),
  );
  await widget.getByRole("button", { name: "Edit", exact: true }).click();
  await admin.page.getByRole("dialog", { name: "Edit" }).waitFor();
  check(
    "the profile widget cannot be removed",
    (await admin.page.getByRole("button", { name: "Remove" }).count()) === 0,
  );
  await admin.page.selectOption('select[aria-label="Skin"]', "goldenskin");
  await admin.page.locator('.profile-widget [data-widget-skin="goldenskin"]').waitFor();
  await admin.page.getByRole("button", { name: "Save" }).click();
  await admin.page.waitForURL("**/home/Admin-1");
  const placedAfter = await place(admin.page.locator(".sticker").first());
  check(
    "a dragged sticker keeps its place after saving",
    placedAfter[0] - placedBefore[0] === 50 && placedAfter[1] - placedBefore[1] === 50,
    JSON.stringify({ placedBefore, placedAfter }),
  );
  check(
    "a skin chosen in the editor stays",
    (await admin.page.locator('.profile-widget [data-widget-skin="goldenskin"]').count()) === 1,
  );
  await admin.page.getByRole("link", { name: "Edit", exact: true }).click();
  await admin.page.waitForURL("**/home/Admin-1/edit");
  await admin.page.locator(".sticker").first().getByRole("button", { name: "Edit", exact: true }).click();
  await admin.page.getByRole("button", { name: "Remove" }).click();
  await admin.page.locator(".sticker").first().waitFor({ state: "detached" });
  await admin.page.getByRole("link", { name: "Cancel" }).click();
  await admin.page.waitForURL("**/home/Admin-1");
  check("a removed sticker leaves the home", (await admin.page.locator(".sticker").count()) === 0);

  await admin.page.getByRole("link", { name: "Edit", exact: true }).click();
  await admin.page.waitForURL("**/home/Admin-1/edit");
  const store = admin.page.getByRole("dialog", { name: "Webstore" });
  await admin.page.getByRole("button", { name: "Webstore" }).click();
  await store.getByRole("button", { name: "Genie Fire Head" }).click();
  await shot(admin.page, "home-webstore");
  check("the webstore shows the price and the credits", (await store.innerText()).includes("You have:"));
  check("staff see Holo's staff category with the site's name", (await store.innerText()).includes("Reborn Staff"));
  await store.getByRole("button", { name: "Buy" }).click();
  check(
    "a purchase asks first, in Holo's words",
    (await store.innerText()).includes("Are you sure you want to buy Genie Fire Head?"),
  );
  await store.getByRole("button", { name: "Continue" }).click();
  await store.getByRole("button", { name: "Notes", exact: true }).click();
  await store.getByRole("button", { name: "Notes" }).nth(1).click();
  await store.getByRole("button", { name: "Buy" }).click();
  await store.getByRole("button", { name: "Continue" }).click();
  await store.getByRole("button", { name: "Backgrounds", exact: true }).click();
  const background = store.locator('button[title]:has(img[src*="backgrounds2"])').first();
  const backgroundName = await background.getAttribute("title");
  await background.click();
  await store.getByRole("button", { name: "Buy" }).click();
  await store.getByRole("button", { name: "Continue" }).click();

  await store.getByRole("button", { name: "Inventory" }).click();
  const inventory = admin.page.getByRole("dialog", { name: "Inventory" });
  await inventory.getByRole("button", { name: "Genie Fire Head" }).click();
  await inventory.getByRole("button", { name: "Place" }).click();
  await admin.page.locator(".sticker").first().waitFor();
  check("a bought sticker is placed from the inventory", (await admin.page.locator(".sticker").count()) === 1);

  await admin.page.getByRole("button", { name: "Inventory" }).click();
  await inventory.getByRole("button", { name: "Notes", exact: true }).click();
  await inventory.getByRole("button", { name: "Notes" }).nth(1).click();
  await inventory.getByRole("button", { name: "Place" }).click();
  const notes = admin.page.getByRole("dialog", { name: "Notes" });
  await notes.locator('textarea[aria-label="Note text"]').fill("[b]Welcome[/b] to my page");
  await notes.getByRole("button", { name: "Continue" }).click();
  check("the note editor shows the note as it will be", (await notes.locator("strong").innerText()) === "Welcome");
  await notes.getByRole("button", { name: "Add to page" }).click();
  await admin.page.locator("#playground .stickie strong").waitFor();
  await notes.waitFor({ state: "detached" });

  await admin.page.getByRole("button", { name: "Inventory" }).click();
  await inventory.getByRole("button", { name: "Backgrounds", exact: true }).click();
  await inventory.getByRole("button", { name: backgroundName }).click();
  await inventory.getByRole("button", { name: "Place" }).click();
  await admin.page.getByRole("button", { name: "Save" }).click();
  await admin.page.waitForURL("**/home/Admin-1");
  await shot(admin.page, "home-decorated");
  check(
    "the note and the background stay after saving",
    (await admin.page.locator(".stickie strong").innerText()) === "Welcome" &&
      !(await admin.page.locator("#mypage-bg").getAttribute("style")).includes("bg_pattern_abstract2"),
  );

  await admin.page.goto(base + "/home/Frank");
  check("someone else's home has no Edit", (await admin.page.getByRole("link", { name: "Edit", exact: true }).count()) === 0);
  await admin.page.getByRole("button", { name: "Add retro to my tags" }).click();
  await admin.page.goto(base + "/home/Admin-1");
  check("a borrowed tag is the habbo's own", await admin.page.getByRole("link", { name: "retro" }).isVisible());
  check("no page failed for the owner", admin.problems.length === 0, admin.problems.join(", "));
  await admin.context.close();
}
