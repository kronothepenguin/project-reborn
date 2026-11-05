import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// Frank joins the installer's Moderator group, which holds the banners and not
// the news, as Holo's rank 6.
export const prepare = ({ sql }) => {
  seedStaff(sql);
  sql(`INSERT INTO access_group_members (access_group_id, user_id, granted_at)
    SELECT access_groups.id, users.id, '2026-11-01 12:00:00.000000000+00:00'
    FROM access_groups, users
    WHERE access_groups.name = 'Moderator' AND users.email = 'frank@example.com'`);
};

const forgotten = "You're something forgotten!";

export default async function (t) {
  const { base, check, hk, shot, sql } = t;
  const { context, page, problems } = await session(t, "Admin-1");
  const addBox = page.locator("main section").first();
  const listBox = page.locator("main section").nth(1);

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Manage Site Banners" }).click();
  await page.waitForURL("**/housekeeping/banners");
  check(
    "the banners are under Site & Content",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content",
  );
  check(
    "the page is named after its link, not Wordfilter Options",
    (await page.title()) ===
      "Project Reborn Housekeeping | Manage Site Banners",
    await page.title(),
  );
  const menu = await page
    .locator("aside section")
    .filter({ hasText: "Content Management" })
    .locator("a")
    .allInnerTexts();
  check(
    "the Content Management box has Holo's links in Holo's order, with the content tool's forms first",
    menu.join("|") ===
      [
        "Manage Site Content",
        "Staff Module",
        "Discussion Board Module",
        "Manage Site Banners",
        "Add stickers or backgrounds to homes catalogue",
        "Compose News Item",
        "Manage Existing News Items",
        "Uploaded Images",
      ].join("|"),
    menu.join("|"),
  );
  const form = await addBox.innerText();
  check(
    "the add form has Holo's heading, texts, labels and help",
    [
      "Add banners",
      "Add or edit banners on your site!",
      "You're already finished in 1 minute!",
      "Text",
      "The text below your banner.",
      "Url of banner",
      "What's the url of your banner?",
      "Url",
      "To what site are they going when they click on the text/banner?",
      "Enable/disable",
      "Enable or disable the banner.",
    ].every((text) => form.includes(text)),
    form,
  );
  check(
    "a new banner starts disabled, with Holo's lengths",
    (await page.getByLabel("Disabled").isChecked()) &&
      !(await page.getByLabel("Enabled").isChecked()) &&
      (await page.locator("#banner-text").getAttribute("maxlength")) === "50" &&
      (await page.locator("#banner-image").getAttribute("maxlength")) ===
        "255" &&
      (await page.locator("#banner-link").getAttribute("maxlength")) === "255",
  );
  check(
    "the list has Holo's heading and nothing in it yet",
    (await listBox.locator("h2").innerText()) === "Banner editer" &&
      (await listBox.innerText()).includes("Nothing found."),
  );
  await shot(page, "banners");

  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Add banner" }).click();
  check("an empty banner answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "an empty banner gets Holo's message, in the add form",
    (await addBox.getByRole("alert").innerText()) === forgotten,
  );

  await page.fill("#banner-text", "Visit <the> Forum & more");
  await page.fill(
    "#banner-image",
    "/web-gallery/images/top-story/top_story_news.png",
  );
  await page.fill("#banner-link", "javascript:alert(1)");
  await page.getByLabel("Enabled").check();
  await page.getByRole("button", { name: "Add banner" }).click();
  await page.waitForLoadState();
  check(
    "a script for a link is refused, and the form keeps what was typed",
    (await addBox.getByRole("alert").innerText()) ===
      "The urls must be http(s) addresses or paths of the site, such as /community." &&
      (await page.inputValue("#banner-text")) === "Visit <the> Forum & more" &&
      (await page.inputValue("#banner-link")) === "javascript:alert(1)" &&
      (await page.getByLabel("Enabled").isChecked()),
  );

  await page.fill("#banner-link", "/community");
  await page.getByRole("button", { name: "Add banner" }).click();
  await page.waitForURL(/added=1/);
  check(
    "a new banner gets Holo's answer, in the add form",
    (await addBox.getByRole("status").innerText()) === "Succesfully added!",
  );
  const [[id, image, link, enabled]] = sql(
    "SELECT id, image_url, link_url, enabled FROM banners WHERE title = 'Visit <the> Forum & more'",
  );
  check(
    "the banner is saved as typed",
    image === "/web-gallery/images/top-story/top_story_news.png" &&
      link === "/community" &&
      Number(enabled) === 1,
    `${image} ${link} ${enabled}`,
  );
  await page.goto(`${base}/community`);
  const shown = page.locator('a[target="_blank"]', { hasText: "Visit <the> Forum & more" });
  check(
    "the banner written in housekeeping appears on the community page",
    (await shown.getAttribute("href")) === "/community" &&
      (await page.locator('a[target="_blank"] img[src="/web-gallery/images/top-story/top_story_news.png"]').count()) === 1,
  );
  await page.goto(`${hk}/banners`);
  const listed = await listBox.innerText();
  check(
    "the list shows the banner as Holo did",
    [
      "Text\nVisit <the> Forum & more",
      "Banner url\n/web-gallery/images/top-story/top_story_news.png",
      "Linking url\n/community",
      "Status\nEnabled!",
      "Edit this banner!",
      "Delete this banner!",
    ].every((text) => listed.includes(text)),
    listed,
  );
  await shot(page, "banners-added");

  await page.getByRole("link", { name: "Edit this banner!" }).click();
  await page.waitForURL(`**/housekeeping/banners/${id}`);
  check(
    "the edit view has Holo's heading and the banner's fields, with no message yet",
    (await page.locator("main h2").innerText()) === "Edit banner!" &&
      (await page.inputValue("#banner-text")) === "Visit <the> Forum & more" &&
      (await page.getByLabel("Enabled").isChecked()) &&
      (await page.getByRole("status").count()) === 0 &&
      (await page.getByRole("alert").count()) === 0,
  );
  await page.fill("#banner-text", "Visit the forum");
  await page.fill("#banner-link", "https://forum.example.com/");
  await page.getByLabel("Disabled").check();
  await page.getByRole("button", { name: "Edit banner" }).click();
  await page.waitForURL(/saved=1/);
  check(
    "an edit gets Holo's answer on the edit view",
    (await page.getByRole("status").innerText()) === "Succesfully edited!" &&
      (await page.getByLabel("Disabled").isChecked()),
  );
  const [[title, newLink, nowEnabled]] = sql(
    `SELECT title, link_url, enabled FROM banners WHERE id = ${id}`,
  );
  check(
    "the edit is saved",
    title === "Visit the forum" &&
      newLink === "https://forum.example.com/" &&
      Number(nowEnabled) === 0,
    `${title} ${newLink} ${nowEnabled}`,
  );
  await shot(page, "banners-edit");

  await page.fill("#banner-image", "");
  const blank = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Edit banner" }).click();
  check("a blank url answers 422", (await blank).status() === 422);
  await page.waitForLoadState();
  check(
    "a blank url gets Holo's message on the edit view",
    (await page.getByRole("alert").innerText()) === forgotten,
  );

  await page.goto(`${hk}/banners`);
  check(
    "the list shows the banner disabled",
    (await listBox.innerText()).includes("Status\nDisabled"),
  );
  await page.getByRole("link", { name: "Delete this banner!" }).click();
  await page.waitForURL(`**/housekeeping/banners/${id}/delete`);
  const question = await page.locator("main section").innerText();
  check(
    "the delete view asks Holo's question about the banner's text",
    question.includes("Delete banner") &&
      question.includes(
        "Do you want to delete the banner with the following text:",
      ) &&
      question.includes("Visit the forum"),
    question,
  );
  await shot(page, "banners-delete");
  await page.getByRole("button", { name: "Delete banner" }).click();
  await page.waitForURL(/deleted=1/);
  const [[left]] = sql("SELECT COUNT(*) FROM banners");
  check(
    "a delete gets Holo's answer in the list, and the banner is gone",
    (await listBox.getByRole("status").innerText()) ===
      "Succesfully deleted!" &&
      Number(left) === 0 &&
      (await listBox.innerText()).includes("Nothing found."),
  );

  const missing = await page.goto(`${hk}/banners/${id}`);
  check(
    "a banner that is gone answers Holo's failure with 404",
    missing.status() === 404 &&
      (await listBox.getByRole("alert").innerText()) ===
        "Something was going wrong!",
  );

  await page.goto(`${hk}/logs`);
  const logged = (action) =>
    page
      .getByRole("row", { name: new RegExp(action.replace(".", "\\.")) })
      .allInnerTexts();
  const created = await logged("banners.create");
  const updated = await logged("banners.update");
  const deleted = await logged("banners.delete");
  const rows = [...created, ...updated, ...deleted];
  check(
    "the log holds each change, and who made it",
    created.length === 1 &&
      created[0].includes(`Visit <the> Forum & more (ID: ${id})`) &&
      updated.length === 1 &&
      updated[0].includes(`Visit the forum (ID: ${id}): text, url, status`) &&
      deleted.length === 1 &&
      deleted[0].includes(`Visit the forum (ID: ${id})`) &&
      rows.every((row) => row.includes("Admin-1 (ID:")),
    rows.join(" | "),
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();

  const moderator = await session(t, "Frank");
  const banners = await moderator.page.goto(`${hk}/banners`);
  const news = await moderator.page.goto(`${hk}/news`);
  check(
    "a moderator manages banners but not news",
    banners.status() === 200 && news.status() === 403,
    `${banners.status()} ${news.status()}`,
  );
  await moderator.context.close();

  const helper = await session(t, "Helper");
  const response = await helper.page.goto(`${hk}/banners`);
  check(
    "staff without the attribute get Access Denied",
    response.status() === 403 &&
      (await helper.page.locator("h1").innerText()) === "Access Denied",
  );
  await helper.context.close();
}
