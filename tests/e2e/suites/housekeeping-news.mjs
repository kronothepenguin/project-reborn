import { readFileSync } from "node:fs";
import path from "node:path";
import { root } from "../lib/hotel.mjs";
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

// Six stripes of 100 pixels across a picture of 600x200.
const stripes = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
];
const transparent = [0, 0, 0, 0];

// drawn is a file the browser draws: the stripes, stretched across its width.
async function drawn(page, width, height, type) {
  const url = await page.evaluate(
    ({ width, height, type, stripes }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      stripes.forEach(([r, g, b], i) => {
        context.fillStyle = `rgb(${r}, ${g}, ${b})`;
        context.fillRect((i * width) / 6, 0, width / 6, height);
      });
      return canvas.toDataURL(type);
    },
    { width, height, type, stripes },
  );
  return Buffer.from(url.split(",")[1], "base64");
}

// pixelsOf reads points of a canvas, or of the image an image document shows.
const pixelsOf = (locator, points) =>
  locator.evaluate(async (element, points) => {
    let canvas = element;
    if (element instanceof HTMLImageElement) {
      await element.decode();
      canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
      canvas.getContext("2d").drawImage(element, 0, 0);
    }
    const context = canvas.getContext("2d");
    return points.map(([x, y]) => [...context.getImageData(x, y, 1, 1).data]);
  }, points);

const near = (got, want) =>
  got.length === want.length &&
  got.every((pixel, i) =>
    want[i][3] === 0
      ? pixel[3] === 0
      : pixel.every((value, c) => Math.abs(value - (want[i][c] ?? 255)) <= 3),
  );

// Points on the middle row: at the left, in the middle and at the right.
const row = [
  [10, 93],
  [140, 93],
  [290, 93],
];

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// imageEditor cuts, fits and uploads pictures on the edit form of an article,
// and leaves the last upload in the topstory field.
async function imageEditor(t, page) {
  const { base, check, eventually, shot, sql } = t;
  const [[adminUser]] = sql(
    "SELECT user_id FROM avatars WHERE name = 'Admin-1'",
  );
  const preview = page.locator("#news-topstory-preview");
  const editor = page.getByLabel("The picture to upload");
  // Playwright cannot read a Blob that a request sends, and Chromium may drop
  // the answer from its cache, so the page keeps both of the last upload.
  await page.evaluate(() => {
    const send = window.fetch;
    window.fetch = async (url, init) => {
      if (!(init?.body instanceof Blob)) return send(url, init);
      const body = [...new Uint8Array(await init.body.arrayBuffer())];
      const response = await send(url, init);
      window.lastUpload = { body, answer: await response.clone().json() };
      return response;
    };
  });
  const use = async () => {
    await page.evaluate(() => (window.lastUpload = null));
    await page.getByRole("button", { name: "Use this picture" }).click();
    await page.waitForFunction(() => window.lastUpload !== null);
    const { body, answer } = await page.evaluate(() => window.lastUpload);
    await page
      .getByRole("button", { name: "Use this picture" })
      .and(page.locator(":enabled"))
      .waitFor();
    return { body: Buffer.from(body), answer };
  };
  const idOf = (address) => address.match(/\d+/)?.[0] ?? 0;

  await page.setInputFiles("#news-image-file", {
    name: "stripes.png",
    mimeType: "image/png",
    buffer: await drawn(page, 600, 200, "image/png"),
  });
  await editor.waitFor();
  check(
    "a picture opens in Cut, filling the frame from its middle",
    (await page
      .getByRole("button", { name: "Cut" })
      .getAttribute("aria-pressed")) === "true" &&
      near(await pixelsOf(editor, row), [stripes[1], stripes[2], stripes[4]]),
    JSON.stringify(await pixelsOf(editor, row)),
  );

  const box = await editor.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  check(
    "dragging moves the picture, and it stops at the picture's edge",
    near(await pixelsOf(editor, row), [stripes[0], stripes[1], stripes[3]]),
    JSON.stringify(await pixelsOf(editor, row)),
  );

  await page.getByLabel("Zoom").fill("2");
  check(
    "zooming keeps the middle of the frame where it was",
    near(await pixelsOf(editor, row), [stripes[0], stripes[1], stripes[2]]),
    JSON.stringify(await pixelsOf(editor, row)),
  );
  await shot(page, "news-image-cut");

  await page.getByRole("button", { name: "Fit" }).click();
  const fitted = [
    [150, 10],
    [140, 93],
    [290, 93],
    [150, 180],
  ];
  const fitWant = [transparent, stripes[2], stripes[5], transparent];
  check(
    "Fit shows the whole picture, with transparent bands",
    near(await pixelsOf(editor, fitted), fitWant),
    JSON.stringify(await pixelsOf(editor, fitted)),
  );
  await shot(page, "news-image-fit");

  const fit = await use();
  check(
    "the editor sends a PNG of the frame",
    fit.body.subarray(0, 8).equals(pngSignature) &&
      /^\/news\/images\/\d+\.png$/.test(fit.answer.path),
    JSON.stringify(fit.answer),
  );
  check(
    "the upload becomes the topstory image and its preview",
    (await page.getByRole("status").innerText()) ===
      "Uploaded as the topstory image. Save the article to keep it." &&
      (await page.inputValue("#news-topstory")) === fit.answer.path &&
      (await preview.getAttribute("src")) === `${base}${fit.answer.path}` &&
      (await eventually(() => loaded(preview))),
    await preview.getAttribute("src"),
  );
  const [[format, width, height, creator]] = sql(
    `SELECT format, width, height, created_by_user_id FROM images WHERE id = ${idOf(fit.answer.path)}`,
  );
  check(
    "the image is kept with who uploaded it",
    format === "png" &&
      Number(width) === 300 &&
      Number(height) === 187 &&
      creator === adminUser,
    `${format} ${width}x${height} ${creator}`,
  );
  const viewer = await page.context().newPage();
  await viewer.goto(`${base}${fit.answer.path}`);
  check(
    "the CMS serves the picture as it was previewed",
    near(await pixelsOf(viewer.locator("img"), fitted), fitWant),
    JSON.stringify(await pixelsOf(viewer.locator("img"), fitted)),
  );
  await viewer.close();

  const gif = path.join(
    root,
    "packages/cms/public/web-gallery/images/top-story/accessories_top.gif",
  );
  await page.setInputFiles("#news-image-file", gif);
  await page
    .getByText(
      "This GIF is already 300x187, so it goes up as it is, with its animation.",
    )
    .waitFor();
  check(
    "a GIF of 300x187 skips the editor",
    (await editor.count()) === 0 &&
      (await page.getByAltText("The GIF to upload").isVisible()),
  );
  await shot(page, "news-image-gif");
  const kept = await use();
  const [[gifFormat]] = sql(
    `SELECT format FROM images WHERE id = ${idOf(kept.answer.path ?? "")}`,
  );
  check(
    "a GIF of 300x187 goes up as it is, and stays a GIF",
    kept.body.equals(readFileSync(gif)) &&
      /^\/news\/images\/\d+\.gif$/.test(kept.answer.path) &&
      gifFormat === "gif",
    JSON.stringify(kept.answer),
  );

  await page.setInputFiles("#news-image-file", {
    name: "photo.jpg",
    mimeType: "image/jpeg",
    buffer: await drawn(page, 400, 300, "image/jpeg"),
  });
  await editor.waitFor();
  const photo = await use();
  check(
    "any other picture goes up as the editor's PNG",
    photo.body.subarray(0, 8).equals(pngSignature) &&
      /^\/news\/images\/\d+\.png$/.test(photo.answer.path),
    JSON.stringify(photo.answer),
  );

  await page.setInputFiles("#news-image-file", {
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not a picture"),
  });
  check(
    "a file that is no picture is explained",
    (await page.getByRole("alert").innerText()) ===
      "This file is not a picture." &&
      (await page.getByRole("button", { name: "Use this picture" }).count()) ===
        0,
  );

  await page.getByRole("button", { name: "Uploaded" }).click();
  const uploads = [photo, kept, fit].map((upload) => upload.answer.path);
  check(
    "Uploaded offers this page's uploads, newest first, the field's pressed",
    (await thumbnailsOf(page)).join("|") === uploads.join("|") &&
      (await pressedOf(page)) === photo.answer.path &&
      (await page.getByRole("alert").count()) === 0,
    (await thumbnailsOf(page)).join("|"),
  );
  check(
    "the thumbnails load from the CMS",
    await eventually(() =>
      page
        .getByRole("list", { name: "Uploaded pictures" })
        .getByRole("img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth === 300),
        ),
    ),
  );
  await shot(page, "news-image-uploaded");
  await page
    .getByRole("button", { name: fit.answer.path, exact: true })
    .click();
  check(
    "a thumbnail fills the field and the preview, as an upload does",
    (await page.inputValue("#news-topstory")) === fit.answer.path &&
      (await preview.getAttribute("src")) === `${base}${fit.answer.path}` &&
      (await page.getByRole("status").innerText()) ===
        "Chosen as the topstory image. Save the article to keep it." &&
      (await pressedOf(page)) === fit.answer.path,
    await page.inputValue("#news-topstory"),
  );
  return { picked: fit.answer.path, uploads };
}

// thumbnailsOf lists the paths of the Uploaded mode's pictures, in their order.
const thumbnailsOf = (page) =>
  page
    .getByRole("list", { name: "Uploaded pictures" })
    .getByRole("img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("alt")));

// pressedOf is the path of the pressed thumbnail, or "" when none is.
const pressedOf = async (page) => {
  const pressed = page
    .getByRole("list", { name: "Uploaded pictures" })
    .locator('button[aria-pressed="true"] img');
  return (await pressed.count()) === 1 ? pressed.getAttribute("alt") : "";
};

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
  await page.getByRole("button", { name: "Uploaded" }).click();
  check(
    "Uploaded says when nothing was uploaded yet",
    await page.getByText("No pictures were uploaded yet.").isVisible(),
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

  await page.goto(`${base}/news/${id}`);
  check(
    "the article written in housekeeping appears on the site, escaped and with its BBCode",
    (await page.locator("#article-wrapper h2").innerText()) === "Grand <Opening> & More" &&
      (await page.locator("#article-wrapper").getByText("The hotel opens its doors.").isVisible()) &&
      (await page.locator("#article-wrapper strong").filter({ hasText: "Welcome" }).count()) === 1,
  );
  await page.goto(`${base}/community`);
  check(
    "the article leads the community page's news promo",
    (await page.locator('#topstories [data-story="shown"] h3').innerText()) === "Grand <Opening> & More",
  );
  await page.goto(`${hk}/news/${id}`);

  await page.fill("#news-topstory", "javascript:alert(1)");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Update Article" }).click();
  check("a bad picture answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "a bad picture is explained, and the form keeps what was typed",
    (await page.getByRole("alert").innerText()) ===
      "The topstory image must be one of the local images, an uploaded image or an http(s) address." &&
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

  const { picked, uploads } = await imageEditor(t, page);
  await page.getByRole("button", { name: "Update Article" }).click();
  await page.waitForURL(/updated=1/);
  const [[savedImage, linked]] = sql(
    `SELECT image_url, image_id FROM news_articles WHERE id = ${id}`,
  );
  check(
    "the article keeps the picked picture once saved, linked to it",
    savedImage === picked && `/news/images/${linked}.png` === picked,
    `${savedImage} ${linked} ${picked}`,
  );
  await page.goto(`${hk}/news/${id}`);
  await page.getByRole("button", { name: "Uploaded" }).click();
  check(
    "the form offers every upload again, the article's pressed",
    (await thumbnailsOf(page)).join("|") === uploads.join("|") &&
      (await pressedOf(page)) === picked,
    (await thumbnailsOf(page)).join("|"),
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
  const created = await logged("news.create");
  const updated = await logged("news.update");
  const deleted = await logged("news.delete");
  const images = await logged("news.image");
  const rows = [...created, ...updated, ...deleted, ...images];
  check(
    "the log holds each change, and who made it",
    created.length === 1 &&
      created[0].includes(`Grand <Opening> & More (ID: ${id})`) &&
      updated.length === 2 &&
      updated.some((row) =>
        row.includes(`Grand Opening (ID: ${id}): title, category, topstory`),
      ) &&
      updated.some((row) =>
        row.includes(`Grand Opening (ID: ${id}): topstory`),
      ) &&
      deleted.length === 1 &&
      deleted[0].includes(`Grand Opening (ID: ${id})`) &&
      images.length === 3 &&
      images.some((row) => row.includes(picked)) &&
      rows.every((row) => row.includes("Admin-1 (ID:")),
    rows.join(" | "),
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
  const denied = await helper.page.evaluate(async (url) => {
    const response = await fetch(url, { method: "POST", body: "GIF89a" });
    return response.status;
  }, `${hk}/news/images`);
  check("staff without the attribute cannot upload", denied === 403);
  await helper.context.close();
}
