export default async function ({ base, browser, check, shot, sql }) {
  const page = await (
    await browser.newContext({ viewport: { width: 1100, height: 760 } })
  ).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/");
  await page.fill("#username", "Admin-1");
  await page.fill("#password", "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button:has-text("Sign in")'),
  ]);
  await page.goto(base + "/account");
  await page.waitForURL("**/account/looks");
  check(
    "title",
    (await page.title()) === "Reborn ~ Account Settings",
    await page.title(),
  );
  check(
    "save starts disabled",
    await page.locator("#settings-submit").isDisabled(),
  );
  await page.waitForFunction(() =>
    document.querySelector("#editor-container canvas"),
  );
  await page.waitForTimeout(7000);
  await shot(page, "looks");
  check(
    "save stays disabled until the editor is touched",
    await page.locator("#settings-submit").isDisabled(),
  );
  // a click on the randomize area or a body part changes the look
  const canvas = page.locator("#editor-container canvas");
  const box = await canvas.boundingBox();
  const before = await page.inputValue("#settings-figure");
  await page.evaluate(() => window.HabboEditor.setAllowedToProceed(true));
  check(
    "allowed enables save",
    !(await page.locator("#settings-submit").isDisabled()),
  );
  await page.evaluate(() => window.HabboEditor.setAllowedToProceed(false));
  check(
    "not allowed disables save",
    await page.locator("#settings-submit").isDisabled(),
  );
  await page.evaluate(() => window.HabboEditor.showHabboClubNotice());
  check(
    "club notice",
    await page
      .getByText("are available only to Habbo Club members.")
      .isVisible(),
  );
  await page.evaluate(() => window.HabboEditor.setAllowedToProceed(true));
  check(
    "allowed hides the club notice",
    !(await page
      .getByText("are available only to Habbo Club members.")
      .isVisible()),
  );
  await page.evaluate(() => window.HabboEditor.showOldFigureNotice());
  check(
    "old figure notice",
    await page.getByText("not selectable anymore").isVisible(),
  );
  await page.evaluate(() => {
    document.getElementById("settings-figure").value = "hd-205-6";
    document.getElementById("settings-gender").value = "F";
  });
  await page.click("#settings-submit");
  await page.getByText("Account settings updated successfully.").waitFor();
  check(
    "saved",
    sql("select figure, gender from avatars where name='Admin-1'")[0].join(
      "|",
    ) === "hd-205-6|F",
  );
  check("join club box", await page.getByText("Join Reborn Club").isVisible());
  check(
    "nav marks looks",
    (await page.locator("ul.flex-col li.font-bold").first().innerText()) ===
      "Looks",
  );

  // /register must still ignore the callbacks
  const reg = await (await browser.newContext()).newPage();
  await reg.goto(base + "/register");
  await reg.waitForFunction(
    () => document.getElementById("register-figure").value !== "",
  );
  check(
    "register gets no callback",
    await reg.evaluate(
      () => window.HabboEditor.setAllowedToProceed === undefined,
    ),
  );
  check("no script errors", errors.length === 0, errors.join(" | "));
}
