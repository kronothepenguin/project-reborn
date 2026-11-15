export default async function ({
  base,
  browser,
  check,
  mails,
  shot,
  sql,
  wait,
}) {
  const errors = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const text = (t) => page.getByText(t, { exact: false }).first().isVisible();

  // the landing page
  const [[adminProfile]] = sql(
    "select profiles.id from profiles join avatars on avatars.id = profiles.avatar_id where avatars.name = 'Admin-1'",
  );
  sql(
    `insert into profile_tags (profile_id, tag, created_at) values (${adminProfile}, 'retro', '2026-11-01 12:00:00+00:00')`,
  );
  await page.goto(base + "/");
  const cloud = page.locator("#tag-cloud-slim");
  check(
    "the landing page shows the tag cloud after Holo's line",
    (await cloud.innerText()).startsWith("Reborn's like retro") &&
      (await cloud.getByRole("link", { name: "retro" }).getAttribute("href")) === "/tags?tag=retro",
    await cloud.innerText(),
  );
  check(
    "landing title",
    (await page.title()) === "Reborn ~ Home",
    await page.title(),
  );
  const meta = await page
    .locator("meta[name=description]")
    .getAttribute("content");
  check(
    "description",
    meta ===
      "Reborn Hotel is a virtual world where you can meet and make friends.",
    meta,
  );
  check(
    "keywords",
    (await page.locator("meta[name=keywords]").getAttribute("content")) ===
      "Reborn,Reborn Hotel,virtual world,play games,enter competitions,make friends",
  );
  check("registered users", await text("registered users"));
  check(
    "logo links home",
    (await page
      .locator("header a img")
      .first()
      .evaluate((i) => i.parentElement.getAttribute("href"))) === "/",
  );
  check(
    "login texts",
    (await text("I forgot my username/password")) &&
      (await page.locator('a:has-text("Register")').first().isVisible()),
  );
  const bubble = page.getByText(
    "By selecting 'remember me' you will stay signed in",
  );
  check("remember bubble starts hidden", !(await bubble.isVisible()));
  await page.check("input[name=remember]");
  check("ticking shows the bubble", await bubble.isVisible());
  await shot(page, "landing");
  await page.uncheck("input[name=remember]");
  check("unticking hides it", !(await bubble.isVisible()));
  check(
    "party advert",
    await page.locator('a[href="/register"] img[src*="party"]').isVisible(),
  );
  await page.waitForFunction(() =>
    document.querySelector("#habbos-v2-container canvas"),
  );
  check("promo widget runs", true);

  // a referral registration
  await page.goto(base + "/register?refer=Admin-1");
  await page.fill("#register-name", "Newbie");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => !document.getElementById("register-password").disabled,
  );
  await page.fill("#register-password", "first-pass1");
  await page.fill("#register-password2", "first-pass1");
  await page.fill("#register-email", "newbie@example.com");
  await page.fill("#register-email2", "newbie@example.com");
  await page.selectOption("#register-day", "1");
  await page.selectOption("#register-month", "5");
  await page.selectOption("#register-year", "1990");
  await page.click("label:has(#register-terms-check)");
  await page.waitForFunction(
    () => document.getElementById("register-figure").value !== "",
  );
  const figure = await page.inputValue("#register-figure");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click("#register-button-continue"),
  ]);
  check("registering signs in", page.url().endsWith("/me"));
  check(
    "a player sees no Housekeeping tab",
    (await page.getByRole("link", { name: "Housekeeping" }).count()) === 0,
  );
  check(
    "/me title",
    (await page.title()) === "Reborn ~ Newbie",
    await page.title(),
  );
  check(
    "the look is saved",
    sql(
      `select count(*) from avatars where name='Newbie' and figure='${figure}'`,
    )[0][0] === 1,
  );
  check(
    "newsletter stored as checked",
    sql(
      "select newsletter from users where email='newbie@example.com'",
    )[0][0] === 1,
  );
  check(
    "referrer paid",
    sql(
      "select credits from wallets join avatars on avatars.user_id=wallets.user_id where name='Admin-1'",
    )[0][0] === 5050,
  );
  check(
    "argon2id hash",
    sql(
      "select password_hash from credentials join users on users.id=user_id where email='newbie@example.com'",
    )[0][0].startsWith("$argon2id$"),
  );

  // signed-in pages
  await page.goto(base + "/forgot");
  check(
    "forgot asks to log out",
    (await page.locator('form[action="/logout"]').innerText()).trim() ===
      "Please log out to use this feature.",
    await page.locator('form[action="/logout"]').innerText(),
  );
  await shot(page, "forgot-signed-in");
  check(
    "forgot has Back",
    await page.locator('a:has-text("Back")').isVisible(),
  );

  // sign out through the forgot page's link
  await page.goto(base + "/forgot");
  await page.click('button:has-text("log out")');
  await shot(page, "logout");
  await page.click('a:has-text("OK")');
  check("OK goes home", page.url() === base + "/");

  // forgot
  await page.goto(base + "/forgot");
  check("forgot title", (await page.title()) === "Reborn ~ Home");
  check(
    "forgot intro",
    await text("Please enter your account information below"),
  );
  await page.fill("input[name=username]", "Newbie");
  await page.fill("input[name=email]", "wrong@example.com");
  await page.click('button:has-text("Request information")');
  check(
    "wrong pair: neutral answer",
    await text("If this username and e-mail address match"),
  );
  await page.fill("input[name=email]", "NEWBIE@example.com");
  await page.click('button:has-text("Request information")');
  await shot(page, "forgot");
  for (let i = 0; i < 50 && mails().length < 1; i++) await wait(100);
  const mail = mails()[0];
  const link = mail.data.match(new RegExp(`${base}/reset/[A-Za-z0-9_-]+`))[0];
  await page.goto(link);
  await page.fill("input[name=password]", "second-pass2");
  await page.fill("input[name=passwordConfirm]", "second-pass2");
  await page.click('button:has-text("Save")');
  check("reset done", await text("Your password has been changed."));
  await page.goto(link);
  await page.fill("input[name=password]", "third-pass33");
  await page.fill("input[name=passwordConfirm]", "third-pass33");
  await page.click('button:has-text("Save")');
  check(
    "a link works once",
    await text("This link is invalid or has expired."),
  );

  // legal pages, footer
  for (const path of ["/disclaimer", "/privacy"]) {
    await page.goto(base + path);
    check(
      `${path} title`,
      (await page.title()) === "Reborn ~ Home",
      await page.title(),
    );
  }
  check(
    "footer pipes",
    /Homepage\s*\|\s*Terms of Service\s*\|\s*Privacy Policy/.test(
      await page.locator("footer").innerText(),
    ),
    await page.locator("footer").innerText(),
  );

  // no JavaScript on the landing page
  const plain = await (
    await browser.newContext({ javaScriptEnabled: false })
  ).newPage();
  await plain.goto(base + "/");
  // getByText skips noscript, so these look at the boxes the browser laid out.
  const joinBox = await plain
    .locator('noscript a[href="/register"] span')
    .boundingBox();
  check(
    "no JS: join link on one line",
    joinBox && joinBox.height < 30,
    JSON.stringify(joinBox),
  );
  check(
    "no JS: box",
    (await plain.locator("noscript header").boundingBox())?.height > 0,
  );
  check(
    "no JS: Enable JavaScript",
    (await plain.locator("noscript li").boundingBox())?.height > 0,
  );
  await plain.check("input[name=remember]");
  check(
    "no JS: remember bubble",
    await plain.getByText("By selecting 'remember me'").isVisible(),
  );
  await shot(plain, "landing-nojs");

  check("no script errors", errors.length === 0, errors.join(" | "));
}
