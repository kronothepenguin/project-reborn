// The tags page: Admin-1 and Frank carry tags, and Frank's archived habbo Ghost
// carries one nobody should see.
export const programs = ["cms"];

export const prepare = ({ sql }) => {
  const at = (minute) => `2026-11-01 12:${String(minute).padStart(2, "0")}:00.000000000+00:00`;
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${at(0)}', '${at(0)}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${at(0)}')`);
  sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${frank}, '${at(0)}')`);
  const habbo = (name, motto, archived) => {
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at, archived_at)
      VALUES (${frank}, '${name}', 'hd-180-1', 'M', '${motto}', '${at(0)}', '${at(0)}', ${archived ? `'${at(0)}'` : "NULL"})`);
    const [[avatar]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${avatar}, '${at(0)}', '${at(0)}')`);
    const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${avatar}`);
    sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at(0)}')`);
    return profile;
  };
  const tag = (profile, name, minute) =>
    sql(`INSERT INTO profile_tags (profile_id, tag, created_at) VALUES (${profile}, '${name}', '${at(minute)}')`);

  const [[admin]] = sql(`SELECT profiles.id FROM profiles JOIN avatars ON avatars.id = profiles.avatar_id
    WHERE avatars.name = 'Admin-1'`);
  tag(admin, "retro", 1);
  tag(admin, "holo", 2);
  const frankProfile = habbo("Frank", "Retro <3", false);
  tag(frankProfile, "retro", 3);
  tag(frankProfile, "party", 4);
  tag(habbo("Ghost", "", true), "ghost", 5);
};

async function visit(browser, base, name) {
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

export default async function ({ base, browser, check, shot, sql }) {
  const guest = await visit(browser, base);
  const page = guest.page;
  const cloud = page.locator("#tag-related-habblet-container");
  const search = page.locator("#tag-search-habblet-container");
  const fight = page.locator("#tag-fight-habblet-container");

  await page.goto(base + "/tags");
  await shot(page, "tags");
  check("the tags page has Holo's title", (await page.title()).endsWith("~ Tags"));
  check("the Tags sub-tab is the active one", (await page.locator("nav li.font-bold").innerText()) === "Tags");
  const sizes = {};
  for (const link of await cloud.locator("a").all()) {
    sizes[await link.innerText()] = await link.evaluate((a) => a.style.fontSize);
  }
  check(
    "the cloud sizes the tags by how many habbos carry them, and leaves out an archived habbo's",
    JSON.stringify(Object.keys(sizes).sort()) === JSON.stringify(["holo", "party", "retro"]) &&
      sizes.retro === "200%" &&
      sizes.holo === "100%" &&
      sizes.party === "100%",
    JSON.stringify(sizes),
  );
  check("without a search, Holo says No results", await search.getByText("No results").isVisible());
  check("a guest is not offered a tag", (await page.locator("#tag-search-add").count()) === 0);

  await cloud.getByRole("link", { name: "retro" }).click();
  await page.waitForURL("**/tags?tag=retro");
  await shot(page, "tags-search");
  check(
    "the search counts its habbos in the title",
    await page.getByText("Find others with the same interests (2)").isVisible(),
  );
  check("the search counts as Holo did", await search.getByText("1 - 2 / 2").isVisible());
  const rows = search.locator("tbody tr");
  check(
    "the search lists the habbos in the order they took the tag, with their motto and tags",
    (await rows.count()) === 2 &&
      (await rows.nth(0).locator("a").first().innerText()) === "Admin-1" &&
      (await rows.nth(1).locator("a").first().innerText()) === "Frank" &&
      (await rows.nth(1).innerText()).includes("Retro <3") &&
      JSON.stringify(await rows.nth(1).locator("li a").allInnerTexts()) === JSON.stringify(["retro", "party"]),
    await search.locator("tbody").innerText(),
  );
  check("each habbo shows its avatar", (await rows.nth(1).locator('img[alt="Frank"]').count()) === 1);

  await search.locator('input[name="tag"]').fill("Ghost");
  await search.getByRole("button", { name: "Search" }).click();
  await page.waitForURL("**/tags?tag=Ghost");
  check(
    "an archived habbo's tag finds nobody, and the search shows the tag lowered",
    (await search.locator('input[name="tag"]').inputValue()) === "ghost" &&
      (await page.getByText("Find others with the same interests (0)").isVisible()) &&
      (await search.getByText("No results").isVisible()),
  );

  await fight.getByLabel("First tag").fill("retro");
  await fight.getByLabel("Second tag").fill("holo");
  await fight.getByRole("button", { name: "Fight!" }).click();
  check("the fight is on", await fight.getByText("The fight ... is on ...").isVisible());
  await fight.getByRole("button", { name: "Again?" }).waitFor({ timeout: 10000 });
  await shot(page, "tags-fight");
  check(
    "the fight names the winner with its hits",
    (await fight.innerText()).includes("The winner is:") &&
      (await fight.locator("b").innerText()) === "retro" &&
      (await fight.innerText()).includes("retro (2) hits") &&
      (await fight.innerText()).includes("holo (1) hits") &&
      (await fight.locator("img").first().getAttribute("src")).includes("tagfight_end_2"),
    await fight.innerText(),
  );
  await fight.getByRole("button", { name: "Again?" }).click();
  check(
    "Again? brings back an empty form and Holo's Start",
    (await fight.getByLabel("First tag").inputValue()) === "" &&
      (await fight.getByRole("button", { name: "Start" }).isVisible()) &&
      (await fight.locator("img").first().getAttribute("src")).includes("tagfight_start"),
  );
  await fight.getByLabel("First tag").fill("holo");
  await fight.getByLabel("Second tag").fill("Party");
  await fight.getByRole("button", { name: "Start" }).click();
  await fight.getByRole("button", { name: "Again?" }).waitFor({ timeout: 10000 });
  check(
    "equal hits are a tie",
    (await fight.innerText()).includes("Tie!") &&
      (await fight.locator("b").count()) === 0 &&
      (await fight.locator("img").first().getAttribute("src")).includes("tagfight_end_0"),
    await fight.innerText(),
  );
  check("no page failed for the guest", guest.problems.length === 0, guest.problems.join(", "));
  await guest.context.close();

  const frank = await visit(browser, base, "Frank");
  await frank.page.goto(base + "/tags?tag=newtag");
  await frank.page.getByRole("button", { name: "newtag" }).click();
  await frank.page.waitForURL("**/tags?tag=newtag");
  await shot(frank.page, "tags-tagged");
  check(
    "tagging yourself from a search adds the tag and lists the habbo",
    (await frank.page.getByText("Find others with the same interests (1)").isVisible()) &&
      (await frank.page.locator("#tag-search-habblet-container tbody").innerText()).includes("Frank") &&
      (await frank.page.locator("#tag-search-add").count()) === 0,
  );

  sql("INSERT INTO settings (key, value, updated_at) VALUES ('features.tagFight', 'false', '2026-11-01 00:00:00')");
  let hidden = false;
  for (let i = 0; i < 20 && !hidden; i++) {
    await frank.page.waitForTimeout(250);
    await frank.page.goto(base + "/tags");
    hidden = (await frank.page.locator("#tag-fight-habblet-container").count()) === 0;
  }
  check("features.tagFight off hides the tag fight", hidden);
  check("no page failed for Frank", frank.problems.length === 0, frank.problems.join(", "));
  await frank.context.close();
}
