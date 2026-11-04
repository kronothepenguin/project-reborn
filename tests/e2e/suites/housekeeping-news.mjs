import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

const topStory = (name) => `/web-gallery/images/top-story/${name}`;

const categories = [
  "HoloCMS",
  "News",
  "Furniture",
  "Updates",
  "Server",
  "Credits",
  "Reborn Club",
  "Maintenance",
  "Technical",
  "Downtime",
  "Website",
  "Special Offers",
  "Sponsored",
  "Events & Competitions",
  "Security",
  "Staff",
  "Announcements",
  "Tips",
  "Holograph Emulator",
  "Other",
];

// loaded reports whether the preview shows a picture of 300x187.
const loaded = (preview) =>
  preview.evaluate(
    (img) =>
      img.complete && img.naturalWidth === 300 && img.naturalHeight === 187,
  );

export default async function (t) {
  const { base, check, eventually, hk, shot, sql } = t;
  const { context, page, problems } = await session(t, "Admin-1");
  const [[adminHabbo]] = sql("SELECT id FROM avatars WHERE name = 'Admin-1'");

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Compose News Item" }).click();
  await page.waitForURL("**/housekeeping/news/new");
  check(
    "compose is under Site & Content",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content",
  );
  check(
    "the compose page has Holo's title",
    (await page.title()) ===
      "Project Reborn Housekeeping | Compose New Article",
    await page.title(),
  );
  const compose = await page.locator("main section").innerText();
  check(
    "the form has Holo's heading, labels and help, with BBCode for the story",
    [
      "Compose News Article",
      "Title",
      "The full title of your article.",
      "News Category",
      "Topstory Image",
      "The URL to the topstory image.",
      "Short Story",
      "A small introduction to the article.\nHTML is not allowed here.",
      "Story",
      "The actual news message.\nBBCode is allowed here.",
    ].every((text) => compose.includes(text)),
    compose,
  );
  check(
    "the button is Holo's",
    await page.getByRole("button", { name: "Publish Article" }).isVisible(),
  );
  const offered = await page.locator("#news-category option").allInnerTexts();
  check(
    "the categories are Holo's, with the club of the site",
    offered.join("|") === categories.join("|") &&
      (await page.inputValue("#news-category")) === "HoloCMS",
    offered.join("|"),
  );
  const pictures = await page
    .locator("#news-topstories option")
    .evaluateAll((options) => options.map((option) => option.value));
  check(
    "the picker offers Holo's five local pictures",
    pictures.join("|") ===
      [
        "accessories_top.gif",
        "top_story_news.png",
        "top_story_newsflash.png",
        "top_story_poll2.png",
        "topstory_accessories2.gif",
      ]
        .map(topStory)
        .join("|"),
    pictures.join("|"),
  );
  check(
    "the picture starts as the default local one",
    (await page.inputValue("#news-topstory")) ===
      topStory("top_story_news.png"),
  );
  const preview = page.locator("#news-topstory-preview");
  check(
    "the preview loads the picture from the CMS",
    (await preview.getAttribute("src")) ===
      `${base}${topStory("top_story_news.png")}` &&
      (await eventually(() => loaded(preview))),
    await preview.getAttribute("src"),
  );
  await shot(page, "news-compose");

  await page.fill("#news-topstory", topStory("top_story_poll2.png"));
  check(
    "the preview follows the field",
    (await preview.getAttribute("src")) ===
      `${base}${topStory("top_story_poll2.png")}` &&
      (await eventually(() => loaded(preview))),
    await preview.getAttribute("src"),
  );

  await page.fill("#news-title", "Grand <Opening> & More");
  await page.selectOption("#news-category", "Events & Competitions");
  await page.fill("#news-short-story", "The hotel opens its doors.");
  await page.fill(
    "#news-story",
    "[b]Welcome[/b] to the hotel.\nSee you there!",
  );
  await page.getByRole("button", { name: "Publish Article" }).click();
  await page.waitForURL(/published=1/);
  check(
    "a new article gets Holo's answer",
    (await page.getByRole("status").innerText()) ===
      "Article published successfully.",
  );
  const [[id, category, image, summary, body, author, published]] = sql(
    "SELECT id, category, image_url, summary, body, avatar_id, published_at FROM news_articles WHERE title = 'Grand <Opening> & More'",
  );
  check(
    "the article is saved as typed, by the active habbo",
    category === "Events & Competitions" &&
      image === topStory("top_story_poll2.png") &&
      summary === "The hotel opens its doors." &&
      body.replaceAll("\r\n", "\n") ===
        "[b]Welcome[/b] to the hotel.\nSee you there!" &&
      author === adminHabbo,
    `${category} ${image} ${summary} ${JSON.stringify(body)} ${author}`,
  );
  const today = new Date().toISOString().slice(0, 10);
  const row = await page
    .getByRole("row", { name: /Grand <Opening>/ })
    .innerText();
  check(
    "the list shows the article with its summary, date and author",
    row.includes(String(id)) &&
      row.includes("The hotel opens its doors.") &&
      row.includes(today) &&
      row.includes("Admin-1"),
    row,
  );
  const headings = await page.locator("main thead th").allInnerTexts();
  check(
    "the list has Holo's heading and columns",
    (await page.locator("main h2").innerText()) === "News Articles" &&
      headings.join("|") === "ID|Title|Date|Author|Edit|Delete",
    headings.join("|"),
  );
  check(
    "the list links to the compose form",
    (await page
      .getByRole("link", { name: "Compose New News Item" })
      .getAttribute("href")) === "/housekeeping/news/new",
  );
  await shot(page, "news-list");

  await page
    .getByRole("row", { name: /Grand <Opening>/ })
    .getByRole("link", { name: "Edit" })
    .click();
  await page.waitForURL(`**/housekeeping/news/${id}`);
  check(
    "the edit form has Holo's heading with the title",
    (await page.locator("main h2").innerText()) ===
      "Edit News Article (Grand <Opening> & More)",
    await page.locator("main h2").innerText(),
  );
  check(
    "the edit form selects Events & Competitions, which Holo's did not",
    (await page.inputValue("#news-category")) === "Events & Competitions",
  );
  check(
    "the edit form shows the saved picture",
    (await page.inputValue("#news-topstory")) ===
      topStory("top_story_poll2.png") &&
      (await preview.getAttribute("src")) ===
        `${base}${topStory("top_story_poll2.png")}`,
  );
  check(
    "the edit form links to the article on the site",
    (await page
      .getByRole("link", { name: "View on site" })
      .getAttribute("href")) === `${base}/news/${id}`,
  );
  await shot(page, "news-edit");

  await page.fill("#news-topstory", "javascript:alert(1)");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Update Article" }).click();
  check("a bad picture answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "a bad picture is explained, and the form keeps what was typed",
    (await page.getByRole("alert").innerText()) ===
      "The topstory image must be one of the local images or an http(s) address." &&
      (await page.inputValue("#news-topstory")) === "javascript:alert(1)" &&
      (await page.locator("main h2").innerText()) ===
        "Edit News Article (Grand <Opening> & More)",
  );

  await page.fill("#news-title", "Grand Opening");
  await page.selectOption("#news-category", "Other");
  await page.fill("#news-topstory", topStory("accessories_top.gif"));
  await page.getByRole("button", { name: "Update Article" }).click();
  await page.waitForURL(/updated=1/);
  check(
    "an edit gets Holo's answer",
    (await page.getByRole("status").innerText()) ===
      "Article updated successfully.",
  );
  const [[title, newCategory, newImage, keptAuthor, keptDate]] = sql(
    `SELECT title, category, image_url, avatar_id, published_at FROM news_articles WHERE id = ${id}`,
  );
  check(
    "the edit is saved, and the author and the date stay",
    title === "Grand Opening" &&
      newCategory === "Other" &&
      newImage === topStory("accessories_top.gif") &&
      keptAuthor === adminHabbo &&
      keptDate === published,
    `${title} ${newCategory} ${newImage} ${keptAuthor} ${keptDate} ${published}`,
  );
  await page.goto(`${hk}/news/${id}`);
  check(
    "Other stays selected, which Holo's form lost",
    (await page.inputValue("#news-category")) === "Other",
  );

  await page.goto(`${hk}/news`);
  await page
    .getByRole("row", { name: /Grand Opening/ })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForURL(/deleted=1/);
  const [[left]] = sql("SELECT COUNT(*) FROM news_articles");
  check(
    "a delete gets Holo's answer and the article is gone",
    (await page.getByRole("status").innerText()) ===
      "Article deleted successfully." &&
      Number(left) === 0 &&
      (await page.getByRole("row", { name: /Grand Opening/ }).count()) === 0,
  );

  const missing = await page.goto(`${hk}/news/${id}`);
  check(
    "an article that is gone answers Holo's message with 404",
    missing.status() === 404 &&
      (await page.getByRole("alert").innerText()) ===
        "Unable to edit article; this article does not exist!",
  );

  await page.goto(`${hk}/logs`);
  const logged = (action) =>
    page
      .getByRole("row", { name: new RegExp(action.replace(".", "\\.")) })
      .allInnerTexts();
  const [created] = await logged("news.create");
  const [updated] = await logged("news.update");
  const [deleted] = await logged("news.delete");
  check(
    "the log holds each change, and who made it",
    created?.includes(`Grand <Opening> & More (ID: ${id})`) &&
      updated?.includes(
        `Grand Opening (ID: ${id}): title, category, topstory`,
      ) &&
      deleted?.includes(`Grand Opening (ID: ${id})`) &&
      [created, updated, deleted].every((row) => row.includes("Admin-1 (ID:")),
    [created, updated, deleted].join(" | "),
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();

  const helper = await session(t, "Helper");
  for (const path of ["/news", "/news/new"]) {
    const response = await helper.page.goto(`${hk}${path}`);
    check(
      `staff without the attribute get Access Denied on ${path}`,
      response.status() === 403 &&
        (await helper.page.locator("h1").innerText()) === "Access Denied",
    );
  }
  await helper.context.close();
}
