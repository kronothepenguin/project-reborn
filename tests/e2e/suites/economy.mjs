import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// seedStaff writes its habbos row by row, so Frank's home gets here the profile
// widget that creating a habbo places.
export const prepare = ({ sql }) => {
  seedStaff(sql);
  const now = "2026-11-01 12:00:00.000000000+00:00";
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_by_avatar_id, created_at, updated_at)
    SELECT homes.id, 'widget', 'profile', 'defaultskin', 25, 25, 5, avatars.id, '${now}', '${now}'
    FROM homes JOIN profiles ON profiles.id = homes.profile_id JOIN avatars ON avatars.id = profiles.avatar_id
    WHERE avatars.name = 'Frank'`);
};

// P6 from end to end: Admin-1 makes a voucher in housekeeping, Frank redeems it on
// the credits page and buys a month of the club, which shows wherever the site
// counts it and opens the club's skins, the wide playground and the wardrobe
// until it ends.
export default async function (t) {
  const { base, check, hk, shot, sql } = t;
  const [[frank]] = sql(
    "SELECT id FROM users WHERE email = 'frank@example.com'",
  );
  const [[frankHabbo]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  const credits = () =>
    sql(`SELECT credits FROM wallets WHERE user_id = ${frank}`)[0][0];
  const ledger = () =>
    sql(`SELECT credits, reason, detail, avatar_id FROM wallet_transactions
      WHERE user_id = ${frank} ORDER BY id`);
  const badges = () =>
    sql(`SELECT avatars.name, avatar_badges.code, avatar_badges.worn FROM avatar_badges
      JOIN avatars ON avatars.id = avatar_badges.avatar_id WHERE avatars.user_id = ${frank}
      ORDER BY avatars.name, avatar_badges.code`)
      .map(([name, code, worn]) => `${name} ${code}${worn ? " worn" : ""}`)
      .join(", ");

  const staff = await session(t, "Admin-1");
  await staff.page.goto(`${hk}/vouchers`);
  const code = await staff.page.inputValue("#voucher-code");
  await staff.page.fill("#voucher-credits", "50");
  await staff.page.getByRole("button", { name: "Create Voucher" }).click();
  await staff.page.waitForURL(/created=1/);
  check(
    "housekeeping makes a voucher of 50 credits",
    (await staff.page.getByRole("status").innerText()) ===
      "The voucher has been created successfully." &&
      JSON.stringify(
        sql(`SELECT credits, redeemed_at FROM vouchers WHERE code = '${code}'`),
      ) === JSON.stringify([[50, null]]),
    code,
  );

  const { context, page, problems } = await session(t, "Frank");
  const purse = page.locator("main form");
  // The purse hides its field once it answers, as Holo's did.
  const redeem = async () => {
    await page.goto(`${base}/credits`);
    await purse.getByLabel("Enter redemption code:").fill(code);
    await purse.getByRole("button", { name: "Submit" }).click();
  };
  await redeem();
  await purse.getByText("You have redeemed 50 credits successfully.").waitFor();
  const [[redeemedBy, redeemedAt]] = sql(
    `SELECT redeemed_by_avatar_id, redeemed_at FROM vouchers WHERE code = '${code}'`,
  );
  check(
    "Frank redeems it on /credits: the voucher is redeemed, and the purse and the ledger gain its 50 credits",
    (await purse.innerText()).includes("50 Credits") &&
      credits() === 50 &&
      JSON.stringify(ledger()) ===
        JSON.stringify([
          [50, "voucher", "Credit voucher redeem", frankHabbo],
        ]) &&
      redeemedBy === frankHabbo &&
      redeemedAt !== null,
    JSON.stringify({ credits: credits(), ledger: ledger(), redeemedBy }),
  );
  await redeem();
  await purse
    .getByText("Your redeem code could not be found. Please try again.")
    .waitFor();
  check(
    "a second redemption gives nothing",
    credits() === 50 && ledger().length === 1,
    JSON.stringify({ credits: credits(), ledger: ledger() }),
  );

  // What the club opens, read the same way before, during and after it.
  const perks = async () => {
    await page.goto(`${base}/home/Frank`);
    const playground = await page
      .locator("#playground")
      .evaluate((element) => element.offsetWidth);
    const banner = await page
      .locator('img[alt="hc habbohome banner holo"]')
      .count();
    await page.goto(`${base}/home/Frank/edit`);
    await page
      .locator(".profile-widget")
      .getByRole("button", { name: "Edit", exact: true })
      .click();
    await page.getByRole("dialog", { name: "Edit" }).waitFor();
    const skins = await page
      .locator('select[aria-label="Skin"] option')
      .allInnerTexts();
    await page.goto(`${base}/account/looks`);
    // The wardrobe draws its slots in the browser, from a list the page holds
    // for club members only.
    if ((await page.locator("#wardrobe-outfits").count()) > 0) {
      await page.locator("#wardrobe-slots > li").first().waitFor();
    }
    const wardrobe = await page.locator("#wardrobe-slots > li").count();
    const join = await page.getByText("Join Reborn Club").count();
    await page.goto(`${base}/account/profile`);
    const profile = await page.locator("main").innerText();
    await page.goto(`${base}/me`);
    const days = await page
      .locator('a[href="/club"]')
      .filter({ hasText: /^\d+$/ })
      .allInnerTexts();
    return {
      playground,
      banner,
      clubSkins: skins.filter((skin) => skin.startsWith("HC ")),
      wardrobe,
      join,
      membership: profile.includes("Club Membership")
        ? profile.slice(profile.indexOf("You are a"))
        : "",
      days,
    };
  };

  const before = await perks();
  check(
    "outside the club, Frank's home is narrow with the club banner, the editor offers no club skin, and the looks have no wardrobe",
    before.playground === 752 &&
      before.banner === 1 &&
      before.clubSkins.length === 0 &&
      before.wardrobe === 0 &&
      before.join === 1 &&
      before.membership === "" &&
      before.days.length === 0,
    JSON.stringify(before),
  );

  await page.goto(`${base}/club`);
  const dialog = page.getByRole("dialog", { name: "REBORN CLUB" });
  await page.getByRole("button", { name: "Buy 1 month" }).click();
  await dialog.getByRole("button", { name: "Buy" }).click();
  await dialog.getByText("Subscribe", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Done" }).click();
  await dialog.waitFor({ state: "hidden" });
  check(
    "Frank buys a month on /club, which shows the membership and its days",
    (await page
      .locator("main")
      .getByText("a member of Reborn Club")
      .innerText()) === "You are a member of Reborn Club" &&
      (await page
        .locator("main")
        .getByText("You have 31 Club Day(s) left")
        .isVisible()) &&
      credits() === 30 &&
      badges() === "Frank HC1 worn, FrankStaff HC1",
    JSON.stringify({ credits: credits(), badges: badges() }),
  );
  await page.goto(`${base}/credits/transactions`);
  const rows = [];
  for (const row of await page.locator("main table tbody tr").all()) {
    rows.push((await row.locator("td").allInnerTexts()).slice(1));
  }
  check(
    "/credits/transactions lists the purchase above the voucher, both by Frank",
    JSON.stringify(rows) ===
      JSON.stringify([
        ["-20", "Club subscription (1 month(s))", "Frank"],
        ["50", "Credit voucher redeem", "Frank"],
      ]),
    JSON.stringify(rows),
  );

  const during = await perks();
  await shot(page, "economy-club");
  check(
    "in the club, the Me page and the account pages count 31 days",
    JSON.stringify(during.days) === JSON.stringify(["31"]) &&
      during.membership.startsWith(
        "You are a Reborn Club member. Your membership will expire in 31 days.",
      ) &&
      during.join === 0,
    JSON.stringify(during),
  );
  check(
    "in the club, the home editor offers the club skins, the playground is 922 pixels wide and the looks show the wardrobe",
    JSON.stringify(during.clubSkins) ===
      JSON.stringify(["HC Bling", "HC Scifi"]) &&
      during.playground === 922 &&
      during.banner === 0 &&
      during.wardrobe === 5,
    JSON.stringify(during),
  );

  sql(`UPDATE club_subscriptions SET starts_at = '2026-01-01 00:00:00+00:00',
    ends_at = '2026-02-01 00:00:00+00:00' WHERE user_id = ${frank}`);
  await page.goto(`${base}/club`);
  check(
    "once the club ends, /club says so and HC1 leaves both habbos",
    (await page
      .locator("main")
      .getByText("a member of Reborn Club")
      .innerText()) === "You are not a member of Reborn Club" &&
      badges() === "",
    badges(),
  );
  const after = await perks();
  check(
    "once the club ends, its days, skins, wide playground and wardrobe go",
    JSON.stringify(after) === JSON.stringify(before),
    JSON.stringify(after),
  );

  check(
    "no page failed",
    problems.length === 0 && staff.problems.length === 0,
    [...problems, ...staff.problems].join(", "),
  );
  await context.close();
  await staff.context.close();
}
