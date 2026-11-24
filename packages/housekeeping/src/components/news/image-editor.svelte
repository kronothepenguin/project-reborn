<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  // The news form's topstory field is the element named field. This makes a
  // 300x187 picture, uploads it, and puts its path in that field, whose input
  // event moves the form's preview. Islands get no [[ ]] values, so the uploaded
  // pictures and site.url come from the list named uploads.
  interface Props {
    field: string;
    uploads: string;
  }

  type Mode = "cut" | "fit" | "uploaded";

  const width = 300;
  const height = 187;
  const maxZoom = 4;
  const nudgeStep = 10;
  const failure = "The picture could not be uploaded.";
  const button =
    "cursor-pointer border border-black bg-olive-200 px-2.5 py-0.5 font-bold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-50 aria-pressed:bg-sky-700 aria-pressed:text-white";
  const thumbnail =
    "cursor-pointer border-2 border-transparent hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black aria-pressed:border-sky-700";

  let { field, uploads }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let file = $state.raw<File | null>(null);
  let picture = $state.raw<ImageBitmap | null>(null);
  let kept = $state("");
  let mode = $state<Mode>("cut");
  let zoom = $state(1);
  let left = $state(0);
  let top = $state(0);
  let message = $state("");
  let failed = $state(false);
  let uploading = $state(false);
  let site = $state("");
  let paths = $state<string[]>([]);
  let current = $state("");
  let drag: { pointer: number; x: number; y: number } | null = null;

  function topstory() {
    return document.getElementById(field) as HTMLInputElement;
  }

  onMount(() => {
    const list = document.getElementById(uploads) as HTMLElement;
    site = list.dataset.site ?? "";
    paths = [...list.querySelectorAll("li")].map(
      (item) => item.textContent?.trim() ?? "",
    );
    const input = topstory();
    const follow = () => (current = input.value.trim());
    follow();
    input.addEventListener("input", follow);
    return () => input.removeEventListener("input", follow);
  });

  function scale() {
    if (!picture) return 1;
    const across = width / picture.width;
    const down = height / picture.height;
    return mode === "cut"
      ? Math.max(across, down) * zoom
      : Math.min(across, down);
  }

  // In Cut the picture always covers the frame; in Fit it sits in the middle.
  function place(x: number, y: number) {
    if (!picture) return;
    const drawnWidth = picture.width * scale();
    const drawnHeight = picture.height * scale();
    if (mode === "fit") {
      left = (width - drawnWidth) / 2;
      top = (height - drawnHeight) / 2;
      return;
    }
    left = Math.min(0, Math.max(width - drawnWidth, x));
    top = Math.min(0, Math.max(height - drawnHeight, y));
  }

  function center() {
    if (!picture) return;
    place(
      (width - picture.width * scale()) / 2,
      (height - picture.height * scale()) / 2,
    );
  }

  $effect(() => {
    const context = canvas?.getContext("2d");
    if (!context || !picture) return;
    context.clearRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      picture,
      left,
      top,
      picture.width * scale(),
      picture.height * scale(),
    );
  });

  // A GIF of exactly 300x187, read from its header, goes up as it is, so that
  // its animation stays.
  async function keptAsIs(chosen: File) {
    const head = new Uint8Array(await chosen.slice(0, 10).arrayBuffer());
    const signature = String.fromCharCode(...head.subarray(0, 6));
    return (
      (signature === "GIF87a" || signature === "GIF89a") &&
      (head[6] | (head[7] << 8)) === width &&
      (head[8] | (head[9] << 8)) === height
    );
  }

  function clear() {
    if (kept) URL.revokeObjectURL(kept);
    picture?.close();
    file = null;
    picture = null;
    kept = "";
    message = "";
    failed = false;
  }

  function fail(text: string) {
    failed = true;
    message = text;
  }

  // The field's input event moves the preview and the pressed thumbnail.
  function fill(path: string) {
    const input = topstory();
    input.value = path;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function choose(event: Event) {
    const chosen = (event.currentTarget as HTMLInputElement).files?.[0];
    clear();
    if (mode === "uploaded") mode = "cut";
    if (!chosen) return;
    file = chosen;
    if (await keptAsIs(chosen)) {
      kept = URL.createObjectURL(chosen);
      return;
    }
    try {
      picture = await createImageBitmap(chosen);
    } catch {
      file = null;
      fail("This file is not a picture.");
      return;
    }
    mode = "cut";
    zoom = 1;
    center();
  }

  function switchTo(next: Mode) {
    mode = next;
    message = "";
    failed = false;
    if (next === "uploaded") return;
    zoom = 1;
    center();
  }

  // Zooming keeps the middle of the frame on the same spot of the picture.
  function zoomTo(next: number) {
    const before = scale();
    zoom = next;
    const ratio = scale() / before;
    place(
      width / 2 - (width / 2 - left) * ratio,
      height / 2 - (height / 2 - top) * ratio,
    );
  }

  function grab(event: PointerEvent) {
    if (mode !== "cut" || !canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function move(event: PointerEvent) {
    if (!drag || drag.pointer !== event.pointerId) return;
    place(left + event.clientX - drag.x, top + event.clientY - drag.y);
    drag = { pointer: drag.pointer, x: event.clientX, y: event.clientY };
  }

  function release(event: PointerEvent) {
    if (drag?.pointer === event.pointerId) drag = null;
  }

  function nudge(event: KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-nudgeStep, 0],
      ArrowRight: [nudgeStep, 0],
      ArrowUp: [0, -nudgeStep],
      ArrowDown: [0, nudgeStep],
    };
    const by = moves[event.key];
    if (mode !== "cut" || !by) return;
    event.preventDefault();
    place(left + by[0], top + by[1]);
  }

  function exported(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!canvas) resolve(null);
      else canvas.toBlob(resolve, "image/png");
    });
  }

  async function use() {
    if (!file) return;
    uploading = true;
    message = "";
    failed = false;
    try {
      const body = kept ? file : await exported();
      if (!body) {
        fail(failure);
        return;
      }
      const response = await fetch("/housekeeping/news/images", {
        method: "POST",
        headers: {
          "Content-Type": body.type || "application/octet-stream",
          Accept: "application/json",
        },
        body,
      });
      const json = response.headers.get("Content-Type") === "application/json";
      const answer: { path?: string; error?: string } = json
        ? await response.json()
        : {};
      if (!response.ok || !answer.path) {
        fail(answer.error ?? failure);
        return;
      }
      const path = answer.path;
      paths = [path, ...paths.filter((other) => other !== path)];
      fill(path);
      message = "Uploaded as the topstory image. Save the article to keep it.";
    } catch {
      fail(failure);
    } finally {
      uploading = false;
    }
  }

  function pick(path: string) {
    fill(path);
    failed = false;
    message = "Chosen as the topstory image. Save the article to keep it.";
  }

  onDestroy(clear);
</script>

<div class="flex flex-col items-start gap-1.5">
  <input
    id="news-image-file"
    type="file"
    accept="image/*"
    aria-label="Picture"
    onchange={choose}
  />
  <div class="flex flex-wrap items-center gap-2.5">
    <button
      type="button"
      aria-pressed={mode === "cut"}
      onclick={() => switchTo("cut")}
      class={button}>Cut</button
    >
    <button
      type="button"
      aria-pressed={mode === "fit"}
      onclick={() => switchTo("fit")}
      class={button}>Fit</button
    >
    <button
      type="button"
      aria-pressed={mode === "uploaded"}
      onclick={() => switchTo("uploaded")}
      class={button}>Uploaded</button
    >
    {#if mode === "cut" && picture}
      <label class="flex items-center gap-1.5">
        Zoom
        <input
          type="range"
          min="1"
          max={maxZoom}
          step="0.01"
          value={zoom}
          oninput={(event) => zoomTo(Number(event.currentTarget.value))}
        />
      </label>
    {/if}
  </div>
  {#if mode === "uploaded"}
    {#if paths.length === 0}
      <p>No pictures were uploaded yet.</p>
    {:else}
      <ul class="flex flex-wrap gap-1.5" aria-label="Uploaded pictures">
        {#each paths as path (path)}
          <li>
            <button
              type="button"
              aria-pressed={path === current}
              onclick={() => pick(path)}
              class={thumbnail}
            >
              <img
                src={site + path}
                alt={path}
                width="150"
                height="94"
                loading="lazy"
                class="block h-[94px] w-[150px] bg-olive-300"
              />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  {:else if kept}
    <img
      src={kept}
      alt="The GIF to upload"
      {width}
      {height}
      class="border border-neutral-600 bg-olive-300"
    />
    <p>
      This GIF is already 300x187, so it goes up as it is, with its animation.
    </p>
  {:else if picture}
    <canvas
      bind:this={canvas}
      {width}
      {height}
      tabindex="0"
      aria-label="The picture to upload"
      onpointerdown={grab}
      onpointermove={move}
      onpointerup={release}
      onpointercancel={release}
      onkeydown={nudge}
      class={[
        "touch-none border border-neutral-600 bg-olive-300",
        mode === "cut" && "cursor-move",
      ]}
    ></canvas>
  {/if}
  {#if mode !== "uploaded" && (kept || picture)}
    <button type="button" disabled={uploading} onclick={use} class={button}
      >Use this picture</button
    >
  {/if}
  {#if message}
    <p role={failed ? "alert" : "status"} class={failed ? "text-red-600" : ""}>
      <strong>{message}</strong>
    </p>
  {/if}
</div>
