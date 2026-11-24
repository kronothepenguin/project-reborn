// Every page of the site at today's sizes, on a screen 1366px wide: Holo's font
// at 16px, texts only in Tailwind's sizes, the 1240px page with its columns
// filling it, or the Me and community pages' flexbox page of at most 1352px,
// and pictures at their own size. Admin-1 owns a group with a forum
// thread and writes one article; a screenshot of every page is saved as
// pages-<name>.png. Home pages and the Help Tool keep Holo's canvas.
import { session } from "../lib/staff.mjs";

export const programs = ["cms"];

const at = "2026-11-01 12:00:00.000000000+00:00";

export const prepare = ({ sql }) => {
  const [[admin]] = sql("SELECT id FROM avatars WHERE name = 'Admin-1'");
  sql(`INSERT INTO news_articles (avatar_id, title, category, image_url, summary, body, published_at, created_at, updated_at)
    VALUES (${admin}, 'Welcome to the hotel', 'Updates', '', 'A short summary.', '[b]Bold[/b] and [quote]a quote[/quote]', '${at}', '${at}', '${at}')`);
  sql(`INSERT INTO groups (avatar_id, name, description, badge, access, created_at, updated_at)
    VALUES (${admin}, 'Retro Club', 'About the club', 'b0711Xs01124', 'open', '${at}', '${at}')`);
  const [[group]] = sql("SELECT id FROM groups WHERE name = 'Retro Club'");
  sql(`INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at)
    VALUES (${group}, ${admin}, 'admin', TRUE, '${at}', '${at}')`);
  sql(`INSERT INTO homes (group_id, updated_at) VALUES (${group}, '${at}')`);
  sql(`INSERT INTO forum_threads (avatar_id, title, sticky, locked, created_at)
    VALUES (${admin}, 'Board rules', FALSE, FALSE, '${at}')`);
  const [[thread]] = sql("SELECT id FROM forum_threads WHERE title = 'Board rules'");
  sql(`INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at)
    VALUES (${thread}, ${admin}, 'Be [b]nice[/b].', '${at}')`);
};

// Tailwind's text sizes, from text-xs up.
const sizes = new Set([12, 14, 16, 18, 20, 24, 30, 36, 48]);

// measure reads what the checks need: the body's font, the sideways scroll, the
// page and its columns, every visible text whose size is not one of Tailwind's,
// and every picture not at its own size. A canvas, a home or the Help Tool's
// window, is left out.
const measure = (page) =>
  page.evaluate(() => {
    const canvas = (el) => el.closest("#mypage-bg");
    const visible = (el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== "hidden";
    };
    const odd = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!node.textContent.trim() || !el || canvas(el) || !visible(el)) continue;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
      // A tag of a cloud takes its size from how often it is used.
      if (el.closest('[style*="font-size"]')) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      odd.push({ size, text: node.textContent.trim().slice(0, 30) });
    }
    const pictures = [...document.images]
      .filter((img) => img.complete && img.naturalWidth > 0 && visible(img) && !canvas(img))
      .map((img) => ({ src: img.getAttribute("src"), width: img.width, height: img.height, natural: [img.naturalWidth, img.naturalHeight] }))
      .filter((img) => img.width !== img.natural[0] || img.height !== img.natural[1]);
    const main = document.querySelector("main");
    const box = main?.getBoundingClientRect();
    // The boxes reach the rightmost box with a border or a picture; the columns
    // are the children of the page's first row.
    let right = 0;
    for (const el of main?.querySelectorAll("*") ?? []) {
      if (canvas(el) || !visible(el)) continue;
      if (parseFloat(getComputedStyle(el).borderRightWidth) === 0 && el.tagName !== "IMG") continue;
      right = Math.max(right, el.getBoundingClientRect().right);
    }
    const row = [...(main?.querySelectorAll("*") ?? [])].find(
      (el) => getComputedStyle(el).display === "flex" && el.children.length >= 2,
    );
    const columns = row ? [...row.children].map((child) => child.getBoundingClientRect()) : [];
    const span = columns.length ? Math.max(...columns.map((c) => c.right)) - Math.min(...columns.map((c) => c.left)) : 0;
    const style = getComputedStyle(document.body);
    return {
      font: { size: style.fontSize, family: style.fontFamily },
      mainSize: main ? getComputedStyle(main).fontSize : null,
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      main: box ? { width: box.width, left: box.left, right: document.documentElement.clientWidth - box.right, empty: box.right - right, columns: columns.map((c) => c.width), span } : null,
      texts: odd,
      pictures,
    };
  });

export default async function (t) {
  const { base, browser, check, shot, sql } = t;
  const [[group]] = sql("SELECT id FROM groups WHERE name = 'Retro Club'");
  const [[thread]] = sql("SELECT id FROM forum_threads WHERE title = 'Board rules'");
  const [[post]] = sql("SELECT id FROM forum_posts WHERE forum_thread_id = " + thread);
  const [[article]] = sql("SELECT id FROM news_articles WHERE title = 'Welcome to the hotel'");

  // Each page: its name, its address and its kind. A "community" page is
  // 1240px wide, centred; a "columns" one has Holo's three columns, which span
  // it. A "fluid" page, reviewed beside Holo's, is as wide as the screen up to
  // 1352px, centred, and its columns span it. A "signed-out" page fills Holo's process box, a "box" one stands in its
  // middle. An "own" page has a layout of its own, and a "canvas" keeps Holo's,
  // as the Help Tool.
  const guestPages = [
    ["front", "/", "signed-out"],
    ["register", "/register", "signed-out"],
    ["forgot", "/forgot", "signed-out"],
    ["reset", "/reset/unknown", "box"],
    ["disclaimer", "/disclaimer", "signed-out"],
    ["privacy", "/privacy", "signed-out"],
    ["community", "/community", "fluid"],
    ["news", "/news", "columns"],
    ["news-article", `/news/${article}`, "columns"],
    ["credits", "/credits", "community"],
    ["club", "/club", "community"],
    ["staff", "/staff", "columns"],
    ["tags", "/tags", "columns"],
    ["forum", "/forum", "community"],
    ["forum-thread", `/forum/threads/${thread}`, "community"],
    ["group", `/groups/${group}`, "community"],
    ["group-not-found", "/groups/999999", "community"],
    ["home", "/home/Admin-1", "community"],
    ["home-not-found", "/home/Nobody", "community"],
    ["client-guest", "/client/utils", "own"],
  ];
  const habboPages = [
    ["me", "/me", "fluid"],
    ["tags-search", "/tags?tag=retro", "columns"],
    ["credits-transactions", "/credits/transactions", "community"],
    ["account-looks", "/account/looks", "community"],
    ["account-profile", "/account/profile", "community"],
    ["account-email", "/account/email", "community"],
    ["account-password", "/account/password", "community"],
    ["account-referral", "/account/referral", "community"],
    ["account-habbos", "/account/habbos", "community"],
    ["account-furni", "/account/furni", "community"],
    ["group-edit", `/groups/${group}/edit`, "community"],
    ["home-edit", "/home/Admin-1/edit", "community"],
    ["client", "/client", "canvas"],
    ["client-error", "/client/utils?key=error", "own"],
    ["forum-report", `/forum/posts/${post}/report`, "canvas"],
    ["help", "/help", "canvas"],
  ];

  const guest = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const staff = await session(t, "Admin-1");
  await staff.page.setViewportSize({ width: 1366, height: 900 });

  const report = { font: [], scroll: [], page: [], fills: [], texts: [], pictures: [] };
  for (const [pages, page] of [[guestPages, await guest.newPage()], [habboPages, staff.page]]) {
    for (const [name, route, kind] of pages) {
      await page.goto(base + route);
      await page.waitForLoadState("networkidle");
      await shot(page, `pages-${name}`);
      const m = await measure(page);
      const body = m.mainSize ?? m.font.size;
      if (body !== "16px" || !m.font.family.startsWith("Verdana")) report.font.push({ name, body, family: m.font.family });
      if (m.scroll > m.client) report.scroll.push({ name, scroll: m.scroll });
      if (["community", "columns"].includes(kind) && (m.main.width !== 1240 || Math.abs(m.main.left - m.main.right) > 1)) report.page.push({ name, ...m.main });
      if (kind === "columns" && m.main.span < 1236) report.fills.push({ name, columns: m.main.columns });
      if (kind === "fluid" && (m.main.width > 1352 || Math.abs(m.main.left - m.main.right) > 1)) report.page.push({ name, ...m.main });
      if (kind === "fluid" && m.main.span < m.main.width - 1) report.fills.push({ name, columns: m.main.columns, width: m.main.width });
      if (kind === "signed-out" && m.main && m.main.empty > 24) report.fills.push({ name, empty: m.main.empty });
      if (kind === "canvas") continue;
      const odd = m.texts.filter((text) => !sizes.has(text.size));
      if (odd.length) report.texts.push({ name, odd: odd.slice(0, 5) });
      if (m.pictures.length) report.pictures.push({ name, pictures: m.pictures.slice(0, 5) });
    }
  }
  // The dialogs a habbo opens on a page, at the same sizes.
  for (const [name, route, button] of [
    ["me-group-purchase", "/me", "Create/buy a Group"],
    ["forum-new-thread", "/forum", "New Thread"],
  ]) {
    const page = staff.page;
    await page.goto(base + route);
    await page.getByRole("button", { name: button }).first().click();
    await page.waitForLoadState("networkidle");
    await shot(page, `pages-${name}`);
    const odd = (await measure(page)).texts.filter((text) => !sizes.has(text.size));
    if (odd.length) report.texts.push({ name, odd: odd.slice(0, 5) });
  }
  await guest.close();
  await staff.context.close();

  check("a visitor reads every page's body text at 16px in Holo's font", report.font.length === 0, JSON.stringify(report.font));
  check("every page shows its texts only in the sizes of the new scale", report.texts.length === 0, JSON.stringify(report.texts));
  check("no page scrolls sideways on a screen 1366px wide", report.scroll.length === 0, JSON.stringify(report.scroll));
  check("every community page is centred at 1366, 1240px wide or, reviewed beside Holo's, at most 1352px", report.page.length === 0, JSON.stringify(report.page));
  check("the columns of a page span its 1240px as Holo's spanned its page", report.fills.length === 0, JSON.stringify(report.fills));
  check("every picture shows at its own size", report.pictures.length === 0, JSON.stringify(report.pictures));
}
