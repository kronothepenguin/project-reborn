// @ts-check
// The Astro project of reborn: it serves and builds the pages of the CMS at /,
// of housekeeping at /housekeeping/ and of the installer at /installer/, in one
// dev server and one dist/.
import { cpSync, existsSync, readdirSync, renameSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import sirv from "sirv";

const root = fileURLToPath(new URL("../..", import.meta.url));

const sites = [
  { folder: "cms", base: "" },
  { folder: "housekeeping", base: "/housekeeping" },
  { folder: "installer", base: "/installer" },
];

/** Lists every .astro file under dir. */
function pages(dir) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".astro"))
    .map((file) => join(dir, file));
}

/** Turns src/pages/news/id.astro into /news/id, and index.astro into /. */
function pattern(base, file) {
  const route = file.slice(0, -".astro".length).split(sep).join("/");
  const path = route === "index" ? "" : route.replace(/(^|\/)index$/, "");
  return `${base}/${path}` || "/";
}

/** @returns {import("astro").AstroIntegration} */
function sitePages() {
  return {
    name: "reborn-site-pages",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        for (const site of sites) {
          const dir = join(root, "packages", site.folder, "src", "pages");
          for (const file of pages(dir)) {
            injectRoute({
              pattern: pattern(site.base, relative(dir, file)),
              entrypoint: file,
            });
          }
        }
      },
    },
  };
}

/**
 * Copies each site's public/ folder under its base in dist/, as the site's own
 * build does. The CMS's public/ is the project's publicDir. Astro writes the
 * route /housekeeping/ to housekeeping.html: it moves to housekeeping/index.html,
 * where the site's own build puts it.
 * @returns {import("astro").AstroIntegration}
 */
function sitePublicBuild() {
  return {
    name: "reborn-site-public-build",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const out = fileURLToPath(dir);
        for (const site of sites.filter((s) => s.base)) {
          renameSync(join(out, `${site.base}.html`), join(out, site.base, "index.html"));
          const from = join(root, "packages", site.folder, "public");
          if (existsSync(from) && statSync(from).isDirectory()) {
            cpSync(from, join(out, site.base), { recursive: true });
          }
        }
      },
    },
  };
}

/**
 * Serves each site's public/ folder under its base, as its own dev server
 * does. The CMS's public/ is the project's publicDir.
 * @returns {import("vite").Plugin}
 */
function sitePublic() {
  return {
    name: "reborn-site-public",
    configureServer(server) {
      for (const site of sites.filter((s) => s.base)) {
        const dir = join(root, "packages", site.folder, "public");
        if (existsSync(dir) && statSync(dir).isDirectory()) {
          server.middlewares.use(site.base, sirv(dir, { dev: true }));
        }
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  build: { format: "file" },
  publicDir: resolve(root, "packages/cms/public"),

  server: {
    port: 22448,
  },

  vite: {
    plugins: [tailwindcss(), sitePublic()],
    server: {
      fs: { allow: [root] },
    },
  },

  integrations: [svelte(), sitePages(), sitePublicBuild()],
});
