import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

export default async function (t) {
  const { base, check, hk, shot, sql } = t;
  const [[seeded]] = sql("SELECT COUNT(*) FROM home_store_items");
  check("the hotel is installed with Holo's store", Number(seeded) === 298, String(seeded));

  const { context, page, problems } = await session(t, "Admin-1");

  await page.goto(`${hk}/`);
  await page
    .getByRole("link", { name: "Add stickers or backgrounds to homes catalogue" })
    .click();
  await page.waitForURL("**/housekeeping/home-store");
  await shot(page, "home-store");
  check(
    "the store is under Site & Content",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content",
  );
  const form = await page.locator("main section").first().innerText();
  check(
    "the form has Holo's title, labels and help",
    [
      "Create Sticker or Background",
      "URL",
      "The URL of the image",
      "Category",
      "The category the item will be on",
      "Name",
      "The name that will be displayed with the image in the homes and groups catalogue",
      "Price",
      "The amount of credits the item will cost",
    ].every((text) => form.includes(text)),
    form,
  );
  check(
    "the button is Holo's",
    await page.getByRole("button", { name: "Create Sticker" }).isVisible(),
  );

  const list = page.locator("main table").nth(1);
  check(
    "the list shows 100 items a page",
    (await list.locator("tbody tr").count()) === 100,
  );
  const preview = await list.locator("img").first().getAttribute("src");
  check(
    "a preview comes from the CMS",
    preview === `${base}/c_images/stickers/trax_sfx.gif`,
    preview,
  );
  const image = await fetch(preview);
  check(
    "the preview is served",
    image.status === 200 &&
      image.headers.get("content-type").startsWith("image/"),
    `${image.status} ${image.headers.get("content-type")}`,
  );

  await page.fill("#store-asset", "c_images/stickers/bling_star.gif");
  await page.selectOption("#store-category", { label: "Trax" });
  await page.fill("#store-name", "Shining <Star> & Co");
  await page.fill("#store-price", "7");
  await page.getByRole("button", { name: "Create Sticker" }).click();
  await page.waitForURL(/created=1/);
  check(
    "a new item gets Holo's answer",
    (await page.getByRole("status").innerText()) ===
      "Success, your sticker/background has been added",
  );
  const [[id, kind, category, price, quantity, enabled]] = sql(
    "SELECT id, kind, home_store_category_id, price, quantity, enabled FROM home_store_items WHERE name = 'Shining <Star> & Co'",
  );
  check(
    "the item is a sticker in Trax, sold one at a time",
    kind === "sticker" &&
      Number(category) === 3 &&
      Number(price) === 7 &&
      Number(quantity) === 1 &&
      Number(enabled) === 1,
    `${kind} ${category} ${price} ${quantity} ${enabled}`,
  );

  const field = (name) => page.locator(`[form="item-${id}"][name="${name}"]`);
  const save = () =>
    page.locator(`#item-${id}`).getByRole("button", { name: "Save" }).click();
  check(
    "the new item is listed as it was typed",
    (await field("name").inputValue()) === "Shining <Star> & Co" &&
      (await field("price").inputValue()) === "7" &&
      (await field("category").inputValue()) === "3",
  );

  await field("name").fill("Shining Star");
  await field("price").fill("9");
  await field("quantity").fill("2");
  await save();
  await page.waitForURL(/page=1&saved=1/);
  check(
    "an edit says so",
    (await page.getByRole("status").innerText()) ===
      "Item updated successfully.",
  );
  const [[name, newPrice, newQuantity]] = sql(
    `SELECT name, price, quantity FROM home_store_items WHERE id = ${id}`,
  );
  check(
    "the edit is saved and shown",
    name === "Shining Star" &&
      Number(newPrice) === 9 &&
      Number(newQuantity) === 2 &&
      (await field("name").inputValue()) === "Shining Star" &&
      (await field("quantity").inputValue()) === "2",
    `${name} ${newPrice} ${newQuantity}`,
  );

  await field("price").fill("free");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await save();
  check("a bad price answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "a bad price is explained",
    (await page.getByRole("alert").innerText()) ===
      "The price must be a number from 0 to 2147483647.",
  );
  check(
    "the refused row keeps what was typed",
    (await field("price").inputValue()) === "free",
  );

  await page.goto(`${hk}/home-store`);
  await field("enabled").uncheck();
  await save();
  await page.waitForURL(/saved=1/);
  const [[sold]] = sql(`SELECT enabled FROM home_store_items WHERE id = ${id}`);
  check(
    "an item stops being sold and stays listed",
    Number(sold) === 0 && !(await field("enabled").isChecked()),
    String(sold),
  );
  await shot(page, "home-store-edited");

  const firstItem = await list.locator("img").first().getAttribute("src");
  await page.getByRole("link", { name: "Older" }).click();
  await page.waitForURL(/page=2/);
  check(
    "the next page lists the next items",
    (await list.locator("tbody tr").count()) === 100 &&
      (await list.locator("img").first().getAttribute("src")) !== firstItem,
  );

  await page.goto(`${hk}/logs`);
  const created = await page
    .getByRole("row", { name: /homeStore\.create/ })
    .innerText();
  check(
    "the log holds the new item as Holo wrote it, and who added it",
    created.includes("Shining <Star> & Co worth 7 credits") &&
      created.includes("Admin-1 (ID:"),
    created,
  );
  const updates = await page
    .getByRole("row", { name: /homeStore\.update/ })
    .allInnerTexts();
  check(
    "the log holds each edit with the fields that changed, and who made it",
    updates.length === 2 &&
      updates.some((row) =>
        row.includes(`Shining Star (ID: ${id}): name, price, quantity`),
      ) &&
      updates.some((row) => row.includes(`Shining Star (ID: ${id}): enabled`)) &&
      updates.every((row) => row.includes("Admin-1 (ID:")),
    updates.join(" | "),
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await context.close();

  const helper = await session(t, "Helper");
  const response = await helper.page.goto(`${hk}/home-store`);
  check(
    "staff without the attribute get Access Denied",
    response.status() === 403 &&
      (await helper.page.locator("h1").innerText()) === "Access Denied",
  );
  await helper.context.close();
}
