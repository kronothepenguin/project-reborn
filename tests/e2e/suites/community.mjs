// The community page as a guest sees it: Admin-1 and Frank on the grid, Frank's
// archived habbo Ghost nowhere, four articles, a tag and two banners.
export const programs = ["cms"];

export const prepare = ({ sql }) => {
  const at = (day) => `2026-11-0${day} 12:00:00.000000000+00:00`;
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${at(1)}', '${at(1)}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${at(1)}')`);
  sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${frank}, '${at(1)}')`);
  for (const [name, motto, archived] of [["Frank", "Retro <3", false], ["Ghost", "", true]]) {
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at, archived_at)
      VALUES (${frank}, '${name}', 'hd-180-1', 'M', '${motto}', '${at(1)}', '${at(1)}', ${archived ? `'${at(1)}'` : "NULL"})`);
    const [[avatar]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${avatar}, '${at(1)}', '${at(1)}')`);
    const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${avatar}`);
    sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at(1)}')`);
  }

  const images = ["top_story_news.png", "top_story_newsflash.png", "top_story_poll2.png", "accessories_top.gif"];
  images.forEach((image, i) => {
    sql(`INSERT INTO news_articles (title, category, image_url, summary, body, published_at, created_at, updated_at)
      VALUES ('Article ${i + 1}', 'Updates', '/web-gallery/images/top-story/${image}', 'Summary ${i + 1}', 'Body',
      '${at(i + 1)}', '${at(i + 1)}', '${at(i + 1)}')`);
  });

  const [[admin]] = sql(`SELECT profiles.id FROM profiles JOIN avatars ON avatars.id = profiles.avatar_id
    WHERE avatars.name = 'Admin-1'`);
  sql(`INSERT INTO profile_tags (profile_id, tag, created_at) VALUES (${admin}, 'retro', '${at(1)}')`);

  sql(`INSERT INTO banners (title, image_url, link_url, enabled, position, created_at, updated_at) VALUES
    ('Find tags', '/web-gallery/images/top-story/topstory_accessories2.gif', '/tags', TRUE, 1, '${at(1)}', '${at(1)}'),
    ('Hidden banner', '/web-gallery/images/top-story/top_story_news.png', '/news', FALSE, 2, '${at(1)}', '${at(1)}')`);
};

export default async function ({ base, browser, check, shot }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.clock.install();

  await page.goto(base + "/community");
  await page.locator("#homes-habblet-list-container a").first().waitFor();
  await page.clock.runFor(800);
  const loaded = await page.locator("#homes-habblet-list-container img").evaluateAll((images) =>
    Promise.all(
      images.map((image) =>
        image.complete
          ? image.naturalWidth > 0
          : new Promise((done) => {
              image.onload = () => done(true);
              image.onerror = () => done(false);
            }),
      ),
    ),
  );
  await shot(page, "community");
  check("the community page has Holo's title", (await page.title()).endsWith("~ Community"));
  check("the Community sub-tab is the active one", (await page.locator("nav li.font-bold").innerText()) === "Community");

  const grid = page.locator("#homes-habblet-list-container");
  const habbos = grid.locator("a");
  check(
    "the grid holds every habbo that is not archived, each drawn within 0.7 seconds",
    (await habbos.count()) === 2 &&
      (await grid.locator("img").count()) === 2 &&
      (await grid.getByRole("link", { name: "Ghost" }).count()) === 0,
  );
  check("each habbo's avatar comes from the imager", loaded.length === 2 && loaded.every(Boolean), JSON.stringify(loaded));
  check(
    "the first habbo stands where Holo put it",
    (await habbos.first().evaluate((a) => `${a.style.left} ${a.style.top}`)) === "50px 10px",
  );
  await grid.getByRole("link", { name: "Frank" }).hover();
  const tip = page.getByRole("tooltip");
  check(
    "a habbo's tooltip shows its name, its creation date and its motto",
    (await tip.innerText()).includes("Frank") &&
      (await tip.innerText()).includes("Habbo created on: 01-11-2026") &&
      (await tip.innerText()).includes("Retro <3"),
    await tip.innerText(),
  );
  await shot(page, "community-tooltip");

  const shown = page.locator('#topstories [data-story="shown"]');
  check(
    "the news promo shows the newest article first, with its picture",
    (await shown.count()) === 1 &&
      (await shown.locator("h3").innerText()) === "Article 4" &&
      (await shown.evaluate((d) => d.style.backgroundImage)).includes("/web-gallery/images/top-story/accessories_top.gif") &&
      (await shown.getByRole("link", { name: "Read more »" }).getAttribute("href")).startsWith("/news/"),
  );
  const listed = await page.locator("#newspromo > ul li").allInnerTexts();
  check(
    "the next two articles are listed with their dates, then More news",
    listed.length === 3 &&
      listed[0].includes("Article 2") &&
      listed[0].includes("2026-11-02") &&
      listed[1].includes("Article 1") &&
      listed[2] === "More news »",
    JSON.stringify(listed),
  );

  await page.mouse.move(0, 0);
  await page.clock.runFor(10000);
  check(
    "after 10 seconds the second story turns in",
    (await shown.locator("h3").textContent()) === "Article 3",
  );
  await page.locator("#topstories").hover();
  await page.clock.runFor(10000);
  check("the stories wait while the pointer is over them", (await shown.locator("h3").textContent()) === "Article 3");
  await page.mouse.move(0, 0);
  await page.clock.runFor(10000);
  check("they turn again once it leaves", (await shown.locator("h3").textContent()) === "Article 4");

  check("Users like.. holds the tag cloud", (await page.getByRole("link", { name: "retro", exact: true }).count()) === 1);

  const banners = page.locator('a[target="_blank"]');
  check(
    "the enabled banner links its picture and its text in a new window, and the disabled one is left out",
    (await banners.count()) === 2 &&
      (await banners.nth(0).locator("img").getAttribute("src")) === "/web-gallery/images/top-story/topstory_accessories2.gif" &&
      (await banners.nth(1).innerText()) === "Find tags" &&
      (await banners.nth(1).getAttribute("rel")) === "noopener noreferrer" &&
      (await page.getByText("Hidden banner").count()) === 0,
  );

  await page.locator('form[action="/tags"] input[name="tag"]').fill("retro");
  await page.locator('form[action="/tags"]').getByRole("button", { name: "Search" }).click();
  await page.waitForURL("**/tags?tag=retro");
  check("the search form under the cloud searches the tags", (await page.title()).endsWith("~ Tags"));

  await page.goto(base + "/community");
  await page.locator("#homes-habblet-list-container a").first().waitFor();
  await page.clock.runFor(800);
  await page.locator("#homes-habblet-list-container").getByRole("link", { name: "Frank" }).click();
  await page.waitForURL("**/home/Frank");
  check("a habbo on the grid opens its home", (await page.title()).endsWith("~ User Profile - Frank"));

  check("no page failed", problems.length === 0, problems.join(", "));
  await context.close();
}
