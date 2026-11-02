export default async function ({ base, browser, check, shot, sql }) {
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 760 },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/");
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  const now = new Date();
  const aid = sql("select id from avatars where name='Admin-1'")[0][0];
  const uid = sql("select user_id from avatars where name='Admin-1'")[0][0];
  sql(
    `insert into alerts (avatar_id, sender_user_id, message, created_at) values (${aid}, ${uid}, 'Welcome to the hotel!\nSecond line', '2026-01-01 00:00:00+00:00')`,
  );
  sql(
    `insert into alerts (avatar_id, message, created_at) values (${aid}, 'Older-looking notification', '2026-01-02 00:00:00+00:00')`,
  );
  sql(
    `insert into help_tickets (subject, message, ip, created_at) values ('s','m','1.1.1.1','2026-01-01 00:00:00+00:00')`,
  );
  sql(
    `update users set born_on='${now.getUTCFullYear() - 36}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}' where id=${uid}`,
  );
  await page.goto(base + "/me");
  await page.waitForTimeout(300);
  await shot(page, "me");
  check(
    "title",
    (await page.title()) === "Reborn ~ Admin-1",
    await page.title(),
  );
  check("hotel closed", await page.getByText("Hotel Closed").isVisible());
  check("credits", await page.getByText("5000").first().isVisible());
  check("club offer", await page.getByText("Join Reborn club »").isVisible());
  check(
    "staff message",
    (await page.locator("#feed-items li").first().innerText())
      .replace(/\s+/g, " ")
      .includes("There is 1 non-picked up help query."),
    await page.locator("#feed-items li").first().innerText(),
  );
  check(
    "oldest alert",
    await page.getByText("Message from Reborn Staff").isVisible(),
  );
  check(
    "alert keeps its lines",
    (await page.locator("#feed-items span.whitespace-pre-line").innerText()) ===
      "Welcome to the hotel!\nSecond line",
    await page.locator("#feed-items span.whitespace-pre-line").innerText(),
  );
  check(
    "only one alert",
    (await page.locator("#feed-items form").count()) === 1,
  );
  check(
    "birthday",
    await page.getByText("Happy 36th birthday, Admin-1!").isVisible(),
  );
  check(
    "last sign-in",
    /Last signed in: \d\d-\d\d-\d{4} \d\d:\d\d:\d\d/.test(
      await page.locator("#feed-items").innerText(),
    ),
  );
  check(
    "avatar links to looks",
    (await page.locator('a[href="/account/looks"] img').count()) === 1,
  );

  // motto
  const prompt = page.getByRole("button", {
    name: "Click here to enter your motto",
  });
  check("motto prompt", await prompt.isVisible());
  await prompt.click();
  const field = page.locator("input[name=motto]");
  check("click opens the field", await field.isVisible());
  check(
    "Cancel shows",
    await page.getByRole("button", { name: "Cancel" }).isVisible(),
  );
  check(
    "the field has focus",
    await field.evaluate((e) => e === document.activeElement),
  );
  await field.fill("Hello <b>world</b>");
  await field.press("Escape");
  check("Esc leaves without saving", await prompt.isVisible());
  await prompt.click();
  await page.locator("input[name=motto]").fill("Hello <b>world</b>");
  await page.locator("input[name=motto]").press("Enter");
  await page.getByRole("button", { name: "Hello <b>world</b>" }).waitFor();
  check("Enter saves and shows it as text", true);
  check(
    "stored raw",
    sql(`select motto from avatars where id=${aid}`)[0][0] ===
      "Hello <b>world</b>",
  );
  await page.reload();
  await page.getByRole("button", { name: "Hello <b>world</b>" }).waitFor();
  check("survives a reload", true);
  await page.getByRole("button", { name: "Hello <b>world</b>" }).click();
  check(
    "the field starts with the motto",
    (await page.locator("input[name=motto]").inputValue()) ===
      "Hello <b>world</b>",
  );
  await page.locator("input[name=motto]").fill("x".repeat(39));
  await page.locator("input[name=motto]").press("Enter");
  await page.getByRole("button", { name: "Hello <b>world</b>" }).waitFor();
  check("a motto over 38 keeps the old one", true);
  await page.getByRole("button", { name: "Hello <b>world</b>" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  check(
    "Cancel leaves",
    await page.getByRole("button", { name: "Hello <b>world</b>" }).isVisible(),
  );

  // feed
  const url = page.url();
  await page.getByRole("button", { name: "Remove notification" }).click();
  await page.waitForTimeout(250);
  check(
    "alert goes without a reload",
    !(await page.getByText("Message from Reborn Staff").isVisible()) &&
      page.url() === url,
  );
  check(
    "dismissed in the database",
    sql(`select count(*) from alerts where dismissed_at is not null`)[0][0] ===
      1,
  );
  await page.reload();
  check(
    "the next alert shows",
    await page.getByText("Older-looking notification").isVisible(),
  );
  check(
    "as a notification",
    await page.locator('#feed-items b:has-text("Notification")').isVisible(),
  );

  // without JavaScript
  const plain = await (
    await browser.newContext({
      javaScriptEnabled: false,
      storageState: await ctx.storageState(),
    })
  ).newPage();
  await plain.goto(base + "/me");
  check(
    "no JS: motto shows",
    await plain.getByText("Hello <b>world</b>").isVisible(),
  );
  await plain.getByRole("button", { name: "Remove notification" }).click();
  await plain.waitForURL("**/me");
  check(
    "no JS: dismiss works",
    !(await plain.getByText("Older-looking notification").isVisible()),
  );
  check("no script errors", errors.length === 0, errors.join(" | "));
}
