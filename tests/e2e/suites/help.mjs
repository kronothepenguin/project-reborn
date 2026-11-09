import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// The hotel takes questions of up to 20 characters, which the CMS reads as it
// starts.
export const prepare = ({ sql }) => {
  seedStaff(sql);
  sql(`INSERT INTO settings (key, value, updated_at)
    VALUES ('help.messageMaxLength', '20', '2026-11-01 12:00:00.000000000+00:00')`);
};

// Holo's help tool: a visitor is sent to sign in; Frank opens it from the
// header's Help in the Help Tool's own window, is refused a blank form and a
// question too long, sends a request, which waits in housekeeping's Help
// Queries, is refused another until Admin-1 picks it up, and asks again.
export default async function (t) {
  const { base, check, hk, shot, sql } = t;
  // Help, Proceed and Close need their islands awake before a click.
  const awake = (p) =>
    p.waitForFunction(() => !document.querySelector("astro-island[ssr]"));

  const guest = await session(t);
  await guest.page.goto(`${base}/help`);
  check(
    "a visitor is sent to sign in",
    new URL(guest.page.url()).pathname === "/",
    guest.page.url(),
  );
  await guest.context.close();

  const { context, page, problems } = await session(t, "Frank");
  await awake(page);
  const link = page.getByRole("link", { name: "Help", exact: true });
  check(
    "the header's Help leads to /help in the Help Tool's window",
    (await link.getAttribute("href")) === "/help" &&
      (await link.getAttribute("target")) === "habbohelp",
  );
  const [help] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  help.on("pageerror", (e) => problems.push(e.message));
  help.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  await help.waitForLoadState();
  await awake(help);
  const text = () => help.locator("body").innerText();
  const subject = help.getByLabel("Subject:");
  const question = help.getByLabel("Your question/problem:");
  const proceed = help.getByRole("button", { name: "Proceed" });
  const close = help.getByRole("button", { name: "Close" });
  check(
    "it opens go.php's form in its own window",
    (await help.evaluate(() => window.name)) === "habbohelp" &&
      !(await help.evaluate(() => window.toolbar.visible)) &&
      new URL(help.url()).pathname === "/help" &&
      (await help.title()) === "Reborn Help Tool" &&
      (await text()).includes("ASK YOUR QUESTION") &&
      (await text()).includes(
        "You can contact Player Support through this form. They will get back to you as soon as possible. If it's urgent, you may also use the Call For Help system ingame.",
      ) &&
      (await subject.getAttribute("maxlength")) === "50" &&
      (await question.isVisible()) &&
      (await proceed.isVisible()) &&
      (await close.count()) === 0,
    await text(),
  );
  await shot(help, "help-form");

  const send = async (subjectText, questionText) => {
    await subject.fill(subjectText);
    await question.fill(questionText);
    await Promise.all([help.waitForEvent("load"), proceed.click()]);
    await awake(help);
  };
  await send("Lost my sofa", "   ");
  check(
    "a blank field answers Holo's message, with the form again, empty",
    (await text()).includes("Please do not leave any fields blank") &&
      (await subject.inputValue()) === "" &&
      (await proceed.isVisible()),
    await text(),
  );
  await send("Lost my sofa", "x".repeat(21));
  check(
    "a question past help.messageMaxLength is refused, with the form again",
    (await text()).includes(
      "Your question may not be longer than 20 characters.",
    ) &&
      (await proceed.isVisible()) &&
      sql("SELECT COUNT(*) FROM help_tickets")[0][0] === 0,
    await text(),
  );

  await send("Lost my sofa", "Where did it go?");
  check(
    "Proceed sends the request, and only Close is left",
    (await text()).includes(
      "Ticket submitted. We will get back to you shortly, please be patient as this might take a while. Note that you cannot send any more support requests until this support ticket is picked up.",
    ) &&
      (await proceed.count()) === 0 &&
      (await close.isVisible()),
    await text(),
  );
  await shot(help, "help-sent");
  const [[frank]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  const tickets = sql(
    "SELECT avatar_id, forum_post_id, subject, message, picked_up_at FROM help_tickets",
  );
  check(
    "the ticket is Frank's, with his subject and question, waiting",
    JSON.stringify(tickets) ===
      JSON.stringify([[frank, null, "Lost my sofa", "Where did it go?", null]]),
    JSON.stringify(tickets),
  );
  await Promise.all([help.waitForEvent("close"), close.click()]);
  check("Close shuts the window", help.isClosed());

  const [again] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  again.on("pageerror", (e) => problems.push(e.message));
  await again.waitForLoadState();
  await awake(again);
  check(
    "the form shows while the request waits, as go.php's did",
    await again.getByRole("button", { name: "Proceed" }).isVisible(),
  );
  await again.getByLabel("Subject:").fill("Still lost");
  await again.getByLabel("Your question/problem:").fill("Anyone?");
  await Promise.all([
    again.waitForEvent("load"),
    again.getByRole("button", { name: "Proceed" }).click(),
  ]);
  check(
    "but sending answers Holo's refusal, and writes nothing",
    (await again.locator("body").innerText()).includes(
      "Unable to submit support request: you still have a pending support request. Please try again later.",
    ) &&
      (await again.getByRole("button", { name: "Proceed" }).count()) === 0 &&
      sql("SELECT COUNT(*) FROM help_tickets")[0][0] === 1,
    await again.locator("body").innerText(),
  );
  await shot(again, "help-waiting");

  const staff = await session(t, "Admin-1");
  await staff.page.goto(`${hk}/help`);
  const row = staff.page.locator("main table tbody tr", {
    hasText: "Lost my sofa",
  });
  check(
    "housekeeping's Help Queries lists the request with Frank's name",
    (await row.count()) === 1 && (await row.innerText()).includes("Frank"),
    await staff.page.locator("main").innerText(),
  );
  await row.getByRole("button", { name: "Pick up" }).click();
  await staff.page.waitForLoadState();
  check(
    "Admin-1 picks it up",
    sql("SELECT picked_up_at IS NOT NULL FROM help_tickets")[0][0] === 1,
  );

  await again.goto(`${base}/help`);
  await awake(again);
  await again.getByLabel("Subject:").fill("Thanks");
  await again.getByLabel("Your question/problem:").fill("Found it.");
  await Promise.all([
    again.waitForEvent("load"),
    again.getByRole("button", { name: "Proceed" }).click(),
  ]);
  check(
    "once it is picked up, Frank asks again",
    (await again.locator("body").innerText()).includes("Ticket submitted.") &&
      sql("SELECT COUNT(*) FROM help_tickets")[0][0] === 2,
    await again.locator("body").innerText(),
  );

  check(
    "no page failed",
    problems.length === 0 && staff.problems.length === 0,
    [...problems, ...staff.problems].join(", "),
  );
  await staff.context.close();
  await context.close();
}
