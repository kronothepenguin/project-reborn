export default async function ({ base, browser, check, shot, sql }) {
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
      .getAttribute("href")) === "/housekeeping",
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
  const figure = await page.inputValue("#habbo-figure");
  await page.fill('form[action="/account/habbos"] input[name=name]', "Admin-1");
  await page.click('button:has-text("Add habbo")');
  check(
    "taken name",
    await text("This username is in use. Please choose another name."),
  );
  await page.waitForFunction(
    () => document.getElementById("habbo-figure").value !== "",
  );
  await page.fill('form[action="/account/habbos"] input[name=name]', "Second");
  const look = await page.inputValue("#habbo-figure");
  await page.click('button:has-text("Add habbo")');
  await page.getByText("Second is ready to use.").waitFor();
  check("added", true);
  await page.waitForTimeout(600);
  await shot(page, "habbos");
  check(
    "with the editor look",
    sql("select figure from avatars where name='Second'")[0][0] === look,
    sql("select figure from avatars where name='Second'")[0][0] + " vs " + look,
  );
  check(
    "it adds no wallet",
    sql("select count(*) from wallets")[0][0] === 1,
    String(sql("select count(*) from wallets")),
  );
  check(
    "switch link in the header",
    await page.getByRole("link", { name: "Switch habbo" }).isVisible(),
  );
  await page.click('li:has-text("Second") button:has-text("Switch")');
  await page.waitForURL("**/account/habbos");
  check("switch stays on the page", true);
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
  check("it shares the credits", await page.getByText("5000").first().isVisible());
  check("no script errors", errors.length === 0, errors.join(" | "));
}
