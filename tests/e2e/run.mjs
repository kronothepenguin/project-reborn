import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";
import {
  build,
  copyHotel,
  emptyFolder,
  freePort,
  Hotel,
  install,
  installerPort,
  portBusy,
  work,
} from "./lib/hotel.mjs";
import { startMail } from "./lib/mail.mjs";
import * as art from "./suites/art.mjs";
import * as details from "./suites/details.mjs";
import * as habbos from "./suites/habbos.mjs";
import * as housekeepingAccess from "./suites/housekeeping-access.mjs";
import * as housekeepingAdmin from "./suites/housekeeping-admin.mjs";
import * as housekeepingMaintenance from "./suites/housekeeping-maintenance.mjs";
import * as housekeepingSettings from "./suites/housekeeping-settings.mjs";
import * as housekeepingStore from "./suites/housekeeping-store.mjs";
import * as housekeepingUsers from "./suites/housekeeping-users.mjs";
import * as looks from "./suites/looks.mjs";
import * as maintenance from "./suites/maintenance.mjs";
import * as me from "./suites/me.mjs";
import * as register from "./suites/register.mjs";
import * as signedOut from "./suites/signed-out.mjs";
import * as together from "./suites/together.mjs";

const suites = {
  "signed-out": signedOut,
  register,
  me,
  looks,
  details,
  habbos,
  maintenance,
  art,
  "housekeeping-access": housekeepingAccess,
  "housekeeping-admin": housekeepingAdmin,
  "housekeeping-settings": housekeepingSettings,
  "housekeeping-maintenance": housekeepingMaintenance,
  "housekeeping-users": housekeepingUsers,
  "housekeeping-store": housekeepingStore,
  together,
};

const flags = process.argv.slice(2).filter((arg) => arg.startsWith("--"));
const names = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const unknown = names.filter((name) => !(name in suites));
if (unknown.length > 0) {
  console.error(
    `no such suite: ${unknown.join(", ")}\nsuites: ${Object.keys(suites).join(", ")}`,
  );
  process.exit(2);
}

if (await portBusy(installerPort)) {
  console.error(
    `port ${installerPort} is busy: stop whatever holds it, the installer needs it`,
  );
  process.exit(2);
}

if (!flags.includes("--skip-build")) build();

const ports = { cms: await freePort(), housekeeping: await freePort() };
const mail = await startMail();
const installed = await install(emptyFolder("installed"), ports, mail.port);

async function runSuite(name, suite) {
  const hotel = suite.emptyFolder
    ? new Hotel(emptyFolder(name), ports)
    : copyHotel(installed, name);
  const browser = await chromium.launch();
  let checks = 0;
  const failures = [];
  mail.clear();

  const t = {
    base: `http://localhost:${ports.cms}`,
    hkOrigin: `http://localhost:${ports.housekeeping}`,
    hk: `http://localhost:${ports.housekeeping}/housekeeping`,
    installer: `http://localhost:${installerPort}`,
    ports,
    dir: hotel.dir,
    browser,
    sql: (query) => hotel.sql(query),
    mails: () => [...mail.received],
    wait: sleep,
    async eventually(test) {
      for (let tries = 0; tries < 40; tries++) {
        if (await test()) return true;
        await sleep(100);
      }
      return false;
    },
    shot: (page, shotName) =>
      page.screenshot({
        path: path.join(work, "shots", `${shotName}.png`),
        fullPage: true,
      }),
    start: (program) => hotel.start(program),
    stop: (program) => hotel.stop(program),
    restart: (program) => hotel.restart(program),
    check(checkName, ok, detail = "") {
      checks++;
      if (!ok) {
        failures.push(checkName);
        console.log(
          `FAIL ${name}: ${checkName}${detail ? ` :: ${detail}` : ""}`,
        );
      }
    },
  };

  try {
    suite.prepare?.(t);
    for (const program of suite.programs ?? ["cms"]) await hotel.start(program);
    await suite.default(t);
  } catch (error) {
    failures.push(error.message);
    console.log(`FAIL ${name}: ${error.stack}`);
  } finally {
    await browser.close();
    await hotel.stopAll();
  }

  for (const line of hotel.logProblems()) {
    failures.push(line);
    console.log(`FAIL ${name}: server log: ${line}`);
  }
  console.log(`${failures.length ? "FAIL" : "ok  "} ${name}: ${checks} checks`);
  return { checks, failures: failures.length };
}

let checks = 0;
let failed = 0;
for (const name of names.length > 0 ? names : Object.keys(suites)) {
  const result = await runSuite(name, suites[name]);
  checks += result.checks;
  failed += result.failures;
}
await mail.close();
console.log(
  failed
    ? `${failed} FAILED of ${checks} checks`
    : `ALL PASSED: ${checks} checks`,
);
process.exit(failed ? 1 : 0);
