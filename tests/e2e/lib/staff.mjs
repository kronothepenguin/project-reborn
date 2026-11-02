// seedStaff adds the actors of the housekeeping suites to a copy of the installed
// hotel. They reuse the administrator's password hash, so each signs in with the
// installer's password, and only their groups differ.
export function seedStaff(sql) {
  const now = "2026-11-01 12:00:00.000000000+00:00";
  const hash = sql("SELECT password_hash FROM credentials LIMIT 1")[0][0];

  const person = (name, ...habbos) => {
    sql(`INSERT INTO users (email, born_on, created_ip, created_at, updated_at)
      VALUES ('${name.toLowerCase()}@example.com', '1990-05-01', '127.0.0.1', '${now}', '${now}')`);
    const [[userID]] = sql(
      `SELECT id FROM users WHERE email = '${name.toLowerCase()}@example.com'`,
    );
    sql(
      `INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (${userID}, '${hash}', '${now}')`,
    );
    for (const habbo of [name, ...habbos]) {
      sql(`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at)
        VALUES (${userID}, '${habbo}', 'hd-180-1', 'M', '${now}', '${now}')`);
      const [[avatarID]] = sql(
        `SELECT id FROM avatars WHERE name = '${habbo}'`,
      );
      sql(
        `INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (${avatarID}, '${now}', '${now}')`,
      );
      const [[profileID]] = sql(
        `SELECT id FROM profiles WHERE avatar_id = ${avatarID}`,
      );
      sql(
        `INSERT INTO homes (profile_id, updated_at) VALUES (${profileID}, '${now}')`,
      );
      sql(
        `INSERT INTO wallets (avatar_id, updated_at) VALUES (${avatarID}, '${now}')`,
      );
    }
    return userID;
  };

  const group = (name, members, ...attributes) => {
    sql(
      `INSERT INTO access_groups (name, created_at, updated_at) VALUES ('${name}', '${now}', '${now}')`,
    );
    const [[groupID]] = sql(
      `SELECT id FROM access_groups WHERE name = '${name}'`,
    );
    for (const attribute of attributes) {
      sql(
        `INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (${groupID}, '${attribute}')`,
      );
    }
    for (const userID of members) {
      sql(
        `INSERT INTO access_group_members (access_group_id, user_id, granted_at) VALUES (${groupID}, ${userID}, '${now}')`,
      );
    }
  };

  person("Visitor");
  person("Frank", "FrankStaff");
  group("Helpers", [person("Helper")], "housekeeping.access");
  group(
    "Outsiders",
    [person("Outsider")],
    "housekeeping.settings",
    "housekeeping.accessGroups",
    "housekeeping.logs",
  );
}

// session opens a browser context, signed in on the CMS when a habbo is named.
export async function session({ base, browser }, name) {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 655 },
  });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500 && r.status() !== 503)
      problems.push(`${r.status()} ${r.url()}`);
  });
  if (name) {
    await page.goto(`${base}/`);
    await page.fill('input[name="username"]', name);
    await page.fill('input[name="password"]', "secret123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/me");
  }
  return { context, page, problems };
}
