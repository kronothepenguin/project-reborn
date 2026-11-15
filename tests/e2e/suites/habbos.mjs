export default async function ({ base, browser, check, hk, shot, sql }) {
  const page = await (
    await browser.newContext({ viewport: { width: 1100, height: 760 } })
  ).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const text = (t) => page.getByText(t, { exact: false }).first().isVisible();
  await page.goto(base + "/");
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check(
    "staff see the Housekeeping tab",
    (await page
      .getByRole("link", { name: "Housekeeping" })
      .first()
      .getAttribute("href")) === hk,
  );
  await page.goto(base + "/disclaimer");
  check(
    "staff see Housekeeping in the signed-out footer",
    await page
      .locator("footer")
      .getByRole("link", { name: "Housekeeping" })
      .isVisible(),
  );
  await page.goto(base + "/me");
  check(
    "one habbo: no switch link",
    !(await page.getByRole("link", { name: "Switch habbo" }).isVisible()),
  );
  await page.goto(base + "/account/habbos");
  check("title", (await page.title()) === "Reborn ~ Account Settings");
  check("lists the habbo as active", await text("Active"));
  await page.waitForFunction(
    () => document.getElementById("habbo-figure").value !== "",
  );
  await page.fill('form[action="/account/habbos"] input[name=name]', "Second");
  const look = await page.inputValue("#habbo-figure");
  await page.click('button:has-text("Add habbo")');
  await page.getByText("Second is ready to use.").waitFor();
  await page.waitForTimeout(600);
  await shot(page, "habbos");
  check(
    "with the editor look",
    sql("select figure from avatars where name='Second'")[0][0] === look,
    sql("select figure from avatars where name='Second'")[0][0] + " vs " + look,
  );
  check(
    "switch link in the header",
    await page.getByRole("link", { name: "Switch habbo" }).isVisible(),
  );
  await page.click('li:has-text("Second") button:has-text("Switch")');
  await page.waitForURL("**/account/habbos");
  check(
    "the tab names the new habbo",
    (await page.locator("header strong").first().innerText()) === "Second",
    await page.locator("header strong").first().innerText(),
  );
  await page.goto(base + "/me");
  check(
    "/me shows it",
    (await page.title()) === "Reborn ~ Second",
    await page.title(),
  );

  await page.goto(base + "/account/habbos");
  await page
    .locator('li:has-text("Admin-1") input[name=password]')
    .fill("secret123");
  await page
    .locator('li:has-text("Admin-1")')
    .getByRole("button", { name: "Archive" })
    .click();
  await page.getByText("The habbo is archived.").waitFor();
  check(
    "no switch link with one habbo left",
    !(await page.getByRole("link", { name: "Switch habbo" }).isVisible()),
  );
  await page.click('button:has-text("Sign Out")');
  await page.goto(base + "/");
  await page.fill("#username", "Second");
  await page.fill("#password", "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check("its sibling can", (await page.title()) === "Reborn ~ Second");
  check("no script errors", errors.length === 0, errors.join(" | "));
}
