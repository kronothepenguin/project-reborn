import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as sleep } from "node:timers/promises";

export const root = path.resolve(import.meta.dirname, "../../..");
export const work = path.join(root, "tests/e2e/.run");
const bin = path.join(work, "bin");

// The installer's runners bake this port, so a run cannot move it.
export const installerPort = 17306;

// The game server has no pages, so it has no frontend to build. reborn runs
// every program in one process, with the pages its own project builds.
const programs = ["cms", "housekeeping", "installer", "server", "reborn"];
const frontends = ["cms", "housekeeping", "installer", "reborn"];
// The lines a program logs when it starts, and the game's line when it stops.
const banner =
  /^\S+ \S+ (?:(?:cms|housekeeping|installer) on http|INFO reborn on http:\/\/|INFO server: (?:api on http|info on ws|mus on ws):\/\/|INFO server: the hotel is closed, and its doors stay closed$|INFO server: the doors are closed$)/;

export function build() {
  mkdirSync(bin, { recursive: true });
  for (const program of programs) {
    if (frontends.includes(program)) {
      execFileSync("pnpm", ["--filter", `@project-reborn/${program}`, "build"], {
        cwd: root,
        stdio: ["ignore", "ignore", "inherit"],
      });
    }
    execFileSync(
      "go",
      [
        "build",
        "-o",
        path.join(bin, program),
        `./apps/${program}/cmd/${program}`,
      ],
      { cwd: root, stdio: "inherit" },
    );
  }
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

export function portBusy(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, "localhost");
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

export function runSQL(file, query) {
  const db = new DatabaseSync(file, { timeout: 5000 });
  try {
    const statement = db.prepare(query);
    if (statement.columns().length === 0) {
      statement.run();
      return [];
    }
    statement.setReturnArrays(true);
    return statement.all();
  } finally {
    db.close();
  }
}

// Hotel is one folder with a config.json and a database, and the programs
// running from it.
export class Hotel {
  #running = new Map();

  constructor(dir, ports) {
    this.dir = dir;
    this.ports = ports;
  }

  // #reborn reads the address reborn listens on from the hotel's config.json,
  // where the suite writes it and the installer moves it.
  #reborn() {
    const config = JSON.parse(readFileSync(path.join(this.dir, "config.json"), "utf8"));
    return config.reborn.port;
  }

  #url(program) {
    if (program === "reborn") return `http://localhost:${this.#reborn()}/`;
    if (program === "cms") return `http://localhost:${this.ports.cms}/`;
    if (program === "housekeeping")
      return `http://localhost:${this.ports.housekeeping}/housekeeping/`;
    return `http://localhost:${installerPort}/installer/`;
  }

  // #ports lists the ports a program listens on: the game server's /api/, info
  // and mus, or the one port of the others.
  #ports(program) {
    if (program === "installer") return [installerPort];
    if (program === "reborn") return [this.#reborn()];
    if (program === "server")
      return [this.ports.api, this.ports.info, this.ports.mus];
    return [this.ports[program]];
  }

  // #opened lists the ports that tell a program has started. The game server
  // keeps info and mus closed while the hotel or the site is closed, and then
  // listens on its /api/ alone.
  #opened(program) {
    if (program === "server" && this.#closed()) return [this.ports.api];
    return this.#ports(program);
  }

  #closed() {
    return this.sql(
      `SELECT 1 FROM settings WHERE key IN ('game.closed', 'site.maintenance') AND value = 'true'`,
    ).length > 0;
  }

  async start(program) {
    for (const port of this.#ports(program)) {
      if (await portBusy(port)) {
        throw new Error(`port ${port} is busy, so ${program} cannot start`);
      }
    }
    const log = openSync(path.join(this.dir, `${program}.log`), "a");
    const child = spawn(path.join(bin, program), [], {
      cwd: this.dir,
      stdio: ["ignore", log, log],
    });
    closeSync(log);
    this.#running.set(program, child);

    for (let tries = 0; tries < 100; tries++) {
      if (child.exitCode !== null) {
        throw new Error(`${program} exited: ${this.log(program)}`);
      }
      const listening = await Promise.all(this.#opened(program).map(portBusy));
      if (listening.every(Boolean)) {
        if (program !== "server") {
          await fetch(this.#url(program), { redirect: "manual" });
        }
        return;
      }
      await sleep(100);
    }
    throw new Error(`${program} did not start: ${this.log(program)}`);
  }

  // stop sends the program SIGTERM, or signal, and waits for it to exit. It
  // returns the exit code.
  async stop(program, signal = "SIGTERM") {
    const child = this.#running.get(program);
    if (!child) return null;
    this.#running.delete(program);
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill(signal);
      await exited;
    }
    return child.exitCode;
  }

  async restart(program) {
    await this.stop(program);
    await this.start(program);
  }

  async stopAll() {
    for (const program of [...this.#running.keys()]) {
      await this.stop(program);
    }
  }

  log(program) {
    const file = path.join(this.dir, `${program}.log`);
    return existsSync(file) ? readFileSync(file, "utf8") : "";
  }

  // logProblems lists what the programs logged beyond their start-up line.
  logProblems() {
    return programs.flatMap((program) =>
      this.log(program)
        .split("\n")
        .filter((line) => line !== "" && !banner.test(line))
        .map((line) => `${program}: ${line}`),
    );
  }

  sql(query) {
    return runSQL(path.join(this.dir, "habbo.db"), query);
  }
}

export function emptyFolder(name) {
  const dir = path.join(work, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function copyHotel(hotel, name) {
  const dir = emptyFolder(name);
  for (const file of ["config.json", "habbo.db"]) {
    cpSync(path.join(hotel.dir, file), path.join(dir, file));
  }
  return new Hotel(dir, hotel.ports);
}

// install runs the installer as a browser would, on an empty folder. Reading the
// database afterwards folds its write-ahead log in, so that copies need one file.
export async function install(dir, ports, mailPort) {
  const hotel = new Hotel(dir, ports);
  const post = async (step, fields) => {
    const response = await fetch(
      `http://localhost:${installerPort}/installer${step}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fields),
        redirect: "manual",
      },
    );
    if (response.status !== 303) {
      throw new Error(`installer ${step} answered ${response.status}`);
    }
  };

  await hotel.start("installer");
  try {
    await post("/config", {
      path: "habbo.db",
      port: ports.cms,
      housekeepingPort: ports.housekeeping,
    });
    await post("/site", {
      name: "Reborn Hotel",
      shortName: "Reborn",
      url: `http://localhost:${ports.cms}`,
      housekeepingUrl: `http://localhost:${ports.housekeeping}/housekeeping`,
      startCredits: "500",
      secureCookies: "on",
    });
    await post("/settings", { action: "skip" });
    await post("/client", { action: "skip" });
    await post("/admin", {
      name: "Admin-1",
      email: "admin@example.com",
      bornOn: "1990-05-01",
      password: "secret123",
      passwordConfirm: "secret123",
      credits: "5000",
    });
  } finally {
    await hotel.stop("installer");
  }

  // The game server listens on free ports too, and the CMS and housekeeping
  // find its /api/ in the same config.json.
  const file = path.join(dir, "config.json");
  const config = JSON.parse(readFileSync(file, "utf8"));
  config.server = {
    info: { host: "localhost", port: ports.info },
    mus: { host: "localhost", port: ports.mus },
    api: { host: "localhost", port: ports.api },
  };
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);

  hotel.sql(`INSERT INTO settings (key, value, updated_at) VALUES
    ('mail.host', '"127.0.0.1"', '2026-11-01 00:00:00'),
    ('mail.port', '${mailPort}', '2026-11-01 00:00:00'),
    ('mail.from', '"hotel@example.com"', '2026-11-01 00:00:00')`);
  return hotel;
}
