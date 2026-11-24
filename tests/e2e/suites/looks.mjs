export default async function ({ base, browser, check, shot, sql, eventually }) {
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
  // Admin-1's look holds club items, and Admin-1 is not in the club yet.
  await listen(page);
  await reported(page, 1);
  const clubNotice = page.getByText(
    "are available only to Habbo Club members.",
  );
  check(
    "the editor shows the club notice for a look with club items outside the club",
    await clubNotice.isVisible(),
  );
  const clubLook = await opening(page, 1, 6500);
  await shot(page, "looks");
  check(
    "save stays closed past the five seconds for such a look",
    clubLook.after === null &&
      (await page.locator("#settings-submit").isDisabled()),
    JSON.stringify(clubLook),
  );
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

  // Holo's Flash held nothing for a look with club items outside the club, so a
  // change in what would have been its five seconds counts at once.
  await page.reload();
  await listen(page);
  await reported(page, 1);
  await page.waitForTimeout(2500);
  await randomize(page);
  await reported(page, 2);
  const leftClub = await opening(page, 2, 2000);
  check(
    "a change from such a look to one the club allows opens save at once",
    leftClub.after !== null &&
      leftClub.after < 500 &&
      !(await clubNotice.isVisible()),
    JSON.stringify(leftClub),
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

  await listen(page);
  await reported(page, 1);
  const allowed = await opening(page, 1);
  check(
    "save opens by itself five seconds after the editor draws a look the club allows",
    fiveSeconds(allowed),
    JSON.stringify(allowed),
  );
  await page.goto(base + "/account/looks");
  await listen(page);
  await reported(page, 1);
  await page.waitForTimeout(2500);
  await randomize(page);
  await reported(page, 2);
  const changedEarly = await page.locator("#settings-submit").isDisabled();
  const atTheirEnd = await opening(page, 1);
  check(
    "a change within the five seconds counts at their end",
    changedEarly && fiveSeconds(atTheirEnd),
    JSON.stringify({ changedEarly, ...atTheirEnd }),
  );
  // The head tab, its first hair, then the second colour of the third row,
  // which only the club may wear.
  await page.goto(base + "/account/looks");
  await listen(page);
  await reported(page, 1);
  const editor = await page.locator("#editor-container canvas").boundingBox();
  for (const [x, y] of [
    [113, 20],
    [84, 122],
    [58, 341],
  ]) {
    await page.waitForTimeout(400);
    await page.mouse.click(editor.x + x, editor.y + y);
  }
  await reported(page, 3);
  const clubColour = await opening(page, 1, 6500);
  await shot(page, "looks-club-colour");
  check(
    "a club colour chosen within the five seconds keeps save closed at their end",
    clubColour.after === null &&
      (await page.locator("#settings-submit").isDisabled()) &&
      (await clubNotice.isVisible()),
    JSON.stringify({
      ...clubColour,
      looks: await page.evaluate(() => window.looks),
    }),
  );
  check("join club box", await page.getByText("Join Reborn Club").isVisible());
  check(
    "nav marks looks",
    (await page.locator("ul.flex-col li.font-bold").first().innerText()) ===
      "Looks",
  );

  await wardrobe({ base, page, check, shot, sql, eventually });

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

// The editor reports its look once it has drawn itself, and on every change; the
// suite counts the reports to know when the editor is ready. It also notes when
// each look came and whether save was closed then, and when save opened.
async function listen(page) {
  await page.waitForFunction(() => window.HabboEditor);
  await page.evaluate(() => {
    const editor = window.HabboEditor;
    const report = editor.setGenderAndFigure;
    const save = document.getElementById("settings-submit");
    window.looks = [];
    window.looked = [];
    window.opened = [];
    editor.setGenderAndFigure = (gender, figure) => {
      window.looks.push(figure);
      window.looked.push({ at: performance.now(), closed: save.disabled });
      report(gender, figure);
    };
    new MutationObserver(() => {
      if (!save.disabled) window.opened.push(performance.now());
    }).observe(save, { attributeFilter: ["disabled"] });
  });
}

// Whether save was closed when look number n came, and how many milliseconds
// after it save opened; after is null while save stays closed until timeout.
async function opening(page, n, timeout = 10000) {
  await page
    .waitForFunction(
      (n) => window.opened.some((at) => at > window.looked[n - 1].at),
      n,
      { timeout },
    )
    .catch(() => {});
  return page.evaluate((n) => {
    const look = window.looked[n - 1];
    const opened = window.opened.find((at) => at > look.at);
    return {
      closed: look.closed,
      after: opened === undefined ? null : Math.round(opened - look.at),
    };
  }, n);
}

// Holo's Flash opened save five seconds after drawing a look the club allows.
const fiveSeconds = ({ closed, after }) =>
  closed && after !== null && after >= 4990 && after < 6000;

// Randomize, at the top right of the editor, changes the look.
async function randomize(page) {
  const box = await page.locator("#editor-container canvas").boundingBox();
  await page.mouse.click(box.x + 330, box.y + 56);
}

async function reported(page, count) {
  await page.waitForFunction((n) => window.looks.length >= n, count, {
    timeout: 30000,
  });
  return page.evaluate(() => window.looks.at(-1));
}

// The club wardrobe: Admin-1 joins the club, keeps the editor's looks in slots,
// replaces one after Holo's question, dresses in another and wears it, and meets
// a slot the hotel took away while the page was open.
async function wardrobe({ base, page, check, shot, sql, eventually }) {
  check(
    "no wardrobe outside the club",
    (await page.locator("#settings-wardrobe").count()) === 0,
  );

  const [[admin, userID]] = sql(
    "SELECT id, user_id FROM avatars WHERE name = 'Admin-1'",
  );
  sql(`INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at)
    VALUES (${userID}, '2026-11-01 12:00:00.000000000+00:00', '2099-01-01 00:00:00.000000000+00:00', '2026-11-01 12:00:00.000000000+00:00')`);
  const outfits = () =>
    sql(
      `SELECT slot, figure FROM wardrobe_outfits WHERE avatar_id = ${admin} ORDER BY slot`,
    )
      .map((row) => row.join(":"))
      .join(" ");
  const picture = (slot) =>
    page
      .locator(`#wardrobe-slot-${slot}`)
      .evaluate((p) => p.style.backgroundImage);
  const shows = async (slot, figure) =>
    (await picture(slot)).includes(
      `figure=${figure}&size=s&direction=4&head_direction=4&gesture=sml`,
    );

  await page.goto(base + "/account/looks");
  await listen(page);
  const first = await reported(page, 1);
  check(
    "club members get one slot per homes.wardrobeSlots, empty",
    (await page.locator("#wardrobe-slots > li").count()) === 5 &&
      (await page.locator('#wardrobe-slots [id^="wardrobe-store-"]').count()) ===
        5 &&
      (await page.locator('#wardrobe-slots [id^="wardrobe-dress-"]').count()) ===
        0,
  );
  const inClub = await opening(page, 1);
  check(
    "in the club, save opens by itself five seconds after the editor draws the look",
    fiveSeconds(inClub),
    JSON.stringify(inClub),
  );

  await page.hover("#wardrobe-store-1");
  const tip = page.locator("#wardrobe-instructions");
  const tipBox = await tip.boundingBox();
  const slots = await page.locator("#wardrobe-slots").boundingBox();
  check(
    "hovering the wardrobe shows Holo's instructions with the number of slots",
    (await tip.innerText()).includes(
      "Press red arrows to save up to 5 outfits to your wardrobe. Press green arrow to select an outfit and save changes to take it into use.",
    ),
    await tip.innerText(),
  );
  check(
    "the instructions stand 87 pixels left of the slots, 17 above them",
    Math.round(slots.x - tipBox.x) === 87 &&
      Math.round(slots.y - tipBox.y - tipBox.height) === 17,
    `${slots.x - tipBox.x} ${slots.y - tipBox.y - tipBox.height}`,
  );
  await shot(page, "looks-wardrobe-instructions");
  await page.mouse.move(5, 5);
  check("leaving the wardrobe hides them", (await tip.count()) === 0);

  await page.click("#wardrobe-store-1");
  await page.locator("#wardrobe-dress-1").waitFor();
  check(
    "a red arrow keeps the editor's look in an empty slot, with its picture",
    outfits() === `1:${first}` && (await shows(1, first)),
    `${outfits()} ${await picture(1)}`,
  );

  const canvas = await page.locator("#editor-container canvas").boundingBox();
  // Randomize rests for a second after each use.
  const randomize = async () => {
    await page.waitForTimeout(1100);
    await page.mouse.click(canvas.x + 330, canvas.y + 56);
  };
  await randomize();
  const second = await reported(page, 2);
  await page.click("#wardrobe-store-2");
  await page.locator("#wardrobe-dress-2").waitFor();
  await randomize();
  const third = await reported(page, 3);
  check(
    "the editor's next looks differ",
    new Set([first, second, third]).size === 3,
  );

  const question = page.getByRole("dialog", { name: "Replace?" });
  await page.click("#wardrobe-store-1");
  await question.waitFor();
  check(
    "a red arrow over an outfit asks first, in Holo's words",
    (await question.innerText()).includes(
      "Are you sure you want to replace the stored outfit with the new one?",
    ),
  );
  await shot(page, "looks-wardrobe-replace");
  await question.getByRole("button", { name: "Cancel" }).click();
  await question.waitFor({ state: "hidden" });
  check(
    "Cancel keeps the stored outfit",
    outfits() === `1:${first} 2:${second}` && (await shows(1, first)),
  );
  await page.click("#wardrobe-store-2");
  await question.waitFor();
  await question.getByRole("button", { name: "OK" }).click();
  check(
    "OK replaces it",
    (await eventually(async () => outfits() === `1:${first} 2:${third}`)) &&
      (await eventually(() => shows(2, third))),
    outfits(),
  );

  const drawn = await page.$("#editor-container canvas");
  const openBefore = !(await page.locator("#settings-submit").isDisabled());
  await page.click("#wardrobe-dress-1");
  check(
    "a green arrow puts the outfit in the form at once, starts the editor again and closes save",
    (await page.inputValue("#settings-figure")) === first &&
      !(await drawn.evaluate((element) => element.isConnected)) &&
      openBefore &&
      (await page.locator("#settings-submit").isDisabled()),
  );
  const dressed = await reported(page, 4);
  const config = await page.evaluate(() => window.HabboEditorConfig);
  check(
    "the editor starts again with the outfit and the club's choices",
    dressed === first &&
      config.figure === first &&
      config.showClubSelections === true &&
      config.userHasClub === true,
    JSON.stringify(config),
  );
  await shot(page, "looks-wardrobe-dressed");

  const redrawn = await page.$("#editor-container canvas");
  await page.click("#wardrobe-dress-1");
  await page.waitForTimeout(500);
  check(
    "the green arrow of the outfit the editor shows does nothing",
    (await redrawn.evaluate((element) => element.isConnected)) &&
      (await page.evaluate(() => window.looks.length)) === 4,
  );

  await page.click("#wardrobe-dress-2");
  await page.click("#wardrobe-dress-1");
  const last = await reported(page, 6);
  check(
    "a green arrow pressed while the editor loads starts it again once it has drawn itself",
    (await page.evaluate(() => window.looks.slice(4).join(" "))) ===
      `${third} ${first}` &&
      last === first &&
      (await page.inputValue("#settings-figure")) === first,
    await page.evaluate(() => window.looks.join(" ")),
  );

  const lastDressed = await opening(page, 6);
  check(
    "save opens by itself five seconds after the editor draws the outfit of the last green arrow",
    fiveSeconds(lastDressed),
    JSON.stringify(lastDressed),
  );
  await page.click("#settings-submit");
  await page.getByText("Account settings updated successfully.").waitFor();
  check(
    "saving the looks form then wears the outfit",
    sql(`SELECT figure FROM avatars WHERE id = ${admin}`)[0][0] === first,
  );
  await page.locator("#wardrobe-dress-2").waitFor();
  check(
    "the wardrobe keeps its outfits",
    (await shows(1, first)) && (await shows(2, third)),
  );

  sql(`INSERT INTO settings (key, value, updated_at)
    VALUES ('homes.wardrobeSlots', '3', '2026-11-01 12:00:00.000000000+00:00')`);
  check(
    "the hotel lowers homes.wardrobeSlots to 3",
    await eventually(async () =>
      (await (await page.request.get(base + "/account/looks")).text()).includes(
        'data-slots="3"',
      ),
    ),
  );
  let alerted = "";
  page.once("dialog", (dialog) => {
    alerted = dialog.message();
    dialog.accept();
  });
  await page.click("#wardrobe-store-5");
  check(
    "a slot the hotel took away answers Holo's alert, and stays empty",
    (await eventually(
      async () => alerted === "Error! This outfit cannot be saved.",
    )) &&
      (await page.locator("#wardrobe-dress-5").count()) === 0 &&
      (await picture(5)) === "" &&
      outfits() === `1:${first} 2:${third}`,
    alerted,
  );
  await page.reload();
  await page.locator("#wardrobe-dress-2").waitFor();
  await page.hover("#wardrobe-store-1");
  check(
    "the page then shows three slots, and says so",
    (await page.locator("#wardrobe-slots > li").count()) === 3 &&
      (await tip.innerText()).includes("save up to 3 outfits"),
  );
}
