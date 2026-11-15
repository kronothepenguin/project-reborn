export default async function ({ base, browser, check, shot }) {
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 760 },
  });
  const page = await ctx.newPage();
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
  const save = () => page.click('button:has-text("Save changes")');
  const details = async (password = "secret123", year = "1990") => {
    await page.fill("input[name=password]", password);
    await page.selectOption("#details-day", "1");
    await page.selectOption("#details-month", "5");
    await page.selectOption("#details-year", year);
  };

  // profile
  await page.goto(base + "/account/profile");
  check("profile title", (await page.title()) === "Reborn ~ Account Settings");
  check(
    "profile field limit",
    (await page.locator("input[name=motto]").getAttribute("maxlength")) ===
      "32",
  );

  // email
  await page.goto(base + "/account/email");
  await details("wrong-pass");
  await page.fill("input[name=email]", "new@example.com");
  await save();
  check(
    "email keeps what was typed",
    (await page.inputValue("input[name=email]")) === "new@example.com",
  );
  await shot(page, "email");

  // referral
  await page.goto(base + "/account/referral");
  check("referral reward", await text("per refer"));

  // password
  await page.goto(base + "/account/password");
  await details();
  await page.fill("input[name=pass]", "brand-new-1");
  await page.fill("input[name=confpass]", "brand-new-1");
  await save();
  await page.getByText("Your password has been changed successfully.").waitFor();
  check("no need to log in again", !(await text("login again")));
  check("no script errors", errors.length === 0, errors.join(" | "));
}
