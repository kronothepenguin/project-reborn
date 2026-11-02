export function prepare({ sql }) {
  sql(
    "INSERT INTO settings (key, value, updated_at) VALUES ('site.maintenance', 'true', '2026-11-01 00:00:00')",
  );
}

export default async function ({ base, browser, check }) {
  const page = await (await browser.newContext()).newPage();
  for (const path of ["/", "/register", "/privacy", "/forgot", "/logout"]) {
    const r = await page.goto(base + path);
    check(`guest ${path} gets 503`, r.status() === 503, String(r.status()));
  }
  check(
    "maintenance title",
    (await page.title()) === "Reborn",
    await page.title(),
  );
  check(
    "Frank speaks",
    await page
      .getByText(
        "I think you hit the wrong switch, Greggers! All of Reborn just vanished!",
      )
      .isVisible(),
  );
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "wrong-pass");
  await page.click('button:has-text("Sign in")');
  check(
    "failed staff sign-in stays",
    await page.getByText("Invalid username or password.").isVisible(),
  );
  await page.fill("#password", "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check(
    "administrator passes",
    (await page.goto(base + "/me")).status() === 200,
  );
  check(
    "alert above and below the page",
    (await page.getByText("The site is currently turned off!").count()) === 2,
  );
  await page.locator('button:has-text("Sign Out")').click();
  check(
    "administrator signs out",
    await page.getByText("You have successfully signed out").isVisible(),
  );
}
