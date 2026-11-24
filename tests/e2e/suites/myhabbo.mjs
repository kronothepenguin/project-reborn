// Holo's myhabbo pages, the board, a thread, a home and a group's page, in
// view and in edit, on a screen 1366px wide: each stands under the community
// layout's own sub-navigation, its box as wide; the board's rows fill it; the
// line under a box's title runs the box's width, a home's 752px canvas fills its
// box, the edit toolbar spans it, and every widget and note is whole, its title
// bar and its body the same width. Screenshots of each page, and of the board's
// new thread form and a thread's reply form.
import { session } from "../lib/staff.mjs";

export const programs = ["cms"];

const at = "2026-11-01 12:00:00.000000000+00:00";

export const prepare = ({ sql }) => {
  const [[admin]] = sql("SELECT id FROM avatars WHERE name = 'Admin-1'");
  const [[home]] = sql(`SELECT homes.id FROM homes JOIN profiles ON profiles.id = homes.profile_id WHERE profiles.avatar_id = ${admin}`);
  const [[note]] = sql("SELECT id FROM home_store_items WHERE kind = 'note' ORDER BY id LIMIT 1");
  const [[sticker]] = sql("SELECT id FROM home_store_items WHERE kind = 'sticker' ORDER BY id LIMIT 1");
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
    VALUES (${home}, 'widget', 'groups', 'goldenskin', 25, 420, 6, '${at}', '${at}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, skin, body, x, y, z, created_at, updated_at)
    VALUES (${home}, 'note', ${note}, 'noteitskin', 'Hello [b]there[/b]', 330, 40, 9, '${at}', '${at}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, x, y, z, created_at, updated_at)
    VALUES (${home}, 'sticker', ${sticker}, 500, 260, 10, '${at}', '${at}')`);
  sql(`INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
    VALUES (${admin}, 'Retro Club', 'About the club', 'b0711Xs01124', 'open', '${at}', '${at}')`);
  const [[group]] = sql("SELECT id FROM groups WHERE name = 'Retro Club'");
  sql(`INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at)
    VALUES (${group}, ${admin}, 'admin', TRUE, '${at}', '${at}')`);
  sql(`INSERT INTO homes (group_id, updated_at) VALUES (${group}, '${at}')`);
  const [[groupHome]] = sql(`SELECT id FROM homes WHERE group_id = ${group}`);
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
    VALUES (${groupHome}, 'widget', 'group_info', 'metalskin', 25, 25, 5, '${at}', '${at}')`);
  sql(`INSERT INTO home_items (home_id, kind, widget, skin, x, y, z, created_at, updated_at)
    VALUES (${groupHome}, 'widget', 'members', 'goldenskin', 320, 25, 6, '${at}', '${at}')`);
  sql(`INSERT INTO home_items (home_id, kind, home_store_item_id, skin, body, x, y, z, created_by_avatar_id, created_at, updated_at)
    VALUES (${groupHome}, 'note', ${note}, 'defaultskin', 'Club rules', 400, 400, 4, ${admin}, '${at}', '${at}')`);
  sql(`INSERT INTO forum_threads (avatar_id, title, sticky, locked, created_at) VALUES (${admin}, 'Board rules', TRUE, FALSE, '${at}')`);
  const [[thread]] = sql("SELECT id FROM forum_threads WHERE title = 'Board rules'");
  sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at) VALUES (${thread}, ${admin}, 'Be nice.', '${at}')`);
  sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at)
    VALUES (${thread}, ${admin}, '[quote]Be nice.[/quote]And keep every thread about the hotel, its rooms, its games and its habbos.', '${at}')`);
  sql(`INSERT INTO forum_threads (avatar_id, title, sticky, locked, created_at)
    VALUES (${admin}, 'Which room has the best music in the whole hotel this week?', FALSE, FALSE, '${at}')`);
  const [[music]] = sql("SELECT id FROM forum_threads WHERE title LIKE 'Which room%'");
  sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at) VALUES (${music}, ${admin}, 'Tell us yours.', '${at}')`);
  sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at) VALUES (${music}, ${admin}, 'The Rooftop Lounge.', '${at}')`);
};

// frame reads the page's box, its sub-navigation and its footer, and the line
// under the box's title.
const frame = (page) =>
  page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, width: r.width };
    };
    const wrapper = document.querySelector("#mypage-wrapper");
    const row = wrapper.querySelector(":scope > div > div");
    const line = getComputedStyle(row, "::before");
    const footer = document.querySelector("footer p");
    return {
      main: box(document.querySelector("main")),
      wrapper: box(wrapper),
      nav: box(document.querySelector("nav > div")),
      table: box(document.querySelector("#group-topiclist-list, #group-postlist-list") ?? wrapper),
      row: box(row),
      line: { height: line.height, left: line.left, right: line.right },
      footer: box(footer),
    };
  });

// whole reads, for each widget and note, the right edge of its title bar and
// of its body's content, where the skin draws its right side.
const whole = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("#playground .widget, #playground .stickie")].map((item) => {
      const head = item.querySelector(".widget-headline, .stickie-header h3");
      const body = item.querySelector(".widget-content, .stickie-content");
      return {
        id: item.id,
        head: Math.round(head.getBoundingClientRect().right),
        body: Math.round(body.getBoundingClientRect().right),
      };
    }),
  );

export default async function (t) {
  const { base, check, shot, sql } = t;
  const [[group]] = sql("SELECT id FROM groups WHERE name = 'Retro Club'");
  const [[thread]] = sql("SELECT id FROM forum_threads WHERE title = 'Board rules'");

  const staff = await session(t, "Admin-1");
  const page = staff.page;
  await page.setViewportSize({ width: 1366, height: 900 });

  const pages = [
    ["board", "/forum"],
    ["thread", `/forum/threads/${thread}`],
    ["home", "/home/Admin-1"],
    ["home-edit", "/home/Admin-1/edit"],
    ["group", `/groups/${group}`],
    ["group-edit", `/groups/${group}/edit`],
  ];
  await page.goto(base + "/community");
  await page.waitForLoadState("networkidle");
  const community = await page.evaluate(() => {
    const r = document.querySelector("nav > div").getBoundingClientRect();
    const f = document.querySelector("footer p").getBoundingClientRect();
    return { nav: { left: r.left, right: r.right, top: r.top, width: r.width }, footer: { left: f.left, right: f.right } };
  });
  await shot(page, "myhabbo-community-1366");

  const frames = [];
  const items = [];
  const canvases = [];
  for (const [name, route] of pages) {
    await page.goto(base + route);
    await page.waitForLoadState("networkidle");
    await shot(page, `myhabbo-${name}-1366`);
    frames.push({ name, ...(await frame(page)) });
    if (name.startsWith("home") || name.startsWith("group")) {
      items.push({ name, items: await whole(page) });
      canvases.push({
        name,
        ...(await page.evaluate(() => {
          const r = (el) => el.getBoundingClientRect();
          const wrapper = r(document.querySelector("#mypage-wrapper"));
          const bg = r(document.querySelector("#mypage-bg"));
          const playground = r(document.querySelector("#playground"));
          const toolbar = [...document.querySelectorAll("#mypage-wrapper button, #mypage-wrapper a")]
            .filter((el) => ["Inventory", "Cancel"].includes(el.innerText.trim()))
            .map((el) => r(el));
          return {
            wrapper: [wrapper.left, wrapper.right],
            bg: [bg.left, bg.right],
            playground: [playground.left, playground.width],
            toolbar: toolbar.length === 2 ? [toolbar[0].left - wrapper.left, wrapper.right - toolbar[1].right] : null,
          };
        })),
      });
    }
  }

  const forum = frames.filter((f) => f.name === "board" || f.name === "thread");
  check(
    "the board, a thread, a home and a group's page show the community page's sub-navigation, in the same width and place",
    frames.every((f) => JSON.stringify(f.nav) === JSON.stringify(community.nav) && f.nav.width === 761),
    JSON.stringify({ community: community.nav, pages: frames.map(({ name, nav }) => ({ name, nav })) }),
  );
  check(
    "each one's box is as wide as the sub-navigation, under its edges, with the footer of the community page",
    frames.every(
      (f) =>
        f.wrapper.left === f.nav.left &&
        f.wrapper.right === f.nav.right &&
        f.footer.left === community.footer.left &&
        f.footer.right === community.footer.right,
    ),
    JSON.stringify(frames.map(({ name, wrapper, nav, footer }) => ({ name, wrapper, nav, footer }))),
  );
  check(
    "the board's and a thread's rows fill the box from one side of its frame to the other",
    forum.every((f) => f.table.left === f.wrapper.left + 1 && f.table.right === f.wrapper.right - 1),
    JSON.stringify(forum.map(({ name, wrapper, table }) => ({ name, wrapper, table }))),
  );
  check(
    "the line under the box's title runs from one edge of the box to the other",
    frames.every((f) => f.line.height === "1px" && f.line.left === "0px" && f.line.right === "0px" && f.row.width === f.wrapper.width - 2),
    JSON.stringify(frames.map(({ name, row, line }) => ({ name, row, line }))),
  );
  check(
    "a home's and a group's canvas fills its box from edge to edge, its playground 752px, 3px in, in view and in edit",
    canvases.every(
      (c) => c.bg[0] === c.wrapper[0] + 1 && c.bg[1] === c.wrapper[1] - 1 && c.playground[0] === c.bg[0] + 3 && c.playground[1] === 752,
    ),
    JSON.stringify(canvases),
  );
  check(
    "the edit toolbar spans the box, Inventory and Cancel as far from its edges",
    canvases
      .filter((c) => c.name.endsWith("edit"))
      .every((c) => c.toolbar && c.toolbar[0] > 0 && Math.abs(c.toolbar[0] - c.toolbar[1]) <= 2),
    JSON.stringify(canvases),
  );
  check(
    "every widget and note on a home and a group's page is whole, its title bar and its body the same width",
    items.every((p) => p.items.length > 0 && p.items.every((i) => i.head === i.body)),
    JSON.stringify(items),
  );
  // fits reads the right edge of the box and of the form's widest parts.
  const fits = async (form) => {
    await page.locator(form).waitFor();
    return page.evaluate((selector) => {
      const right = (el) => el.getBoundingClientRect().right;
      const wrapper = right(document.querySelector("#mypage-wrapper"));
      const parts = [...document.querySelectorAll(`${selector}, ${selector} *`)].map(right);
      return { wrapper, widest: Math.max(...parts) };
    }, form);
  };
  const forms = [];
  await page.goto(base + "/forum");
  await page.waitForLoadState("networkidle");
  await page.locator("#newtopic-upper").click();
  forms.push({ name: "new thread", ...(await fits('table[aria-label="New Thread"]')) });
  await shot(page, "myhabbo-new-thread-1366");
  await page.goto(base + `/forum/threads/${thread}`);
  await page.waitForLoadState("networkidle");
  await page.locator("#create-post-message").click();
  forms.push({ name: "reply", ...(await fits('table[aria-label="Reply"]')) });
  await shot(page, "myhabbo-reply-1366");
  check(
    "the board's new thread form and a thread's reply form fit inside the box",
    forms.every((f) => f.widest <= f.wrapper - 1),
    JSON.stringify(forms),
  );
  await staff.context.close();
}
