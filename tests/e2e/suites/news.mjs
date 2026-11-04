// The news as a guest reads it, with three articles by Admin-1 written into the
// installed hotel, then with none.
export const programs = ["cms"];

export const prepare = ({ sql }) => {
  const [[admin]] = sql("SELECT id FROM avatars WHERE name = 'Admin-1'");
  const article = (title, category, summary, body, day) => {
    const at = `2026-11-0${day} 12:00:00.000000000+00:00`;
    sql(`INSERT INTO news_articles (avatar_id, title, category, image_url, summary, body, published_at, created_at, updated_at)
      VALUES (${admin}, '${title}', '${category}', '', ${summary}, '${body}', '${at}', '${at}', '${at}')`);
  };
  article(
    "Welcome to the hotel",
    "Updates",
    "'First line' || char(10) || 'Second <line>'",
    "[b]Bold[/b] :) <i>raw</i> [url=https://example.com/]a link[/url]",
    1,
  );
  article("Summer party", "Events & Competitions", "'Bring a towel.'", "See you there.", 2);
  article("Another update", "Updates", "'Short.'", "Nothing else.", 3);
};

export default async function ({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  const texts = (selector) => page.locator(selector).allInnerTexts();

  await page.goto(base + "/news");
  await shot(page, "news-archive");
  check("the archive has Holo's title", (await page.title()).endsWith("~ News Archive"));
  check("the News sub-tab is the active one", (await page.locator("nav li.font-bold").innerText()) === "News");
  check(
    "the archive lists every article, newest first, with its date",
    JSON.stringify(await texts("#article-wrapper li")) ===
      JSON.stringify([
        "2026-11-03 - Another update",
        "2026-11-02 - Summer party",
        "2026-11-01 - Welcome to the hotel",
      ]),
    JSON.stringify(await texts("#article-wrapper li")),
  );
  check("the archive has Holo's heading", (await page.locator("#article-wrapper h2").innerText()) === "Reborn News Archive");
  check(
    "the headlines column lists the articles and the archive",
    JSON.stringify(await texts("#article-archive li")) ===
      JSON.stringify(["Another update »", "Summer party »", "Welcome to the hotel »", "View our news archive »"]),
    JSON.stringify(await texts("#article-archive li")),
  );

  await page.locator("#article-wrapper").getByRole("link", { name: "Welcome to the hotel" }).click();
  await page.waitForURL(/\/news\/\d+$/);
  await shot(page, "news-article");
  check("the article has Holo's title", (await page.title()).endsWith("~ News - Welcome to the hotel"));
  check("the article shows its heading", (await page.locator("#article-wrapper h2").innerText()) === "Welcome to the hotel");
  check(
    "the article shows its date and category",
    (await page.locator("#article-wrapper h2 + div").innerText()) === "Posted 2026-11-01 Updates",
  );
  const summary = page.locator("#article-wrapper p.font-bold");
  check(
    "the summary keeps its line break and shows its text as it was typed",
    (await summary.innerText()) === "First line\nSecond <line>" && (await summary.locator("br").count()) === 1,
  );
  const body = page.locator("#article-wrapper p + div > div").first();
  check(
    "the body shows its BBCode, no smilies and no HTML",
    (await body.locator("strong").innerText()) === "Bold" &&
      (await body.innerText()).includes(":) <i>raw</i>") &&
      (await body.locator("img").count()) === 0 &&
      (await body.locator("i").count()) === 0,
  );
  check("the body keeps its link", (await body.locator('a[href="https://example.com/"]').innerText()) === "a link");
  check(
    "the author shows with Holo's icon",
    (await page.locator('#article-wrapper img[alt="User Profile"]').count()) === 1 &&
      (await page.locator("#article-wrapper b").last().innerText()) === "Admin-1",
  );

  await page.locator('#article-wrapper img[alt="User Profile"]').click();
  await page.waitForURL("**/home/Admin-1");
  check("the author's icon opens the author's home", (await page.title()).endsWith("~ User Profile - Admin-1"));
  await page.goBack();

  await page.locator("#article-wrapper").getByRole("link", { name: "Updates", exact: true }).click();
  await page.waitForURL("**/news?category=Updates");
  await shot(page, "news-category");
  check("the category has Holo's title", (await page.title()).endsWith("~ Category Listing"));
  check(
    "the category says what it lists",
    (await page.locator("#article-wrapper h2 + div").innerText()) ===
      "This is an overview of the last 25 articles posted in the category Updates.",
  );
  check(
    "the category lists its own articles",
    JSON.stringify(await texts("#article-wrapper li")) ===
      JSON.stringify(["2026-11-03 - Another update", "2026-11-01 - Welcome to the hotel"]),
    JSON.stringify(await texts("#article-wrapper li")),
  );

  await page.locator("#article-archive").getByRole("link", { name: "Summer party" }).click();
  await page.waitForURL(/\/news\/\d+$/);
  await page.locator("#article-wrapper").getByRole("link", { name: "Events & Competitions" }).click();
  await page.waitForLoadState();
  check(
    "a category with an ampersand finds its articles",
    JSON.stringify(await texts("#article-wrapper li")) === JSON.stringify(["2026-11-02 - Summer party"]),
    page.url(),
  );

  const missing = await page.goto(base + "/news/999");
  check(
    "an unknown article shows the archive with status 404",
    missing.status() === 404 && (await page.locator("#article-wrapper h2").innerText()) === "Reborn News Archive",
  );

  sql("DELETE FROM news_articles");
  await page.goto(base + "/news");
  await shot(page, "news-empty");
  check(
    "without news, Holo's texts say so",
    (await page.getByText("No news to display yet.").isVisible()) &&
      (await page.getByText("No headlines to display yet.").isVisible()),
  );

  check("no page failed", problems.length === 0, problems.join(", "));
  await context.close();
}
