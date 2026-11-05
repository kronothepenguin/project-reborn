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
