<script lang="ts">
  import { onMount } from "svelte";

  // The client page's script: Holo's habboclient.js (HabboClientUtils.init and
  // showLoader) around LibreShockwave's player, which runs the client in place
  // of Adobe's plugin. The player's own navigation follows the client's
  // connection failed, fatal error and reload addresses.

  interface Player {
    destroy(): void;
  }

  interface PlayerOptions {
    url: string;
    params: Record<string, string>;
    basePath: string;
    websocketPath: string;
    autoload: boolean;
    autoplay: boolean;
    onLoad(): void;
  }

  type PlayerGlobal = { create(canvas: HTMLCanvasElement, options: PlayerOptions): Player };

  const playerPath = "/libreshockwave/";
  const loaderTick = 500;

  function loadPlayer(): Promise<PlayerGlobal> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = playerPath + "libreshockwave-cpp-player.js";
      script.onload = () => {
        const player = (window as unknown as { LibreShockwavePlayer?: PlayerGlobal }).LibreShockwavePlayer;
        if (player) resolve(player);
        else reject(new Error("LibreShockwave's player is missing"));
      };
      script.onerror = () => reject(new Error("LibreShockwave's player could not be loaded"));
      document.head.append(script);
    });
  }

  // habboclient.js's resizeWin: the top bar shows on a screen taller than 600
  // pixels, and a window the site opened fits itself around the page.
  function resizeWin() {
    const topbar = document.getElementById("client-topbar");
    if (topbar && screen.height > 600) topbar.hidden = false;
    if (window.opener == null) return;
    try {
      window.resizeTo(document.documentElement.scrollWidth, document.documentElement.scrollHeight);
    } catch {}
    window.setTimeout(() => {
      const page = document.documentElement;
      try {
        window.resizeBy(page.scrollWidth - window.innerWidth, page.scrollHeight - window.innerHeight);
      } catch {}
    }, 500);
  }

  // The loader's four texts, padded so that the text keeps its width.
  function loaderTexts(shortName: string): string[] {
    const space = " ";
    return [0, 1, 2, 3].map((dots) => `opening ${shortName}${".".repeat(dots)}${space.repeat(3 - dots)}`);
  }

  onMount(() => {
    window.name = "client";

    const embed = document.getElementById("clientembed");
    const canvas = document.getElementById("client-stage") as HTMLCanvasElement | null;
    const loader = document.getElementById("clientembed-loader");
    const params: Record<string, string> = {};
    for (const param of document.querySelectorAll<HTMLDataElement>("#client-params data")) {
      params[param.textContent ?? ""] = param.value;
    }

    let tick = 0;
    let timer: number | undefined;
    const hideLoader = () => {
      window.clearInterval(timer);
      if (loader) loader.hidden = true;
    };
    if (loader) {
      const texts = loaderTexts(embed?.dataset.shortName ?? "");
      const label = loader.querySelector("b");
      loader.hidden = false;
      timer = window.setInterval(() => {
        tick = (tick + 1) % texts.length;
        if (label) label.textContent = texts[tick];
      }, loaderTick);
    }

    let player: Player | undefined;
    let destroyed = false;
    if (embed && canvas) {
      loadPlayer()
        .then((LibreShockwavePlayer) => {
          if (destroyed) return;
          player = LibreShockwavePlayer.create(canvas, {
            url: embed.dataset.movie ?? "",
            params,
            basePath: new URL(playerPath, location.href).href,
            websocketPath: "",
            autoload: true,
            autoplay: true,
            onLoad: hideLoader,
          });
        })
        .catch((error: unknown) => {
          hideLoader();
          console.error(error);
        });
    }

    const onLoad = () => resizeWin();
    if (document.readyState === "complete") resizeWin();
    else window.addEventListener("load", onLoad, { once: true });

    // clearOpener: the page that opened the hotel forgets it.
    const clearOpener = () => {
      try {
        const opener = window.opener as { openedHabbo?: unknown } | null;
        if (opener?.openedHabbo) opener.openedHabbo = null;
      } catch {}
    };
    // addClientUnloadHook: the site hears that the client closes.
    const unload = () => {
      clearOpener();
      navigator.sendBeacon("/client/unload");
    };
    window.addEventListener("pagehide", unload);

    // Backspace never leaves the hotel.
    const keypress = (event: KeyboardEvent) => {
      if (event.key === "Backspace") event.preventDefault();
    };
    document.addEventListener("keypress", keypress);

    // The top bar's Close Hotel.
    const close = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-close]")) return;
      event.preventDefault();
      window.close();
    };
    document.addEventListener("click", close);

    return () => {
      destroyed = true;
      hideLoader();
      player?.destroy();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pagehide", unload);
      document.removeEventListener("keypress", keypress);
      document.removeEventListener("click", close);
    };
  });
</script>
