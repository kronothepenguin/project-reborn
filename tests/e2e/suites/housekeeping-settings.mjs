export const programs = ["cms", "housekeeping"];

export default async function ({ base, browser, check, hk, hkOrigin, shot }) {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 655 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on(
    "console",
    (m) =>
      m.type() === "error" &&
      !m.text().includes("422") &&
      errors.push(`console: ${m.text()}`),
  );
  page.on(
    "response",
    (r) =>
      r.status() >= 400 &&
      r.status() !== 422 &&
      errors.push(`${r.status()} ${r.url()}`),
  );

  await page.goto(`${base}/`);
  await page.fill('input[name="username"]', "Admin-1");
  await page.fill('input[name="password"]', "secret123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/me");

  await page.goto(`${hk}/settings`);
  check(
    "the tab is active",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content",
  );
  await shot(page, "settings");

  const links = await page
    .locator('aside a[href*="/settings?section="]')
    .evaluateAll((all) => all.map((a) => a.getAttribute("href")));
  check("the menu lists the settings sections", links.length >= 8, String(links.length));
  for (const href of links) {
    const response = await page.goto(`${hkOrigin}${href}`);
    const heading = await page.locator("main h2").first().innerText();
    const inputs = await page.locator("main input, main select").count();
    check(
      `section ${new URL(href, "http://x").searchParams.get("section")}`,
      response.status() === 200 && inputs > 0,
      `${heading}, ${inputs} inputs`,
    );
  }

  await page.goto(`${hk}/settings?section=site`);
  await page.fill('input[name="site.name"]', "Reborn <b>Palace</b>");
  await page.getByRole("button", { name: "Save Configuration" }).click();
  await page.waitForLoadState();
  check("the save redirects", page.url().includes("saved=1"), page.url());
  check(
    "Holo's message",
    (await page.getByRole("status").innerText()) ===
      "Settings saved successfully.",
  );
  check(
    "the name is escaped",
    (await page.inputValue('input[name="site.name"]')) ===
      "Reborn <b>Palace</b>",
  );

  await page.fill('input[name="site.shortName"]', "");
  await page.fill('input[name="site.url"]', "https://typed.example.com");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Configuration" }).click();
  check("a blank field answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "Holo's refusal",
    (await page.getByRole("alert").innerText()).includes(
      "Please do not leave any fields blank. Settings not saved.",
    ),
  );
  check(
    "the typed address stays",
    (await page.inputValue('input[name="site.url"]')) ===
      "https://typed.example.com",
  );

  await page.goto(`${hk}/settings?section=mail`);
  await page.fill('input[name="mail.password"]', "hunter2-secret");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check("the password saved", page.url().includes("saved=1"));
  const html = await page.content();
  check("the password is not on the page", !html.includes("hunter2-secret"));
  check(
    "the password field is blank",
    (await page.inputValue('input[name="mail.password"]')) === "",
  );
  await shot(page, "mail");

  await page.goto(`${hk}/settings?section=auth`);
  await page.fill('input[name="auth.passwordMinLength"]', "30");
  await page.fill('input[name="auth.passwordMaxLength"]', "40");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check(
    "both limits rise together",
    (await page.inputValue('input[name="auth.passwordMaxLength"]')) === "40" &&
      (await page.inputValue('input[name="auth.passwordMinLength"]')) === "30",
  );
  await page.fill('input[name="auth.passwordMinLength"]', "6");
  await page.fill('input[name="auth.passwordMaxLength"]', "25");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check(
    "both limits fall together",
    (await page.inputValue('input[name="auth.passwordMaxLength"]')) === "25",
  );

  await page.goto(`${hk}/logs`);
  const rows = await page.locator("main tbody tr").allInnerTexts();
  check("no log row names a secret", !rows.join(" ").includes("hunter2"));
  await shot(page, "logs");

  check("no page failed", errors.length === 0, errors.join(" | "));
}
