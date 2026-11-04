import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

// upload sends a 300x187 PNG of one color, drawn in the page, as the news
// editor sends its picture, and answers the image's path.
const upload = (page, color) =>
  page.evaluate(async (color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 187;
    const context = canvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(0, 0, 300, 187);
    const body = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    const response = await fetch("/housekeeping/news/images", {
      method: "POST",
      body,
    });
    return (await response.json()).path;
  }, color);

const deleteButton = (page, path) =>
  page
    .getByRole("row", { name: new RegExp(path.replaceAll(".", "\\.")) })
    .getByRole("button", { name: "Delete" });

export default async function (t) {
  const { base, check, eventually, hk, shot, sql } = t;
  const { context, page, problems } = await session(t, "Admin-1");

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Uploaded Images" }).click();
  await page.waitForURL("**/housekeeping/images");
  check(
    "the page is under Site & Content, named after its link",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content" &&
      (await page.title()) === "Project Reborn Housekeeping | Uploaded Images",
    await page.title(),
  );
  const menu = await page
    .locator("aside section")
    .filter({ hasText: "Content Management" })
    .locator("a")
    .allInnerTexts();
  check(
    "the link follows Manage Existing News Items",
    menu.slice(-2).join("|") === "Manage Existing News Items|Uploaded Images",
    menu.join("|"),
  );
  check(
    "a hotel without uploads lists nothing",
    (await page.locator("main h2").innerText()) === "Uploaded Images" &&
      (await page.locator("main tbody").innerText()).includes("Nothing found."),
  );

  const used = await upload(page, "red");
  const unused = await upload(page, "blue");
  await page.goto(`${hk}/news/new`);
  await page.fill("#news-title", "Red Letter Day");
  await page.fill("#news-topstory", used);
  await page.getByRole("button", { name: "Publish Article" }).click();
  await page.waitForURL(/published=1/);
  const [[article]] = sql(
    "SELECT id FROM news_articles WHERE title = 'Red Letter Day'",
  );

  await page.goto(`${hk}/images`);
  const headings = await page.locator("main thead th").allInnerTexts();
  check(
    "the list has its columns",
    headings.join("|") === "Image|Format|Size|Uploaded by|Date|Articles|Delete",
    headings.join("|"),
  );
  const rows = await page.locator("main tbody tr").allInnerTexts();
  check(
    "the uploads are listed newest first, with their format, size, uploader and articles",
    rows.length === 2 &&
      rows[0].includes(unused) &&
      rows[1].includes(used) &&
      rows.every(
        (row) =>
          row.includes("PNG") &&
          / KB/.test(row) &&
          row.includes("Admin-1 (ID:"),
      ) &&
      rows[0].includes("None") &&
      rows[1].includes(`Red Letter Day (ID: ${article})`),
    rows.join(" | "),
  );
  check(
    "the thumbnails load from the CMS",
    (
      await page
        .locator("main tbody img")
        .evaluateAll((images) =>
          images.map((image) => image.getAttribute("src")),
        )
    ).join("|") === [`${base}${unused}`, `${base}${used}`].join("|") &&
      (await eventually(() =>
        page
          .locator("main tbody img")
          .evaluateAll((images) =>
            images.every(
              (image) => image.complete && image.naturalWidth === 300,
            ),
          ),
      )),
  );
  check(
    "an article links to its edit form",
    (await page
      .getByRole("link", { name: `Red Letter Day (ID: ${article})` })
      .getAttribute("href")) === `/housekeeping/news/${article}`,
  );
  await shot(page, "images");

  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await deleteButton(page, used).click();
  check("a picture in use answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "the answer names the article to change or delete first",
    (await page.getByRole("alert").innerText()) ===
      `Unable to delete image; it is the topstory image of Red Letter Day (ID: ${article}). Change or delete that article first.` &&
      (await page.locator("main tbody tr").count()) === 2,
    await page.getByRole("alert").innerText(),
  );
  await shot(page, "images-in-use");

  await deleteButton(page, unused).click();
  await page.waitForURL(/deleted=1/);
  const [[left]] = sql("SELECT COUNT(*) FROM images");
  const gone = await fetch(`${base}${unused}`);
  check(
    "an unused picture is deleted, and the CMS no longer serves it",
    (await page.getByRole("status").innerText()) ===
      "Image deleted successfully." &&
      Number(left) === 1 &&
      (await page.locator("main tbody tr").count()) === 1 &&
      gone.status === 404,
    `${left} ${gone.status}`,
  );

  await page
    .getByRole("link", { name: `Red Letter Day (ID: ${article})` })
    .click();
  await page.waitForURL(`**/housekeeping/news/${article}`);
  await page.fill(
    "#news-topstory",
    "/web-gallery/images/top-story/top_story_news.png",
  );
  await page.getByRole("button", { name: "Update Article" }).click();
  await page.waitForURL(/updated=1/);
  await page.goto(`${hk}/images`);
  check(
    "the article's old picture is unused once it takes another",
    (await page.locator("main tbody tr").innerText()).includes("None"),
  );
  await deleteButton(page, used).click();
  await page.waitForURL(/deleted=1/);
  check(
    "then it is deleted too",
    (await page.locator("main tbody").innerText()).includes("Nothing found."),
  );

  await page.goto(`${hk}/logs`);
  const deleted = await page
    .getByRole("row", { name: /images\.delete/ })
    .allInnerTexts();
  check(
    "the log holds each delete, and who made it",
    deleted.length === 2 &&
      deleted.some((row) => row.includes(unused)) &&
      deleted.some((row) => row.includes(used)) &&
      deleted.every((row) => row.includes("Admin-1 (ID:")),
    deleted.join(" | "),
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();

  const helper = await session(t, "Helper");
  const response = await helper.page.goto(`${hk}/images`);
  check(
    "staff without the attribute get Access Denied",
    response.status() === 403 &&
      (await helper.page.locator("h1").innerText()) === "Access Denied",
  );
  await helper.context.close();
}
