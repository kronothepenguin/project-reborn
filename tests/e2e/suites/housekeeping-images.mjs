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
  await refused;
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
  await deleteButton(page, used).click();
  await page.waitForURL(/deleted=1/);

  // Twenty-one uploads make three pages of ten, newest first: the second page
  // holds pictures[10] to pictures[1], one of them in an article.
  const pictures = [];
  for (let i = 0; i < 21; i++) {
    pictures.push(await upload(page, `hsl(${i * 17}, 70%, 50%)`));
  }
  await page.goto(`${hk}/news/new`);
  await page.fill("#news-title", "Paged Picture");
  await page.fill("#news-topstory", pictures[5]);
  await page.getByRole("button", { name: "Publish Article" }).click();
  await page.waitForURL(/published=1/);
  const [[paged]] = sql(
    "SELECT id FROM news_articles WHERE title = 'Paged Picture'",
  );

  const shown = () => page.locator("main tbody tr:visible").allInnerTexts();
  const paths = (rows) =>
    rows.map((row) => row.match(/\/news\/images\/\d+\.png/)?.[0]).join(" ");
  const newer = page.getByRole("link", { name: "Newer", exact: true });
  const older = page.getByRole("link", { name: "Older", exact: true });

  await page.goto(`${hk}/images`);
  await older.waitFor();
  let pageRows = await shown();
  check(
    "the list shows ten pictures a page, newest first, with Older under them",
    pageRows.length === 10 &&
      pageRows[0].includes(pictures[20]) &&
      pageRows[9].includes(pictures[11]) &&
      (await newer.count()) === 0 &&
      (await older.getAttribute("href")) === "/housekeeping/images?page=2",
    paths(pageRows),
  );

  await page.evaluate(() => (window.stayed = true));
  await older.click();
  await page.waitForURL("**/housekeeping/images?page=2");
  pageRows = await shown();
  check(
    "Older turns to the next ten without loading the page again",
    pageRows.length === 10 &&
      pageRows[0].includes(pictures[10]) &&
      pageRows[9].includes(pictures[1]) &&
      (await newer.getAttribute("href")) === "/housekeeping/images?page=1" &&
      (await older.getAttribute("href")) === "/housekeeping/images?page=3" &&
      (await page.evaluate(() => window.stayed)) === true,
    paths(pageRows),
  );
  await shot(page, "images-pages");

  await older.click();
  await page.waitForURL("**/housekeeping/images?page=3");
  pageRows = await shown();
  check(
    "the last page holds the oldest picture, with only Newer",
    pageRows.length === 1 &&
      pageRows[0].includes(pictures[0]) &&
      (await newer.count()) === 1 &&
      (await older.count()) === 0,
    paths(pageRows),
  );

  await page.goBack();
  await page.waitForURL("**/housekeeping/images?page=2");
  const back = await eventually(async () =>
    (await shown())[0]?.includes(pictures[10]),
  );
  await page.reload();
  await older.waitFor();
  pageRows = await shown();
  check(
    "Back returns to the page before, and a reload keeps it",
    back && pageRows.length === 10 && pageRows[0].includes(pictures[10]),
    paths(pageRows),
  );

  await deleteButton(page, pictures[3]).click();
  await page.waitForURL(/\?deleted=1&page=2$/);
  await newer.waitFor();
  pageRows = await shown();
  check(
    "a delete on the second page answers on the second page",
    (await page.getByRole("status").innerText()) ===
      "Image deleted successfully." &&
      pageRows.length === 10 &&
      !pageRows.some((row) => row.includes(pictures[3])) &&
      pageRows[9].includes(pictures[0]) &&
      (await older.count()) === 0,
    paths(pageRows),
  );

  const refusedHere = page.waitForResponse(
    (r) => r.request().method() === "POST",
  );
  await deleteButton(page, pictures[5]).click();
  const refusal = (await refusedHere).status();
  await page.waitForLoadState();
  await newer.waitFor();
  pageRows = await shown();
  check(
    "a refused delete on the second page answers on the second page",
    refusal === 422 &&
      (await page.getByRole("alert").innerText()).includes(
        `Paged Picture (ID: ${paged})`,
      ) &&
      new URL(page.url()).searchParams.get("page") === "2" &&
      pageRows.length === 10 &&
      pageRows.some((row) => row.includes(pictures[5])),
    `${refusal} ${page.url()} ${paths(pageRows)}`,
  );

  await page.goto(`${hk}/images?page=9`);
  await newer.waitFor();
  const past = await shown();
  await page.goto(`${hk}/images?page=two`);
  await older.waitFor();
  pageRows = await shown();
  check(
    "a page past the last shows the last, and one that is no number the first",
    past[0].includes(pictures[10]) &&
      past.length === 10 &&
      pageRows[0].includes(pictures[20]) &&
      (await newer.count()) === 0,
    `${paths(past)} / ${paths(pageRows)}`,
  );

  const plain = await t.browser.newContext({ javaScriptEnabled: false });
  await plain.addCookies(await context.cookies());
  const plainPage = await plain.newPage();
  await plainPage.goto(`${hk}/images`);
  check(
    "without JavaScript the list shows every picture",
    (await plainPage.locator("main tbody tr:visible").count()) === 20 &&
      (await plainPage
        .getByRole("link", { name: /^(Newer|Older)$/ })
        .count()) === 0,
  );
  await plain.close();

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
