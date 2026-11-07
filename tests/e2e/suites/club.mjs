// The club page: a guest reads it, and Frank, with 300 credits and two habbos,
// Frank wearing ADM and FrankToo wearing NWB, buys a month and then three months,
// meets the month limit and a purse too short, and sees his club end.
export const programs = ["cms"];

const at = "2026-11-01 12:00:00.000000000+00:00";

export const prepare = ({ sql }) => {
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
    VALUES ('frank@example.com', '1990-05-01', '127.0.0.1', '${at}', '${at}')`);
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${frank}, '${hash}', '${at}')`);
  sql(`INSERT INTO wallets (user_id, credits, updated_at) VALUES (${frank}, 300, '${at}')`);
  for (const [name, badge] of [["Frank", "ADM"], ["FrankToo", "NWB"]]) {
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
      VALUES (${frank}, '${name}', 'hd-180-1', 'M', '', '${at}', '${at}')`);
    const [[avatar]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${avatar}, '${at}', '${at}')`);
    const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${avatar}`);
    sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at}')`);
    sql(`INSERT INTO avatar_badges (avatar_id, code, worn, granted_at) VALUES (${avatar}, '${badge}', TRUE, '${at}')`);
  }
};

export default async function ({ base, browser, check, shot, sql }) {
  const [[frank]] = sql("SELECT id FROM users WHERE email = 'frank@example.com'");
  const badges = () =>
    Object.fromEntries(
      sql(`SELECT avatars.name, avatar_badges.code, avatar_badges.worn FROM avatar_badges
        JOIN avatars ON avatars.id = avatar_badges.avatar_id WHERE avatars.user_id = ${frank}
        ORDER BY avatars.name, avatar_badges.code`).map(([name, code, worn]) => [`${name} ${code}`, worn === 1]),
    );
  const credits = () => sql(`SELECT credits FROM wallets WHERE user_id = ${frank}`)[0][0];
  const periods = () => sql(`SELECT starts_at, ends_at FROM club_subscriptions WHERE user_id = ${frank} ORDER BY starts_at`);

  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500 || (r.status() >= 400 && r.status() !== 422)) problems.push(`${r.status()} ${r.url()}`);
  });

  await page.goto(base + "/club");
  await shot(page, "club-guest");
  const headings = page.locator("main header");
  check(
    "a guest reads Holo's club page under Credits, with the Habbo Club tab",
    (await page.title()) === "Reborn ~ Reborn Club" &&
      (await page.locator("nav li.font-bold").innerText()) === "Habbo Club" &&
      JSON.stringify(await headings.allInnerTexts()) === JSON.stringify(["Reborn Club: become a VIP!", "Benefits", "My Membership"]) &&
      (await headings.nth(0).getAttribute("class")).includes("bg-orange-700") &&
      (await headings.nth(1).getAttribute("class")).includes("bg-yellow-600"),
    JSON.stringify(await headings.allInnerTexts()),
  );
  check(
    "a guest is asked to sign in to see the club status",
    (await page.getByText("Please sign in to see your Reborn Club status.").isVisible()) &&
      (await page.getByRole("button", { name: "Buy 1 month" }).count()) === 0,
  );
  const pictures = await page.locator("#habboclub-products img").evaluateAll((images) =>
    images.map((image) => image.complete && image.naturalWidth),
  );
  check("the products show Holo's pictures", JSON.stringify(pictures) === JSON.stringify([106, 320, 440]), JSON.stringify(pictures));
  const benefits = page.locator("#habboclub-info");
  const backgrounds = await benefits.locator("p").evaluateAll((paragraphs) =>
    paragraphs.map((p) => getComputedStyle(p).backgroundImage).filter((image) => image !== "none"),
  );
  const loaded = await page.evaluate(
    (urls) =>
      Promise.all(
        urls.map(async (url) => {
          const image = new Image();
          image.src = url.slice(5, -2);
          await image.decode();
          return image.naturalWidth;
        }),
      ),
    backgrounds,
  );
  check(
    "the benefits come with Holo's seven headings and their five pictures",
    JSON.stringify(await benefits.locator("h3").allInnerTexts()) ===
      JSON.stringify([
        "1. Extra Clothes & Accessories",
        "2. Free Furni",
        "3. Exclusive Room Layouts",
        "4. Access All Areas",
        "5. Homepage Upgrades",
        "6. More Friends",
        "7. Special Commands",
      ]) &&
      (await benefits.innerText()).includes("Reborn Club is our VIP members-only club - absolutely no riff-raff admitted!") &&
      (await benefits.innerText()).includes("Once a month, every month, you'll get an exclusive piece of Reborn Club furni.") &&
      JSON.stringify(loaded) === JSON.stringify([66, 250, 388, 154, 215]),
    JSON.stringify(loaded),
  );

  await page.goto(base + "/");
  await page.fill("#username", "Frank");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  await page.goto(base + "/club");
  const membership = page.locator("main").getByText("a member of Reborn Club");
  await membership.waitFor();
  const rows = await page
    .locator("main table tr")
    .evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((cell) => cell.innerText.trim())));
  check(
    "Frank is not a member, and has the three buy buttons with Holo's prices",
    (await membership.innerText()) === "You are not a member of Reborn Club" &&
      JSON.stringify(rows) ===
        JSON.stringify([
          ["Buy 1 month", "20 Credits"],
          ["Buy 3 months", "50 Credits"],
          ["Buy 6 months", "80 Credits"],
        ]),
    JSON.stringify(rows),
  );
  await shot(page, "club-not-member");

  const dialog = page.getByRole("dialog", { name: "REBORN CLUB" });
  await page.getByRole("button", { name: "Buy 1 month" }).click();
  await dialog.waitFor();
  await shot(page, "club-confirm");
  check(
    "a buy button opens Holo's dialog, which asks first",
    (await dialog.innerText()).includes("Confirm") &&
      (await dialog.innerText()).includes("1 month(s) of Reborn Club (31 days) costs 20 Credits. You have: 300 Credits.") &&
      (await dialog.locator('img[src="/web-gallery/album1/piccolo_happy.gif"]').evaluate((image) => image.complete && image.naturalWidth === 32)),
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await dialog.waitFor({ state: "hidden" });
  check("Cancel buys nothing", periods().length === 0 && credits() === 300);

  await page.getByRole("button", { name: "Buy 1 month" }).click();
  await dialog.getByRole("button", { name: "Buy" }).click();
  await dialog.getByText("Subscribe", { exact: true }).waitFor();
  await shot(page, "club-subscribed");
  check(
    "Buy answers as Holo, and the box shows the new days",
    (await dialog.innerText()).includes("Congratulations! You have successfully subscribed to Reborn Club for 1 month(s).") &&
      (await membership.innerText()) === "You are a member of Reborn Club" &&
      (await page.locator("main").getByText("You have 31 Club Day(s) left").isVisible()),
    await dialog.innerText(),
  );
  const ledger = sql(`SELECT credits, reason, detail, (SELECT name FROM avatars WHERE id = avatar_id) FROM wallet_transactions WHERE user_id = ${frank}`);
  check(
    "a month takes 20 credits with Holo's ledger row, and gives HC1 to both habbos, the buyer wearing it",
    credits() === 280 &&
      JSON.stringify(ledger) === JSON.stringify([[-20, "club", "Club subscription (1 month(s))", "Frank"]]) &&
      JSON.stringify(badges()) ===
        JSON.stringify({ "Frank ADM": false, "Frank HC1": true, "FrankToo HC1": false, "FrankToo NWB": true }),
    JSON.stringify({ credits: credits(), ledger, badges: badges() }),
  );
  await dialog.getByRole("button", { name: "Done" }).click();
  await dialog.waitFor({ state: "hidden" });

  await page.getByRole("button", { name: "Buy 3 months" }).click();
  check(
    "the next question counts the purse after the purchase",
    (await dialog.innerText()).includes("3 month(s) of Reborn Club (93 days) costs 50 Credits. You have: 280 Credits."),
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Buy" }).click();
  await dialog.getByText("Subscribe", { exact: true }).waitFor();
  const [first, second] = periods();
  check(
    "three months bought during the club start at the end of the first",
    (await dialog.innerText()).includes("for 3 month(s).") &&
      (await page.locator("main").getByText("You have 124 Club Day(s) left").isVisible()) &&
      second?.[0] === first?.[1] &&
      credits() === 230,
    JSON.stringify(periods()),
  );
  await dialog.getByRole("button", { name: "Done" }).click();
  await page.goto(base + "/me");
  check(
    "the Me page counts the days to the end of the last period",
    (await page.getByRole("link", { name: "124" }).getAttribute("href")) === "/club",
  );

  await page.goto(base + "/club");
  await page.getByRole("button", { name: "Buy 6 months" }).click();
  await dialog.getByRole("button", { name: "Buy" }).click();
  await dialog.getByText("Subscribe", { exact: true }).waitFor();
  await shot(page, "club-limit");
  check(
    "six more months pass Holo's limit of six, and nothing is bought",
    (await dialog.innerText()).includes(
      "You can only subscribe for a maximum of 6 months. If this subscription was completed, you would have exceeded the limit.",
    ) &&
      periods().length === 2 &&
      credits() === 230,
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Close" }).click();
  await dialog.waitFor({ state: "hidden" });

  sql(`UPDATE wallets SET credits = 30 WHERE user_id = ${frank}`);
  await page.goto(base + "/club");
  await page.getByRole("button", { name: "Buy 3 months" }).click();
  check(
    "the question shows the purse",
    (await dialog.innerText()).includes("You have: 30 Credits."),
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Buy" }).click();
  await dialog.getByText("Subscribe", { exact: true }).waitFor();
  check(
    "a purse short of the price is refused with Holo's words",
    (await dialog.innerText()).includes("You don't have enough credits to complete the subscription purchase.") &&
      periods().length === 2 &&
      credits() === 30,
    await dialog.innerText(),
  );
  await dialog.getByRole("button", { name: "Done" }).click();

  sql(`UPDATE wallets SET credits = 10 WHERE user_id = ${frank}`);
  await page.goto(base + "/club");
  const getCredits = page.getByRole("link", { name: "Get some credits" });
  await getCredits.waitFor();
  await shot(page, "club-credits-notice");
  check(
    "below a month's price, Holo's notice leads to the credits page instead of the buttons",
    (await page.getByText("To join Reborn Club you first need to buy some Credits; Reborn Club membership starts from 20 credits").isVisible()) &&
      (await getCredits.getAttribute("href")) === "/credits" &&
      (await page.getByRole("button", { name: "Buy 1 month" }).count()) === 0,
  );

  sql(`UPDATE club_subscriptions SET starts_at = '2026-01-01 00:00:00+00:00', ends_at = '2026-02-01 00:00:00+00:00' WHERE user_id = ${frank}`);
  await page.goto(base + "/club");
  await membership.waitFor();
  check(
    "once the club ends, Frank is not a member and HC1 leaves both habbos, which keep their other badges",
    (await membership.innerText()) === "You are not a member of Reborn Club" &&
      JSON.stringify(badges()) === JSON.stringify({ "Frank ADM": false, "FrankToo NWB": true }),
    JSON.stringify(badges()),
  );

  check("no page failed", problems.length === 0, problems.join(", "));
  await context.close();
}
