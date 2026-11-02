export default async function ({ base, browser, check, shot, sql }) {
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
  await page.fill("input[name=motto]", "A motto from the form");
  await save();
  check("profile saved", await text("Changes saved successfully."));
  await page.evaluate(() =>
    document.querySelector("input[name=motto]").removeAttribute("maxlength"),
  );
  await page.fill("input[name=motto]", "x".repeat(33));
  await save();
  check(
    "profile too long",
    await text("Sorry, but the motto you have chosen is too long!"),
  );
  check(
    "profile keeps what was typed",
    (await page.inputValue("input[name=motto]")) === "x".repeat(33),
  );
  await page.goto(base + "/me");
  await page.getByRole("button", { name: "A motto from the form" }).waitFor();
  check("the motto reaches /me", true);

  // email
  await page.goto(base + "/account/email");
  check(
    "email shows the address",
    (await page.inputValue("input[name=email]")) === "admin@example.com",
  );
  await details("wrong-pass");
  await page.fill("input[name=email]", "new@example.com");
  await save();
  check(
    "email wrong password",
    await text("The given information doesn't match what we have on record"),
  );
  check(
    "email keeps what was typed",
    (await page.inputValue("input[name=email]")) === "new@example.com",
  );
  await shot(page, "email");
  await details("secret123", "1991");
  await save();
  check(
    "email wrong birth date",
    await text("doesn't match what we have on record"),
  );
  await details();
  await page.fill("input[name=email]", "a+b@example.com");
  await save();
  check("email invalid", await text("Invalid e-mail address"));
  await details();
  await page.fill("input[name=email]", "new@example.com");
  await page.check("input[name=newsletter]");
  await save();
  check(
    "email changed",
    await text("Your e-mail address has been changed to new@example.com"),
  );
  check(
    "email stored",
    sql("select email, newsletter from users")[0].join("|") ===
      "new@example.com|1",
  );

  // referral
  await page.goto(base + "/account/referral");
  check(
    "referral link",
    (await page.locator("input[disabled]").inputValue()) ===
      `${base}/register?refer=Admin-1`,
    await page.locator("input[disabled]").inputValue(),
  );
  check("referral reward", await text("per refer"));

  // password
  await page.goto(base + "/account/password");
  await details("wrong-pass");
  await page.fill("input[name=pass]", "brand-new-1");
  await page.fill("input[name=confpass]", "brand-new-1");
  await save();
  check(
    "password wrong details",
    await text("doesn't match what we have on record"),
  );
  await details();
  await page.fill("input[name=pass]", "brand-new-1");
  await page.fill("input[name=confpass]", "other-pass-2");
  await save();
  check("password mismatch", await text("The passwords don't match"));
  await details();
  await page.fill("input[name=pass]", "short");
  await page.fill("input[name=confpass]", "short");
  await save();
  check(
    "password short",
    await text("Password is too short, 6 characters minimum"),
  );
  await details();
  await page.fill("input[name=pass]", "brand-new-1");
  await page.fill("input[name=confpass]", "brand-new-1");
  await save();
  check(
    "password changed",
    await text(
      "Your password has been changed successfully. You will need to login again.",
    ),
  );
  await page.goto(base + "/me");
  check("the session ended", page.url() === base + "/", page.url());
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await page.click('button:has-text("Sign in")');
  check("old password refused", await text("Invalid username or password."));
  await page.fill("#password", "brand-new-1");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check("new password signs in", page.url().endsWith("/me"));
  check("no script errors", errors.length === 0, errors.join(" | "));
}
