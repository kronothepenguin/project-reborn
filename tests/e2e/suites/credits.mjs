// The credits page, as a guest reads it and as Frank redeems vouchers into the purse
// his two habbos share, SPRING20 worth 20 and summer50 worth 50, and reads its
// transactions.
export const programs = ["cms"];

const at = "2026-11-01 12:00:00.000000000+00:00";

export const prepare = ({ sql }) => {
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${at}', '${at}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${at}')`);
  sql(`INSERT INTO wallets (user_id, credits, updated_at) VALUES (${frank}, 100, '${at}')`);
  for (const name of ["Frank", "FrankToo"]) {
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
      VALUES (${frank}, '${name}', 'hd-180-1', 'M', '', '${at}', '${at}')`);
    const [[habbo]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${habbo}, '${at}', '${at}')`);
    const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${habbo}`);
    sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at}')`);
  }
  for (const [code, credits] of [["SPRING20", 20], ["summer50", 50]]) {
    sql(`INSERT INTO vouchers (code, credits, created_at) VALUES ('${code}', ${credits}, '${at}')`);
  }
};

async function visitor(browser, base, name) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.status() !== 422) problems.push(`${r.status()} ${r.url()}`);
  });
  if (name) {
    await page.goto(base + "/");
    await page.fill("#username", name);
    await page.fill("#password", "secret123");
    await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  }
  return { context, page, problems };
}

const picture = (page, src) =>
  page.locator(`main img[src="${src}"]`).evaluate((img) => img.complete && img.naturalWidth > 0);

export default async function ({ base, browser, check, shot, sql }) {
  const guest = await visitor(browser, base);
  let page = guest.page;
  await page.goto(base + "/credits");
  await shot(page, "credits-guest");
  check(
    "the page has Holo's title, and the Credits tab and sub-tab are the active ones",
    (await page.title()).endsWith("~ Credits") &&
      (await page.locator("header li strong").innerText()) === "Credits" &&
      (await page.locator("nav li.font-bold").innerText()) === "Credits",
  );
  const headings = page.locator("main header");
  check(
    "the green box stands in the first column, the brown purse and the blue box in the second",
    JSON.stringify(await headings.allInnerTexts()) === JSON.stringify(["Get credits!", "Your purse", "What are credits?"]) &&
      (await headings.nth(0).getAttribute("class")).includes("bg-lime-600") &&
      (await headings.nth(1).getAttribute("class")).includes("bg-yellow-700") &&
      (await headings.nth(2).getAttribute("class")).includes("bg-sky-700") &&
      (await headings.nth(0).boundingBox()).x < (await headings.nth(1).boundingBox()).x &&
      (await headings.nth(1).boundingBox()).y < (await headings.nth(2).boundingBox()).y,
    JSON.stringify(await headings.allInnerTexts()),
  );
  check(
    "the boxes show their BBCode beside Holo's pictures",
    (await picture(page, "/web-gallery/album1/palmchair.gif")) &&
      (await picture(page, "/web-gallery/v2/images/credits/credits_permission.png")) &&
      (await page.locator("main strong", { hasText: "credits" }).count()) === 1 &&
      (await page.getByText("* Redeem a voucher if you have one").isVisible()) &&
      (await page.getByText("Credits are the hotel's currency.").isVisible()),
  );
  check(
    "a guest is told to sign in to see the purse",
    (await page.getByText("You need to be logged in to see the purse.").isVisible()) &&
      (await page.getByText("You Currently Have:").count()) === 0,
  );
  check("the guest's page failed nowhere", guest.problems.length === 0, guest.problems.join(", "));
  await guest.context.close();

  const [[frankUser]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  const signedIn = await visitor(browser, base, "FrankToo");
  page = signedIn.page;
  await page.goto(base + "/credits");
  const purse = page.locator("main form");
  await purse.getByText("Enter redemption code:").waitFor();
  await shot(page, "credits-purse");
  const purseText = await purse.innerText();
  check(
    "the purse shows the shared balance, the link to the transactions and the code field",
    purseText.includes("You Currently Have:") &&
      purseText.includes("100 Credits") &&
      (await purse.getByRole("link", { name: "Account transactions" }).getAttribute("href")) === "/credits/transactions" &&
      (await purse.getByRole("button", { name: "Submit" }).isVisible()),
    purseText,
  );

  await purse.getByLabel("Enter redemption code:").fill("SPRING20");
  await purse.getByRole("button", { name: "Submit" }).click();
  await purse.getByText("You have redeemed 20 credits successfully.").waitFor();
  await shot(page, "credits-redeemed");
  check(
    "Submit redeems the code: the purse shows the new balance and Holo's answer in green, without the field",
    (await purse.innerText()).includes("120 Credits") &&
      (await purse.getByText("You have redeemed 20 credits successfully.").getAttribute("class")).includes("bg-lime-600") &&
      (await purse.getByLabel("Enter redemption code:").count()) === 0 &&
      (await purse.getByRole("link", { name: "Account transactions" }).isVisible()),
    await purse.innerText(),
  );

  await page.goto(base + "/credits");
  await purse.getByLabel("Enter redemption code:").fill("spring20");
  await purse.getByLabel("Enter redemption code:").press("Enter");
  await purse.getByText("Your redeem code could not be found. Please try again.").waitFor();
  await shot(page, "credits-not-found");
  check(
    "Enter sends the code too, and a code used once is not found again, in red",
    (await purse.innerText()).includes("120 Credits") &&
      (await purse.getByText("Your redeem code could not be found. Please try again.").getAttribute("class")).includes("bg-red-600") &&
      (await purse.getByLabel("Enter redemption code:").count()) === 0,
    await purse.innerText(),
  );

  await page.goto(base + "/credits");
  await purse.getByLabel("Enter redemption code:").fill("SUMMER50");
  await purse.getByRole("button", { name: "Submit" }).click();
  await purse.getByText("You have redeemed 50 credits successfully.").waitFor();

  const [[frank]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  sql(`INSERT INTO wallet_transactions (user_id, avatar_id, credits, reason, detail, created_at)
    VALUES (${frankUser}, ${frank}, -20, 'group', 'Group purchase', '2026-11-02 08:30:05.000000000+00:00')`);
  sql(`INSERT INTO wallet_transactions (user_id, avatar_id, credits, reason, detail, created_at)
    VALUES (${frankUser}, NULL, 5, 'staff', '', '2026-11-02 09:00:00.000000000+00:00')`);
  await Promise.all([page.waitForURL("**/credits/transactions"), purse.getByRole("link", { name: "Account transactions" }).click()]);
  await purse.getByText("You Currently Have:").waitFor();
  await shot(page, "credits-transactions");
  check(
    "the purse's link opens Account transactions under the Credits tab, with neither sub-tab chosen, as Holo's",
    (await page.title()).endsWith("~ Account transactions") &&
      (await page.locator("header li strong").innerText()) === "Credits" &&
      (await page.locator("nav li.font-bold").count()) === 0 &&
      JSON.stringify(await page.locator("main header").allInnerTexts()) === JSON.stringify(["Account transactions", "Your purse"]) &&
      (await page.getByText("This is an overview of your credit transaction history. They are updated as soon as the transaction is made. You can see up to 50 records.").isVisible()),
    JSON.stringify(await page.locator("main header").allInnerTexts()),
  );
  const table = page.locator("main table");
  const cells = async () => {
    const out = [];
    for (const row of await table.locator("tbody tr").all()) out.push(await row.locator("td").allInnerTexts());
    return out;
  };
  const listed = await cells();
  const date = /^\d\d-\d\d-\d{4} \d\d:\d\d:\d\d$/;
  check(
    "the table lists the user's ledger newest first, with Holo's date, the activity, the detail or else the reason, and the habbo that acted",
    JSON.stringify(await table.locator("thead th").allInnerTexts()) === JSON.stringify(["Date", "Activity", "Description", "Habbo"]) &&
      listed.length === 4 &&
      JSON.stringify(listed.slice(0, 2)) ===
        JSON.stringify([
          ["02-11-2026 09:00:00", "5", "staff", ""],
          ["02-11-2026 08:30:05", "-20", "Group purchase", "Frank"],
        ]) &&
      JSON.stringify(listed.slice(2).map((row) => row.slice(1))) ===
        JSON.stringify([
          ["50", "Credit voucher redeem", "FrankToo"],
          ["20", "Credit voucher redeem", "FrankToo"],
        ]) &&
      listed.every((row) => date.test(row[0])),
    JSON.stringify(listed),
  );
  const rowClasses = await table.locator("tbody tr").evaluateAll((rows) => rows.map((row) => row.className.includes("bg-taupe-100")));
  check("the first row is Holo's grey one, and every other after it", JSON.stringify(rowClasses) === JSON.stringify([true, false, true, false]), JSON.stringify(rowClasses));
  check(
    "the purse stands beside the table, with the shared balance and the code field",
    (await purse.innerText()).includes("170 Credits") && (await purse.getByLabel("Enter redemption code:").isVisible()),
    await purse.innerText(),
  );

  check("no page failed", signedIn.problems.length === 0, signedIn.problems.join(", "));
  await signedIn.context.close();
}
