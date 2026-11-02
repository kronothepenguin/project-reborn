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
  await page.goto(base + "/");
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

  await page.click('button:has-text("Sign in")');
  check("blank sign-in", await text("Please do not leave any fields blank."));
  await page.goto(base + "/?ageLimit=true");
  check("age message", await text("You are too young to register."));

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
      "select credits from wallets join avatars on avatars.id=wallets.avatar_id where name='Admin-1'",
    )[0][0] === 5050,
  );
  check(
    "referrer ledger",
    sql(
      "select count(*) from wallet_transactions where reason='referral' and credits=50 and detail='Newbie'",
    )[0][0] === 1,
  );
  check(
    "referral row",
    sql(
      "select count(*) from referrals where rewarded_at is not null",
    )[0][0] === 1,
  );
  check(
    "welcome credits",
    sql(
      "select credits, reason, detail from wallet_transactions join avatars on avatars.id=avatar_id where name='Newbie'",
    )[0].join("|") === "500|registration|Welcome to Reborn Hotel!",
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
  await page.goto(base + "/logout");
  check("GET /logout keeps the session", page.url().endsWith("/me"));

  // sign out through the forgot page's link
  await page.goto(base + "/forgot");
  await page.click('button:has-text("log out")');
  check(
    "sign-out confirmation",
    await text("You have successfully signed out"),
  );
  await shot(page, "logout");
  await page.click('a:has-text("OK")');
  check("OK goes home", page.url() === base + "/");
  await page.goto(base + "/logout");
  check("guest: not logged in", await text("You are not logged in"));

  // sign in by name, ignoring case
  await page.goto(base + "/");
  await page.fill("#username", "nEWBIE");
  await page.fill("#password", "first-pass1");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check("sign in ignoring case", page.url().endsWith("/me"));
  await page.locator('button:has-text("Sign Out")').click();

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
  check(
    "wrong pair: fields kept",
    (await page.inputValue("input[name=username]")) === "Newbie",
  );
  await wait(500);
  check("wrong pair: no mail", mails().length === 0, JSON.stringify(mails()));
  await page.fill("input[name=email]", "NEWBIE@example.com");
  await page.click('button:has-text("Request information")');
  await shot(page, "forgot");
  for (let i = 0; i < 50 && mails().length < 1; i++) await wait(100);
  const mail = mails()[0];
  check(
    "one mail to the stored address",
    mail?.to === "newbie@example.com",
    JSON.stringify(mail),
  );
  check(
    "mail subject",
    mail.data.includes("Subject: Reborn - Forgot password"),
  );
  check(
    "mail greets the habbo",
    mail.data.includes("Hello Newbie,") &&
      mail.data.includes("Username: Newbie"),
  );
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
  await page.goto(base + "/");
  await page.fill("#username", "Newbie");
  await page.fill("#password", "first-pass1");
  await page.click('button:has-text("Sign in")');
  check("old password refused", await text("Invalid username or password."));
  await page.fill("#password", "second-pass2");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  check("new password signs in", page.url().endsWith("/me"));

  // mail limit
  await page.locator('button:has-text("Sign Out")').click();
  const before = mails().length;
  for (let i = 0; i < 5; i++) {
    await page.goto(base + "/forgot");
    await page.fill("input[name=username]", "Admin-1");
    await page.fill("input[name=email]", "admin@example.com");
    await page.click('button:has-text("Request information")');
    check(
      `limit: answer ${i + 1}`,
      await text("If this username and e-mail address match"),
    );
  }
  await wait(800);
  check(
    "limit: 3 mails for 5 requests",
    mails().length - before === 3,
    String(mails().length - before),
  );

  // a ban while signed in
  await page.goto(base + "/");
  await page.fill("#username", "Newbie");
  await page.fill("#password", "second-pass2");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  sql(
    "insert into bans (user_id, reason, created_at) select id, 'Scamming', '2026-01-01 00:00:00' from users where email='newbie@example.com'",
  );
  await page.goto(base + "/disclaimer");
  check(
    "ban page",
    await text('You have been banned! The reason for this ban is "Scamming".'),
  );
  await shot(page, "ban");
  await page.click('a:has-text("OK")');
  check("ban: session ended", page.url() === base + "/");
  sql("delete from bans");

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

  // cross-site posts
  for (const path of [
    "/",
    "/logout",
    "/register",
    "/register/check-name",
    "/forgot",
    "/reset/token",
  ]) {
    const r = await fetch(base + path, {
      method: "POST",
      headers: {
        "Sec-Fetch-Site": "cross-site",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "a=b",
      redirect: "manual",
    });
    check(`cross-site POST ${path}`, r.status === 403, String(r.status));
  }

  // throttle
  const t = await (await browser.newContext()).newPage();
  await t.goto(base + "/");
  for (let i = 0; i < 6; i++) {
    await t.fill("#username", "Admin-1");
    await t.fill("#password", "wrong-pass");
    await t.click('button:has-text("Sign in")');
  }
  check(
    "throttle message",
    await t
      .getByText("Too many failed attempts. Please try again later.")
      .isVisible(),
  );
  await t.fill("#password", "secret123");
  await t.click('button:has-text("Sign in")');
  check(
    "throttle refuses the right password",
    await t.getByText("Too many failed attempts").isVisible(),
  );

  check("no script errors", errors.length === 0, errors.join(" | "));
}
