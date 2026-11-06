// The discussion board, as a guest and as Frank reads it: Admin-1's two stickies,
// one closed, eleven threads of Frank's, and Dora's long thread, whose habbo is
// archived, with a post Frank edited.
export const programs = ["cms"];

const at = (minute) => {
  const d = new Date(Date.UTC(2026, 10, 1, 12, 0, 0) + minute * 60_000);
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, ".000000000+00:00");
};

export const prepare = ({ sql }) => {
  const [[hash]] = sql("SELECT password_hash FROM credentials LIMIT 1");
  for (const [email, name] of [["frank@example.com", "Frank"], ["dora@example.com", "Dora"]]) {
    sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
      VALUES ('${email}', '1990-05-01', '127.0.0.1', '${at(0)}', '${at(0)}')`);
    const [[user]] = sql(`SELECT id FROM users WHERE email = '${email}'`);
    sql(`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${user}, '${hash}', '${at(0)}')`);
    sql(`INSERT INTO wallets (user_id, updated_at) VALUES (${user}, '${at(0)}')`);
    sql(`INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
      VALUES (${user}, '${name}', 'hd-180-1', 'M', 'Here to <talk>', '${at(0)}', '${at(0)}')`);
    const [[habbo]] = sql(`SELECT id FROM avatars WHERE name = '${name}'`);
    sql(`INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${habbo}, '${at(0)}', '${at(0)}')`);
    const [[profile]] = sql(`SELECT id FROM profiles WHERE avatar_id = ${habbo}`);
    sql(`INSERT INTO homes (profile_id, updated_at) VALUES (${profile}, '${at(0)}')`);
  }
  const avatar = (name) => sql(`SELECT id FROM avatars WHERE name = '${name}'`)[0][0];
  const [admin, frank, dora] = ["Admin-1", "Frank", "Dora"].map(avatar);
  sql(`INSERT INTO avatar_badges (avatar_id, code, worn, granted_at) VALUES (${frank}, 'ADM', TRUE, '${at(0)}')`);
  sql(`INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
    VALUES (${frank}, 'Talkers', '', 'b0503Xs01124', 'open', '${at(0)}', '${at(0)}')`);
  const [[talkers]] = sql("SELECT id FROM groups WHERE name = 'Talkers'");
  sql(`INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at)
    VALUES (${talkers}, ${frank}, 'admin', TRUE, '${at(0)}', '${at(0)}')`);

  const thread = (title, opener, minute, sticky, locked) => {
    sql(`INSERT INTO forum_threads (avatar_id, title, sticky, locked, created_at)
      VALUES (${opener}, '${title}', ${sticky}, ${locked}, '${at(minute)}')`);
    return sql(`SELECT id FROM forum_threads WHERE title = '${title}'`)[0][0];
  };
  const post = (threadID, author, minute, body) =>
    sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at)
      VALUES (${threadID}, ${author}, '${body}', '${at(minute)}')`);
  post(thread("Board rules", admin, 1, "TRUE", "TRUE"), admin, 1, "Be [b]nice[/b].");
  post(thread("Welcome", admin, 2, "TRUE", "FALSE"), admin, 2, "Hello all");
  for (let i = 0; i < 11; i++) {
    const title = `Topic ${String(i).padStart(2, "0")}`;
    post(thread(title, frank, 10 + i, "FALSE", "FALSE"), frank, 10 + i, `About ${title}`);
  }
  const long = thread("Long chat", dora, 100, "FALSE", "FALSE");
  for (let i = 0; i < 12; i++) post(long, i % 2 ? frank : dora, 100 + i, `Message ${i + 1}`);
  const [[second]] = sql(`SELECT id FROM forum_posts WHERE body = 'Message 2'`);
  sql(`UPDATE forum_posts SET body = 'Message 2, edited', edited_at = '${at(200)}', edited_by_avatar_id = ${frank} WHERE id = ${second}`);
  sql(`UPDATE avatars SET archived_at = '${at(300)}' WHERE id = ${dora}`);
};

export default async function ({ base, browser, check, shot, sql }) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.status() !== 422) problems.push(`${r.status()} ${r.url()}`);
  });
  const [[long]] = sql("SELECT id FROM forum_threads WHERE title = 'Long chat'");
  const [[rules]] = sql("SELECT id FROM forum_threads WHERE title = 'Board rules'");

  await page.goto(base + "/forum");
  await shot(page, "forum-board");
  check(
    "the board has Holo's title, sub-tab, box and columns",
    (await page.title()).endsWith("~ Discussion Board") &&
      (await page.locator("nav li.font-bold").innerText()) === "Discussion Board" &&
      (await page.getByRole("heading", { name: "Discussion Board" }).isVisible()) &&
      JSON.stringify(await page.locator("#group-topiclist-list tr").first().locator("td").allInnerTexts()) ===
        JSON.stringify(["Topic", "Last post", "Replies", "Views"]),
  );
  const topics = () => page.locator("#group-topiclist-list tr td:first-child > div > a:first-child").allInnerTexts();
  const first = await topics();
  check(
    "page 1 lists both stickies, then ten threads by their newest post",
    JSON.stringify(first) ===
      JSON.stringify(["Welcome", "Board rules", "Long chat", "Topic 10", "Topic 09", "Topic 08", "Topic 07", "Topic 06", "Topic 05", "Topic 04", "Topic 03", "Topic 02"]),
    JSON.stringify(first),
  );
  check(
    "a guest gets Holo's line and no New Thread",
    (await page.getByText("You must be logged in to reply or post new threads.").isVisible()) &&
      (await page.getByRole("button", { name: "New Thread" }).count()) === 0,
  );
  const row = page.locator("#group-topiclist-list tr", { hasText: "Long chat" });
  const rowText = await row.innerText();
  check(
    "a thread's row has its pages, an archived opener without a link, its last post, replies and views",
    rowText.includes("(page 1 2 )") &&
      rowText.includes("archived") &&
      (await row.getByRole("link", { name: "archived" }).count()) === 0 &&
      (await row.locator("td").nth(2).innerText()) === "11" &&
      (await row.getByRole("link", { name: "Frank" }).getAttribute("href")) === "/home?name=Frank",
    rowText,
  );
  check(
    "the closed sticky carries Holo's sticky icon and closed mark",
    (await page.locator("#group-topiclist-list tr", { hasText: "Board rules" }).getByRole("img", { name: "Closed Thread" }).isVisible()),
  );
  await page.getByRole("navigation", { name: "Pages" }).first().getByRole("link", { name: "2" }).click();
  await page.waitForURL("**/forum?page=2");
  check(
    "page 2 heads with the stickies again, then the last thread",
    JSON.stringify(await topics()) === JSON.stringify(["Welcome", "Board rules", "Topic 01", "Topic 00"]),
    JSON.stringify(await topics()),
  );

  await page.goto(base + "/forum");
  await Promise.all([page.waitForURL(`**/forum/threads/${long}?page=2#page-bottom`), row.locator("td").nth(1).getByRole("link").first().click()]);
  check(
    "the last post's date jumps to the thread's last page",
    JSON.stringify(await page.locator("#group-postlist-list td:last-child > span:first-child").allInnerTexts()) ===
      JSON.stringify(["RE: Long chat", "RE: Long chat"]),
  );
  await page.goto(`${base}/forum/threads/${long}`);
  await shot(page, "forum-thread");
  const boxes = page.locator("#group-postlist-list tr");
  const headers = await page.locator("#group-postlist-list td:last-child > span:first-child").allInnerTexts();
  check(
    "a thread's first page holds ten posts, RE: on all but the first",
    boxes && headers.length === 10 && headers[0] === "Long chat" && headers.slice(1).every((h) => h === "RE: Long chat"),
    JSON.stringify(headers),
  );
  const frankBox = boxes.nth(1).locator("td").first();
  check(
    "Frank's box has his name, the offline picture, messages, avatar, favourite group, worn badge and motto",
    (await frankBox.getByRole("link", { name: "Frank" }).getAttribute("href")) === "/home?name=Frank" &&
      (await frankBox.getByRole("img", { name: "Offline" }).isVisible()) &&
      (await frankBox.innerText()).includes("Messages: 17") &&
      (await frankBox.getByRole("img", { name: "Frank" }).isVisible()) &&
      (await frankBox.locator('a[href^="/groups/"] img[src="/habbo-imaging/badge/b0503Xs01124"]').count()) === 1 &&
      (await frankBox.locator('img[src="/c_images/album1584/ADM.gif"]').count()) === 1 &&
      (await frankBox.innerText()).includes("Here to <talk>"),
    await frankBox.innerText(),
  );
  const doraBox = boxes.nth(0).locator("td").first();
  check(
    "the archived habbo's box shows archived, with no link and none of its avatar, messages or motto",
    (await doraBox.innerText()).trim() === "archived" &&
      (await doraBox.getByRole("link").count()) === 0 &&
      (await doraBox.locator('img:not([alt="Offline"])').count()) === 0,
    await doraBox.innerText(),
  );
  check("a guest gets no report flags", (await page.locator(".create-report-button").count()) === 0);
  check(
    "an edited post says who modified it, and when",
    (await boxes.nth(1).innerText()).includes("Last modified 01-11-2026 15:20:00 by Frank") &&
      (await boxes.nth(1).innerText()).includes("Message 2, edited"),
    await boxes.nth(1).innerText(),
  );
  const [[views]] = sql(`SELECT views FROM forum_threads WHERE id = ${long}`);
  await page.reload();
  const [[again]] = sql(`SELECT views FROM forum_threads WHERE id = ${long}`);
  check("every load of the thread counts a view", views === 2 && again === 3, `${views} ${again}`);
  await page.goto(`${base}/forum/threads/${rules}`);
  check(
    "a guest reads a closed thread with Holo's line and no closed mark",
    (await page.getByText("Closed Thread", { exact: true }).count()) === 0 &&
      (await page.getByText("You must be logged in to reply or post new threads.").isVisible()),
  );
  check("no guest page failed", problems.length === 0, problems.join(" | "));

  await page.goto(base + "/");
  await page.fill("#username", "Frank");
  await page.fill("#password", "secret123");
  await Promise.all([page.waitForURL("**/me"), page.click('button:has-text("Sign in")')]);
  await page.goto(base + "/forum");
  check(
    "a signed-in habbo gets the two New Thread buttons, and no guest line",
    (await page.getByRole("button", { name: "New Thread" }).count()) === 2 &&
      (await page.getByText("You must be logged in to reply or post new threads.").count()) === 0,
  );
  await page.goto(`${base}/forum/threads/${rules}`);
  check("a closed thread says so to a signed-in habbo", (await page.getByText("Closed Thread", { exact: true }).count()) === 2);
  await page.goto(`${base}/forum/threads/${long}`);
  check(
    "an open thread has no closed mark and no guest line",
    (await page.getByText("Closed Thread", { exact: true }).count()) === 0 &&
      (await page.getByText("You must be logged in to reply or post new threads.").count()) === 0,
  );

  await posting({ base, page, check, shot, sql, long });
  await editing({ base, browser, page, check, shot, sql, long });
  await moderating({ base, browser, page, check, shot, sql });
  await reporting({ base, page, check, shot, sql, long, problems });

  sql(`INSERT INTO settings (key, value, updated_at) VALUES ('features.forum', 'false', '${at(400)}')`);
  let away = false;
  for (let i = 0; i < 20 && !away; i++) {
    await page.waitForTimeout(250);
    await page.goto(base + "/forum");
    away = !page.url().includes("/forum");
  }
  check("with the forum off, the board sends visitors away, as Holo did", away, page.url());
  check("no page failed", problems.length === 0, problems.join(" | "));
  await context.close();
}

// Frank writes: a thread through Holo's form and its preview, refused while it
// looks empty or long, then replies, quotes, and meets the spam check, a blank post
// and a thread closed under him.
async function posting({ base, page, check, shot, sql, long }) {
  await page.goto(base + "/forum");
  await page.locator("#newtopic-upper").click();
  const form = page.getByRole("table", { name: "New Thread" });
  const title = form.getByLabel("Topic:");
  await title.waitFor();
  check(
    "New Thread swaps the list of threads for Holo's form, its title ready",
    (await page.locator("#group-topiclist-list").isHidden()) && (await title.evaluate((el) => el === document.activeElement)),
  );
  await form.getByRole("button", { name: "Save" }).click();
  check("an empty title is refused in the browser with Holo's words", await form.getByRole("alert").getByText("Topic title may not be empty").isVisible());
  await title.fill("x".repeat(31));
  const editor = form.getByRole("textbox", { name: "Post", exact: true });
  await editor.click();
  await page.keyboard.type("Hello board");
  await form.getByRole("button", { name: "Save" }).click();
  await form.getByRole("alert").getByText("Topic title may not be longer than 30 characters").waitFor();
  check("a title over 30 characters is refused, where Holo cut it", true);

  await title.fill("Frank's first");
  await form.getByRole("button", { name: "Preview »" }).click();
  const preview = page.getByRole("table", { name: "Preview" });
  await preview.waitFor();
  await shot(page, "forum-new-thread-preview");
  check(
    "Preview shows the post in Frank's own box, under its title",
    (await preview.innerText()).includes("Frank's first") &&
      (await preview.innerText()).includes("Messages: 17") &&
      (await preview.innerText()).includes("Hello board") &&
      (await preview.getByRole("img", { name: "Offline" }).isVisible()),
    await preview.innerText(),
  );
  await preview.getByRole("button", { name: "« Modify" }).click();
  check("« Modify goes back to the form, as typed", (await title.inputValue()) === "Frank's first");
  await Promise.all([page.waitForURL("**/forum/threads/*"), form.getByRole("button", { name: "Save" }).click()]);
  const [[mine, body]] = sql("SELECT forum_threads.id, forum_posts.body FROM forum_threads JOIN forum_posts ON forum_posts.forum_thread_id = forum_threads.id WHERE title = 'Frank''s first'");
  check(
    "Save opens the new thread with its first post",
    page.url().endsWith(`/forum/threads/${mine}`) && body === "Hello board" && (await page.getByText("Hello board").isVisible()),
    `${page.url()} ${body}`,
  );

  const reply = page.getByRole("table", { name: "Reply" });
  await page.locator("#create-post-message").click();
  check("Post reply opens the form under the posts and hides itself", (await reply.isVisible()) && (await page.locator("#create-post-message").isHidden()));
  await reply.getByRole("button", { name: "Save" }).click();
  await reply.getByRole("alert").getByText("Post may not be blank").waitFor();
  check("a blank reply is refused", true);
  await reply.getByRole("textbox", { name: "Message", exact: true }).click();
  await page.keyboard.type("Me again");
  await reply.getByRole("button", { name: "Save" }).click();
  await reply.getByRole("alert").getByText("Spam detected!").waitFor();
  check("a reply within 30 seconds of the last post is Holo's spam", true);

  sql(`INSERT INTO settings (key, value, updated_at) VALUES ('forum.spamSeconds', '0', '2026-11-01 19:00:00.000000000+00:00')`);
  const posts = () => sql(`SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = ${mine}`)[0][0];
  for (let i = 0; i < 20 && posts() < 2; i++) {
    await page.waitForTimeout(250);
    const save = reply.getByRole("button", { name: "Save" });
    if (await save.isVisible().catch(() => false)) await save.click();
    await page.waitForTimeout(250);
  }
  await page.waitForLoadState("load");
  await page.locator("#group-postlist-list").getByText("Me again").waitFor();
  check("with the check off, the reply goes on the thread", posts() === 2 && page.url().includes("page=1#page-bottom"), page.url());

  await page.goto(`${base}/forum/threads/${long}?page=2`);
  await page.locator(".quote-post-link").last().click();
  await reply.waitFor();
  await Promise.all([page.waitForURL(`**/forum/threads/${long}?page=2#page-bottom`), reply.getByRole("button", { name: "Save" }).click()]);
  await page.waitForLoadState("load");
  const [[quoted]] = sql(`SELECT body FROM forum_posts WHERE forum_thread_id = ${long} ORDER BY id DESC LIMIT 1`);
  check("Quote opens the form with the post quoted, and the reply goes to the last page", quoted === "[quote]Message 12[/quote]", quoted);
  await shot(page, "forum-quoted");

  await page.goto(`${base}/forum/threads/${mine}`);
  await page.locator("#create-post-message").click();
  await reply.getByRole("textbox", { name: "Message", exact: true }).click();
  await page.keyboard.type("Too late");
  sql(`UPDATE forum_threads SET locked = TRUE WHERE id = ${mine}`);
  await Promise.all([page.waitForEvent("load"), reply.getByRole("button", { name: "Save" }).click()]);
  check(
    "a reply to a thread closed meanwhile shows it closed, and adds nothing",
    (await page.getByText("Closed Thread", { exact: true }).count()) === 2 && sql(`SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = ${mine}`)[0][0] === 2,
  );
}

// Frank modifies and deletes his own posts, on his thread closed in posting, and
// Admin-1, who holds forum.edit, deletes its last post, which takes the thread.
async function editing({ base, browser, page, check, shot, sql, long }) {
  await page.goto(`${base}/forum/threads/${long}`);
  check(
    "Frank gets Modify and the delete button on his own posts only",
    (await page.locator(".edit-post-link").count()) === 5 && (await page.locator(".delete-post").count()) === 5,
  );
  const [[mine]] = sql("SELECT id FROM forum_threads WHERE title = 'Frank''s first'");
  await page.goto(`${base}/forum/threads/${mine}`);
  await page.locator(".edit-post-link").first().click();
  const reply = page.getByRole("table", { name: "Reply" });
  const editor = reply.getByRole("textbox", { name: "Message", exact: true });
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Hello board, corrected");
  await Promise.all([page.waitForEvent("load"), reply.getByRole("button", { name: "Save" }).click()]);
  const first = page.locator("#group-postlist-list tr").first();
  check(
    "Modify saves the post, even on a closed thread, with Holo's line",
    (await first.innerText()).includes("Hello board, corrected") && /Last modified \d\d-\d\d-\d{4} \d\d:\d\d:\d\d by Frank/.test(await first.innerText()),
    await first.innerText(),
  );

  await page.locator(".delete-post").last().click();
  const dialog = page.getByRole("dialog", { name: "Delete Post" });
  check("the delete button asks first, in Holo's words", await dialog.getByText("Are you sure you want to delete this post? This cannot be reverted.").isVisible());
  await shot(page, "forum-delete-post");
  await Promise.all([page.waitForEvent("load"), dialog.getByRole("button", { name: "Proceed" }).click()]);
  check(
    "Proceed deletes the post and comes back to the thread",
    page.url().includes(`/forum/threads/${mine}`) && sql(`SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = ${mine}`)[0][0] === 1,
    page.url(),
  );

  const admin = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const moderator = await admin.newPage();
  await moderator.goto(base + "/");
  await moderator.fill("#username", "Admin-1");
  await moderator.fill("#password", "secret123");
  await Promise.all([moderator.waitForURL("**/me"), moderator.click('button:has-text("Sign in")')]);
  await moderator.goto(`${base}/forum/threads/${mine}`);
  check("a holder of forum.edit gets Modify on Frank's post", (await moderator.locator(".edit-post-link").count()) === 1);
  check("and the report flag under the delete button", (await moderator.locator(".delete-post + div .create-report-button").count()) === 1);
  await shot(moderator, "forum-report-flag-moderator");
  await moderator.locator(".delete-post").click();
  await Promise.all([
    moderator.waitForURL("**/forum"),
    moderator.getByRole("dialog", { name: "Delete Post" }).getByRole("button", { name: "Proceed" }).click(),
  ]);
  check(
    "deleting a thread's last post takes the thread, and goes to the board",
    sql(`SELECT COUNT(*) FROM forum_threads WHERE id = ${mine}`)[0][0] === 0 && moderator.url().endsWith("/forum"),
    moderator.url(),
  );
  await admin.close();
}

// Admin-1, who holds forum.edit, opens Holo's Moderation Tools on Frank's Topic 03:
// a blank title is refused, a new title closes and sticks the thread, and Delete
// asks first, then takes the thread with its posts.
async function moderating({ base, browser, page, check, shot, sql }) {
  const [[topic]] = sql("SELECT id FROM forum_threads WHERE title = 'Topic 03'");
  await page.goto(`${base}/forum/threads/${topic}`);
  check("Frank, who lacks forum.edit, gets no Moderation Tools", (await page.getByRole("button", { name: "Moderation Tools »" }).count()) === 0);

  const admin = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const moderator = await admin.newPage();
  await moderator.goto(base + "/");
  await moderator.fill("#username", "Admin-1");
  await moderator.fill("#password", "secret123");
  await Promise.all([moderator.waitForURL("**/me"), moderator.click('button:has-text("Sign in")')]);
  await moderator.goto(`${base}/forum/threads/${topic}`);
  const tools = moderator.getByRole("button", { name: "Moderation Tools »" });
  const dialog = moderator.getByRole("dialog", { name: "Moderation Tools" });
  const name = dialog.getByLabel("Topic: (max 30 characters)");
  await tools.click();
  await name.waitFor();
  check(
    "the Moderation Tools open on the thread as it is: its title, Open and Normal",
    (await name.inputValue()) === "Topic 03" &&
      (await name.getAttribute("maxlength")) === "30" &&
      (await dialog.getByLabel("Open").isChecked()) &&
      (await dialog.getByLabel("Normal").isChecked()),
  );
  await shot(moderator, "forum-moderation-tools");

  await name.fill("   ");
  await dialog.getByRole("button", { name: "Save" }).click();
  check(
    "a blank title is refused in Holo's words",
    (await dialog.getByText("Topic title may not be empty").isVisible()) && sql(`SELECT title FROM forum_threads WHERE id = ${topic}`)[0][0] === "Topic 03",
  );

  await name.fill("Moderated topic");
  await dialog.getByLabel("Closed").check();
  await dialog.getByLabel("Sticky topic").check();
  await dialog.getByRole("button", { name: "Save" }).click();
  await moderator.getByText("The thread has been updated successfully.").waitFor();
  const saved = sql(`SELECT title, locked, sticky FROM forum_threads WHERE id = ${topic}`)[0];
  check(
    "Save renames, closes and sticks the thread, and Holo's answer takes the post list's place",
    JSON.stringify(saved) === JSON.stringify(["Moderated topic", 1, 1]) && !(await moderator.locator("#group-postlist-container").isVisible()),
    JSON.stringify(saved),
  );
  await shot(moderator, "forum-moderation-saved");
  await Promise.all([moderator.waitForURL(`**/forum/threads/${topic}?page=1#page-bottom`), moderator.getByRole("link", { name: "Proceed" }).click()]);
  check(
    "Proceed opens the thread's last page, closed and renamed",
    (await moderator.getByText("Closed Thread", { exact: true }).count()) === 2 && (await moderator.title()).includes("Moderated topic"),
    await moderator.title(),
  );

  await moderator.goto(base + "/forum");
  const titles = await moderator.locator("#group-topiclist-list tr td:first-child > div > a:first-child").allInnerTexts();
  check(
    "the board lists it with the stickies, closed",
    titles.slice(0, 3).includes("Moderated topic") &&
      (await moderator.locator("#group-topiclist-list tr", { hasText: "Moderated topic" }).getByRole("img", { name: "Closed Thread" }).isVisible()),
    JSON.stringify(titles),
  );

  await moderator.goto(`${base}/forum/threads/${topic}`);
  await tools.click();
  await name.waitFor();
  check("the Moderation Tools reopen on Closed and Sticky topic", (await dialog.getByLabel("Closed").isChecked()) && (await dialog.getByLabel("Sticky topic").isChecked()));
  await dialog.getByRole("button", { name: "Delete" }).click();
  check("Delete asks first, in Holo's words", await dialog.getByText("You are about to delete a complete topic. Are you sure?").isVisible());
  await shot(moderator, "forum-moderation-delete");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  check("Cancel keeps the thread", sql(`SELECT COUNT(*) FROM forum_threads WHERE id = ${topic}`)[0][0] === 1);
  await tools.click();
  await name.waitFor();
  await dialog.getByRole("button", { name: "Delete" }).click();
  await Promise.all([moderator.waitForURL("**/forum"), dialog.getByRole("button", { name: "Proceed" }).click()]);
  check(
    "Proceed deletes the thread with its posts and goes to the board",
    sql(`SELECT COUNT(*) FROM forum_threads WHERE id = ${topic}`)[0][0] === 0 && sql(`SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = ${topic}`)[0][0] === 0,
    moderator.url(),
  );
  await admin.close();
}

// Frank reports Dora's posts in Holo's Help Tool window: a flag opens it, another
// flag takes it over, Proceed sends the report and Close shuts it; the next report
// waits until staff pick the first up.
async function reporting({ base, page, check, shot, sql, long, problems }) {
  // The flag and Close are the pages' own markup, so their islands must be awake
  // before a click: until then the flag opens a plain window and Close does nothing.
  const awake = (p) => p.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
  await page.goto(`${base}/forum/threads/${long}`);
  await awake(page);
  const flags = page.locator(".create-report-button");
  const rows = page.locator("#group-postlist-list tr");
  check(
    "Frank gets the report flag on Dora's five posts, and none on his own",
    (await flags.count()) === 5 &&
      (await rows.filter({ has: page.locator(".create-report-button") }).filter({ hasText: "archived" }).count()) === 5,
  );
  const [first, second] = sql(`SELECT id FROM forum_posts WHERE forum_thread_id = ${long} ORDER BY id LIMIT 3`)
    .map(([id]) => id)
    .filter((_, i) => i !== 1);
  check(
    "a flag leads to the report window with the thread's page",
    (await flags.first().getAttribute("href")) === `/forum/posts/${first}/report?page=1` &&
      (await flags.first().getAttribute("title")) === "Report this post",
  );

  const [help] = await Promise.all([page.waitForEvent("popup"), flags.first().click()]);
  help.on("pageerror", (e) => problems.push(e.message));
  await help.waitForLoadState();
  await awake(help);
  const text = () => help.locator("body").innerText();
  check(
    "the flag opens Holo's Help Tool in its own window, which asks first",
    (await help.evaluate(() => window.name)) === "habbohelp" &&
      !(await help.evaluate(() => window.toolbar.visible)) &&
      (await help.title()) === "Reborn Help Tool" &&
      (await text()).includes("REBORN HELP TOOL") &&
      (await text()).includes("ASK YOUR QUESTION") &&
      (await text()).includes("Is the post you have selected offensive or breaking the rules? Are you sure you want to report this post?") &&
      (await help.getByRole("button", { name: "Proceed" }).isVisible()) &&
      (await help.getByRole("button", { name: "Close" }).isVisible()),
    await text(),
  );
  await shot(help, "forum-report-window");

  await Promise.all([help.waitForURL(`**/forum/posts/${second}/report?page=1`), flags.nth(1).click()]);
  check("another flag takes the open window over", page.context().pages().length === 2);
  check("asking writes nothing", sql("SELECT COUNT(*) FROM help_tickets")[0][0] === 0);

  await Promise.all([help.waitForEvent("load"), help.getByRole("button", { name: "Proceed" }).click()]);
  check(
    "Proceed sends the report and thanks, with only Close left",
    (await text()).includes("Thank you for reporting this post.") &&
      (await help.getByRole("button", { name: "Proceed" }).count()) === 0 &&
      (await help.getByRole("button", { name: "Close" }).isVisible()),
    await text(),
  );
  await shot(help, "forum-report-thanks");
  await awake(help);
  const [[frank]] = sql("SELECT id FROM avatars WHERE name = 'Frank'");
  const tickets = sql("SELECT avatar_id, forum_post_id, subject, message FROM help_tickets");
  check(
    "the ticket is Frank's, about Dora's post, with its text and its address",
    tickets.length === 1 &&
      tickets[0][0] === frank &&
      tickets[0][1] === second &&
      tickets[0][2] === "DISCUSSION BOARD - REPORTED POST" &&
      tickets[0][3].includes(`The Post ID is ${second}, in thread ${long}.`) &&
      tickets[0][3].includes("Message 3") &&
      tickets[0][3].endsWith(`${base}/forum/threads/${long}?page=1#post-${second}`),
    JSON.stringify(tickets),
  );
  await Promise.all([help.waitForEvent("close"), help.getByRole("button", { name: "Close" }).click()]);
  check("Close shuts the window", help.isClosed());

  const [again] = await Promise.all([page.waitForEvent("popup"), flags.first().click()]);
  again.on("pageerror", (e) => problems.push(e.message));
  await again.waitForLoadState();
  await awake(again);
  check(
    "while the report waits, another answers Holo's refusal",
    (await again.locator("body").innerText()).includes(
      "Unable to report post: you still have a pending support request. Please try again later. Note that post reports also count as support requests.",
    ) && (await again.getByRole("button", { name: "Proceed" }).count()) === 0,
    await again.locator("body").innerText(),
  );
  await shot(again, "forum-report-waiting");
  await Promise.all([again.waitForEvent("close"), again.getByRole("button", { name: "Close" }).click()]);
  check("a refused report writes nothing", sql("SELECT COUNT(*) FROM help_tickets")[0][0] === 1);
}
