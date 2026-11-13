# Log

## 2026-11-13

- **Merged** the plan of habbos, platform and the client, decisions 0003 to 0014;
  [platform-01](/tasks/platform-01-drop-the-unused-listener.md)'s commit rebuilt without the 19 MB program
  `apps/server/server` it had added by mistake, and built programs and `packages/cms/public/r26/` ignored.
- **Slice** [Habbos](/slices/habbos.md) is active, with its tasks; [the client](/slices/client.md) is active for its
  client page; [platform](/slices/platform.md) has its tasks. New and planned: [assets](/slices/assets.md),
  [club](/slices/club.md), [rooms](/slices/rooms.md) and [navigator](/slices/navigator.md); credits and club became
  [economy](/slices/economy.md), furni and the catalogue [furnis](/slices/furnis.md), friends and the messenger
  [messenger](/slices/messenger.md).
- **Decision** [0014](/decisions/0014-the-backend-template-keeps-its-http-server.md): the backend template of
  tools/create keeps its HTTP server.
- **Decision** [0013](/decisions/0013-a-habbos-look-and-motto-reach-the-game-at-once.md): a habbo's look and motto reach
  the game at once, from wherever they change.
- **Decision** [0012](/decisions/0012-the-client-page-ports-holos-on-libreshockwave.md): the client page ports Holo's,
  with LibreShockwave in place of Adobe's plugin.
- **Decision** [0011](/decisions/0011-no-habbo-files-in-the-repository.md): no Habbo files in the repository; a tool
  fetches them.
- **Decision** [0010](/decisions/0010-slices-follow-the-hotels-features.md): slices follow the hotel's own features, and
  habbos comes first.
- **Decision** [0009](/decisions/0009-one-dev-server-for-reborn.md): reborn's dev runner proxies one Astro dev server
  for every site, after a spike proves it.
- **Decision** [0008](/decisions/0008-releases-ship-reborn-and-the-separate-programs.md): releases ship reborn and the
  four separate programs.
- **Decision** [0007](/decisions/0007-reborn-stops-in-order.md): reborn stops in order.
- **Decision** [0006](/decisions/0006-settings-are-read-from-the-store.md): every program reads settings from the store,
  and nothing refreshes.
- **Decision** [0005](/decisions/0005-the-game-hears-live-changes-through-services.md): the game hears of live changes
  through services.
- **Decision** [0004](/decisions/0004-the-installer-inside-reborn.md): inside reborn the installer lives under
  /installer/, moves the hotel to the address it is given, and goes once installed.
- **Decision** [0003](/decisions/0003-reborn-runs-the-hotel-in-one-process.md): reborn runs the hotel in one process,
  and the separate programs stay.
- **Merged** [platform-01](/tasks/platform-01-drop-the-unused-listener.md): the game server's unused HTTP listener on
  15445 is gone.
- **Slice** [Platform](/slices/platform.md) is active, with its first task; twelve more slices are planned or parked
  ([the index](/slices/index.md)).
- **Decision** [0002](/decisions/0002-a-coordinator-shares-tasks-and-merges-in-batches.md): a coordinator shares tasks
  with sub-agents and merges in batches.
- **Decision** [0001](/decisions/0001-plans-are-feature-slices-in-one-bundle.md): plans are feature slices in one
  bundle.
