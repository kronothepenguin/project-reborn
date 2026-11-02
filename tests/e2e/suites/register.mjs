import { readFileSync } from "node:fs";

export default async function ({ base, browser, check, dir, shot }) {
  const errors = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  const tip = async (p = page) => {
    const l = p.locator("[role=tooltip]");
    return (await l.count()) ? (await l.textContent()).trim() : null;
  };
  const state = (id, p = page) =>
    p.locator("#" + id).getAttribute("data-state");
  const open = () =>
    page.waitForFunction(
      () => !document.getElementById("register-password").disabled,
    );
  const closed = () => page.locator("#register-password").isDisabled();

  await page.goto(base + "/register");
  await page.waitForFunction(
    () => document.getElementById("register-password").disabled,
  );
  await page.waitForTimeout(1500);
  await shot(page, "register");
  check(
    "title",
    (await page.title()) === "Reborn ~ Register",
    await page.title(),
  );
  check(
    "step order",
    /1\.\s*Create Your Avatar[\s\S]*2\.\s*CHOOSE YOUR NAME[\s\S]*3\.\s*Your Details/.test(
      await page.locator("#registerform").innerText(),
    ),
  );
  check("details start closed", await closed());
  check(
    "overlay shows",
    await page.locator("#registration-overlay").isVisible(),
  );
  check(
    "name has focus",
    await page.evaluate(() => document.activeElement.id === "register-name"),
  );
  check(
    "name tip on focus",
    (await tip()) ===
      "Your name can contain lowercase and uppercase letters, numbers and the characters -=?!@:.",
    await tip(),
  );
  check(
    "check button shows",
    await page.locator("#register-name-check").isVisible(),
  );
  check(
    "newsletter starts checked",
    (await page.locator("input[name=newsletter]").isDisabled()) &&
      (await page.locator("input[name=newsletter]").isChecked()),
  );
  await page.locator("#registration-overlay").hover();
  check(
    "overlay tip",
    (await tip()) === "Please choose your Habbo (character) name first.",
    await tip(),
  );
  await page.mouse.move(0, 0);

  await page.click("#register-button-continue");
  check(
    "Done with no name: enter name tip",
    (await tip()) === "Please enter a name for your Habbo (character).",
    await tip(),
  );
  check(
    "Done with no name: red box",
    await page.locator("#form-validation-error-box").isVisible(),
  );
  check("Done with no name: stays", page.url().endsWith("/register"));

  await page.fill("#register-name", "Admin-1");
  check(
    "typing resets to the rule tip",
    (await tip())?.startsWith("Your name can contain"),
    await tip(),
  );
  await page.click("#register-name-check");
  await page.waitForFunction(
    () => document.getElementById("register-name").dataset.state === "error",
  );
  check(
    "taken name tip",
    (await tip()) ===
      "Sorry, but this username is taken. Please choose another one.",
    await tip(),
  );
  check("taken name keeps details closed", await closed());
  await page.click('#register-avatar-title, h2:has-text("Create Your Avatar")');
  check(
    "error tip goes on a click elsewhere",
    (await tip()) === null,
    await tip(),
  );

  await page.fill("#register-name", "two words");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => document.getElementById("register-name").dataset.state === "error",
  );
  check(
    "invalid name tip",
    (await tip()) === "Sorry, but this username contains invalid characters.",
    await tip(),
  );
  check("Enter does not submit", page.url().endsWith("/register"));

  await page.fill("#register-name", "MOD-Bob");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => document.getElementById("register-name").dataset.state === "error",
  );
  check(
    "reserved name tip",
    (await tip()) === "This name is not allowed.",
    await tip(),
  );

  await page.fill("#register-name", "Newbie");
  await page.keyboard.press("Tab");
  await open();
  check(
    "free name opens details and moves on",
    await page.evaluate(
      () => document.activeElement.id === "register-password",
    ),
  );
  check("name state ok", (await state("register-name")) === "ok");
  check(
    "overlay gone",
    !(await page.locator("#registration-overlay").isVisible()),
  );

  check(
    "password hint",
    (await tip()) ===
      "Your password must have at least 6 characters and it must contain both letters and numbers.",
    await tip(),
  );
  await page.locator("#register-password").pressSequentially("abc");
  check(
    "short password tip",
    (await tip()) === "The password you have chosen is too short.",
    await tip(),
  );
  check("short password red", (await state("register-password")) === "error");
  await page.focus("#register-password2");
  await page.locator("#register-password2").pressSequentially("x");
  check(
    "retyping an unusable password",
    (await tip()) ===
      "The password you have chosen is invalid, please choose a new password.",
    await tip(),
  );
  await page.fill("#register-password2", "");
  await page.fill("#register-password", "secret123");
  check(
    "good password asks to retype",
    (await tip()) === "Please re-enter your password.",
    await tip(),
  );
  check("good password green", (await state("register-password")) === "ok");
  await page.locator("#register-password2").pressSequentially("secret1");
  check(
    "different password",
    (await tip()) === "Password not the same, please re-type it.",
    await tip(),
  );
  await page.locator("#register-password2").pressSequentially("23");
  check(
    "same password",
    (await tip()) === "Your password is now secure.",
    await tip(),
  );
  check("same password green", (await state("register-password2")) === "ok");
  await page.fill("#register-password", "");
  check(
    "emptying the password clears the retype",
    (await page.inputValue("#register-password2")) === "",
  );
  await page.fill("#register-password", "secret123");
  await page.fill("#register-password2", "secret123");

  await page.focus("#register-email");
  check(
    "email hint",
    (await tip())?.startsWith(
      "Please enter your email address. You need to activate",
    ),
    await tip(),
  );
  await page.locator("#register-email").pressSequentially("new");
  check(
    "bad email tip",
    (await tip()) === "Please enter a valid email address.",
    await tip(),
  );
  await page.fill("#register-email", "a+b@example.com");
  check(
    "holo's rule refuses a plus",
    (await state("register-email")) === "error",
  );
  await page.fill("#register-email", "new@example.com");
  check(
    "good email asks to retype",
    (await tip()) === "Please re-enter your email address.",
    await tip(),
  );
  await page.locator("#register-email2").pressSequentially("other");
  check(
    "different email",
    (await tip()) === "Your retyped email doesn't match.",
    await tip(),
  );
  await page.fill("#register-email2", "new@example.com");
  check(
    "same email",
    (await tip()) === "You have provided a valid email address, thanks!",
    await tip(),
  );

  await page.click("#register-button-continue");
  check(
    "Done without birthday or terms: red box",
    await page.locator("#form-validation-error-box").isVisible(),
  );
  check("birthday marked", (await state("register-birthday")) === "error");
  check("terms marked", (await state("register-terms-content")) === "error");
  check(
    "birthday tip, the last one failing in Holo's order",
    (await tip()) === "Please supply a valid birthdate",
    await tip(),
  );
  await shot(page, "register-errors");
  await page.selectOption("#register-day", "1");
  await page.selectOption("#register-month", "5");
  const year = new Date().getFullYear();
  await page.selectOption("#register-year", "1990");
  await page.click("#register-birthday");
  check(
    "clicking the birthday clears the mark",
    (await state("register-birthday")) === null,
  );
  await page.click("#register-button-continue");
  check(
    "terms tip when only the terms fail",
    (await tip()) === "Please accept the Terms and Conditions",
    await tip(),
  );
  await page.click("label:has(#register-terms-check)");
  check(
    "accepting clears the mark",
    (await state("register-terms-content")) === null,
  );

  await page.selectOption("#register-year", String(year - 3));
  await page.click("#register-button-continue");
  check(
    "too young bubble",
    (await page
      .locator("text=Sorry but you cannot register, because you are too young.")
      .count()) === 1,
  );
  await page.click('a:has-text("Cancel")');
  await page.waitForURL("**/?ageLimit=true");
  check(
    "too young message",
    await page.locator("text=You are too young to register.").isVisible(),
  );

  await page.goto(base + "/register");
  await page.fill("#register-name", "Kiddo");
  await page.keyboard.press("Enter");
  await open();
  await page.fill("#register-password", "secret123");
  await page.fill("#register-password2", "secret123");
  await page.fill("#register-email", "kid@example.com");
  await page.fill("#register-email2", "kid@example.com");
  await page.selectOption("#register-day", "1");
  await page.selectOption("#register-month", "5");
  await page.selectOption("#register-year", String(year - 10));
  await page.click("label:has(#register-terms-check)");
  await page.click("#register-button-continue");
  const parent = page.locator("input:not([name])[type=text]");
  await parent.waitFor();
  check(
    "parent bubble",
    await page
      .locator("text=we require your parent or guardian's email address.")
      .isVisible(),
  );
  await parent.fill("kid@example.com");
  await parent.press("Enter");
  check(
    "own address refused",
    await page
      .locator("text=You parent's email and your email cannot be the same")
      .isVisible(),
  );
  await parent.fill("");
  await parent.pressSequentially("nonsense");
  await parent.press("Enter");
  check(
    "bad parent address refused",
    await page
      .locator("text=Please enter a valid email address.")
      .first()
      .isVisible(),
  );
  await parent.fill("");
  await parent.pressSequentially("parent@example.com");
  await Promise.all([page.waitForURL("**/me"), parent.press("Enter")]);
  check("parent address lets the child in", page.url().endsWith("/me"));
  await page.goto(base + "/logout");
  await page.locator('button:has-text("Sign Out")').click();
  check(
    "signed out",
    await page.locator("text=You have successfully signed out").isVisible(),
  );

  await page.goto(base + "/register");
  await page.fill("#register-name", "Grown");
  await page.keyboard.press("Enter");
  await open();
  await page.fill("#register-name", "Grown2");
  check("changing the name closes the details", await closed());
  await page.keyboard.press("Enter");
  await open();
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.click("#register-terms-link"),
  ]);
  await popup.waitForLoadState();
  check("terms popup", popup.url().endsWith("/disclaimer"), popup.url());
  await popup.close();
  check("page stays", page.url().endsWith("/register"));

  // the editor's start-up block must not stop a visitor who leaves the look alone
  await page.waitForFunction(
    () => document.getElementById("register-figure").value !== "",
  );
  await page.waitForTimeout(6500);
  check(
    "Done stays enabled after the editor starts",
    !(await page.locator("#register-button-continue").isDisabled()),
  );
  const figure = await page.inputValue("#register-figure");
  await page.fill("#register-password", "secret123");
  await page.fill("#register-password2", "secret123");
  await page.fill("#register-email", "grown@example.com");
  await page.fill("#register-email2", "grown@example.com");
  await page.selectOption("#register-day", "1");
  await page.selectOption("#register-month", "5");
  await page.selectOption("#register-year", "1990");
  await page.click("label:has(#register-terms-check)");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click("#register-button-continue"),
  ]);
  const avatar = await page.locator('img[src*="figure="]').getAttribute("src");
  check(
    "the editor's look is saved",
    avatar.includes(figure),
    `${figure} not in ${avatar}`,
  );
  await page.goto(base + "/logout");
  await page.locator('button:has-text("Sign Out")').click();

  // without JavaScript the plain form still registers
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const plain = await nojs.newPage();
  await plain.goto(base + "/register");
  check(
    "no JS: details open",
    !(await plain.locator("#register-password").isDisabled()),
  );
  check(
    "no JS: no check button",
    !(await plain.locator("#register-name-check").isVisible()),
  );
  await plain.fill("#register-name", "NoScript");
  await plain.fill("#register-password", "secret123");
  await plain.fill("#register-password2", "wrong-one");
  await plain.fill("#register-email", "plain@example.com");
  await plain.fill("#register-email2", "plain@example.com");
  await plain.selectOption("#register-day", "1");
  await plain.selectOption("#register-month", "5");
  await plain.selectOption("#register-year", "1990");
  await plain.click("#register-button-continue");
  check(
    "no JS: the server answers in the page",
    await plain
      .locator("text=The passwords do not match. Please try again.")
      .isVisible(),
  );
  check(
    "no JS: terms error",
    await plain.locator("text=Please accept the terms of service").isVisible(),
  );
  check(
    "no JS: name kept",
    (await plain.inputValue("#register-name")) === "NoScript",
  );
  await plain.fill("#register-password", "secret123");
  await plain.fill("#register-password2", "secret123");
  await plain.fill("#register-email2", "plain@example.com");
  await plain.check("#register-terms-check");
  await plain.click("#register-button-continue");
  await plain.waitForURL("**/me");
  check("no JS: registered with the default look", plain.url().endsWith("/me"));
  await nojs.close();

  // a failed post keeps the name, and the island opens the details again
  await page.goto(base + "/logout");
  const form = await browser.newContext();
  const again = await form.newPage();
  await again.route("**/register", async (route) => {
    if (route.request().method() === "POST") {
      const body = route
        .request()
        .postData()
        .replace(/year=\d*/, "year=1919");
      await route.continue({ postData: body });
    } else {
      await route.continue();
    }
  });
  await again.goto(base + "/register");
  await again.fill("#register-name", "Retry");
  await again.keyboard.press("Enter");
  await again.waitForFunction(
    () => !document.getElementById("register-password").disabled,
  );
  await again.fill("#register-password", "secret123");
  await again.fill("#register-password2", "secret123");
  await again.fill("#register-email", "retry@example.com");
  await again.fill("#register-email2", "retry@example.com");
  await again.selectOption("#register-day", "1");
  await again.selectOption("#register-month", "5");
  await again.selectOption("#register-year", "1990");
  await again.check("#register-terms-check");
  await again.click("#register-button-continue");
  await again.waitForFunction(
    () =>
      !document.getElementById("register-password").disabled &&
      document.getElementById("register-name").dataset.state === "ok",
  );
  check(
    "a failed post reopens the details",
    await again
      .locator("text=Please supply a valid date of birth.")
      .isVisible(),
  );
  await form.close();

  const db = ["habbo.db", "habbo.db-wal"]
    .map((file) => {
      try {
        return readFileSync(`${dir}/${file}`, "latin1");
      } catch {
        return "";
      }
    })
    .join("");
  check(
    "the parent's address is not stored",
    !db.includes("parent@example.com"),
  );
  check("no script errors", errors.length === 0, errors.join(" | "));
}
