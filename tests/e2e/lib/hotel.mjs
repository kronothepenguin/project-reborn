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

const programs = ["cms", "housekeeping", "installer"];
const banner = /^\S+ \S+ (cms|housekeeping|installer) on http/;

export function build() {
  mkdirSync(bin, { recursive: true });
  for (const program of programs) {
    execFileSync("pnpm", ["--filter", `@project-reborn/${program}`, "build"], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"],
    });
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

  #url(program) {
    if (program === "cms") return `http://localhost:${this.ports.cms}/`;
    if (program === "housekeeping")
      return `http://localhost:${this.ports.housekeeping}/housekeeping/`;
    return `http://localhost:${installerPort}/`;
  }

  #port(program) {
    return program === "installer" ? installerPort : this.ports[program];
  }

  async start(program) {
    if (await portBusy(this.#port(program))) {
      throw new Error(
        `port ${this.#port(program)} is busy, so ${program} cannot start`,
      );
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
      if (await portBusy(this.#port(program))) {
        await fetch(this.#url(program), { redirect: "manual" });
        return;
      }
      await sleep(100);
    }
    throw new Error(`${program} did not start: ${this.log(program)}`);
  }

  async stop(program) {
    const child = this.#running.get(program);
    if (!child) return;
    this.#running.delete(program);
    if (child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
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
    const response = await fetch(`http://localhost:${installerPort}${step}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
      redirect: "manual",
    });
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
    await post("/admin", {
      name: "Admin-1",
      email: "admin@example.com",
      bornOn: "1990-05-01",
      password: "secret123",
      passwordConfirm: "secret123",
    });
  } finally {
    await hotel.stop("installer");
  }

  hotel.sql(`INSERT INTO settings (key, value, updated_at) VALUES
    ('mail.host', '"127.0.0.1"', '2026-11-01 00:00:00'),
    ('mail.port', '${mailPort}', '2026-11-01 00:00:00'),
    ('mail.from', '"hotel@example.com"', '2026-11-01 00:00:00')`);
  return hotel;
}
