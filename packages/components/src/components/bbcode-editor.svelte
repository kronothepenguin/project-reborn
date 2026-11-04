<script lang="ts">
  import { onMount } from "svelte";
  import { address as linkAddress, colours, faces, flatten, measure, offset, pointAt, quoteClass, read, sizes, smileyBase, write } from "../bbcode";

  // A WYSIWYG editor of the BBCode the CMS renders (decision 0092). The area
  // shows read's HTML and every change is written back as BBCode; after a
  // change of the toolbar, or a browser's change that leaves other markup, the
  // area is drawn again from that BBCode, so it only holds what the site can
  // show. Drawing it again empties the browser's undo, so the editor keeps its
  // own. With field, it stands in for that textarea, which keeps the BBCode for
  // its form and stays the plain field without JavaScript; without a label and
  // rows of its own, it takes the field's. With maxLength, a change that makes
  // the BBCode longer is turned away, as a textarea's maxlength turns it away.
  interface Props {
    value?: string;
    field?: string;
    smilies?: boolean;
    variant?: "site" | "housekeeping";
    label?: string;
    rows?: number;
    maxLength?: number;
  }

  let { value = $bindable(""), field, smilies = false, variant = "site", label, rows, maxLength }: Props = $props();

  type Toggle = "bold" | "italic" | "underline" | "strikeThrough";
  type State = { value: string; start: number; end: number };

  const toggles: { command: Toggle; text: string; name: string; look: string }[] = [
    { command: "bold", text: "B", name: "Bold", look: "font-bold" },
    { command: "italic", text: "I", name: "Italic", look: "italic" },
    { command: "underline", text: "U", name: "Underline", look: "underline" },
    { command: "strikeThrough", text: "S", name: "Strike", look: "line-through" },
  ];

  const looks = {
    site: {
      button:
        "cursor-pointer border bg-white px-1 hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-default disabled:opacity-50 aria-pressed:bg-stone-300",
      select: "border bg-white",
      area: "w-full border border-neutral-500 bg-white p-1",
    },
    housekeeping: {
      button:
        "cursor-pointer border border-black bg-olive-200 px-2 py-0.5 font-bold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-default disabled:opacity-50 aria-pressed:bg-sky-700 aria-pressed:text-white",
      select: "border border-black bg-white",
      area: "w-full border border-neutral-600 bg-white p-1",
    },
  } as const;

  const look = $derived(looks[variant]);
  const content = "block resize-y overflow-auto break-words [&_a]:underline";

  let fieldLabel = $state("");
  let fieldRows = $state(0);
  const name = $derived(label ?? (fieldLabel || "Text"));
  const lines = $derived(rows ?? (fieldRows || 5));

  let area = $state<HTMLDivElement>();
  let source = $state(false);
  let linking = $state(false);
  let address = $state("http://");
  let linkError = $state("");
  let inLink = $state(false);
  let active = $state<Record<Toggle, boolean>>({ bold: false, italic: false, underline: false, strikeThrough: false });

  let target: HTMLTextAreaElement | null = null;
  let shown = "";
  let saved: [number, number] = [0, 0];
  let lastInput: State = { value: "", start: 0, end: 0 };
  let past: State[] = [];
  let future: State[] = [];
  let typing = false;
  let typingTimer: ReturnType<typeof setTimeout> | undefined;

  function selection(): [number, number] | null {
    const current = document.getSelection();
    if (!area || !current || current.rangeCount === 0) return null;
    const range = current.getRangeAt(0);
    if (!area.contains(range.startContainer) || !area.contains(range.endContainer)) return null;
    return [offset(area, range.startContainer, range.startOffset), offset(area, range.endContainer, range.endOffset)];
  }

  function select(start: number, end: number, forward = start < end) {
    if (!area) return;
    const [a, at] = pointAt(area, start, forward);
    const [b, bt] = start === end ? [a, at] : pointAt(area, end);
    document.getSelection()?.setBaseAndExtent(a, at, b, bt);
  }

  function snapshot(): State {
    const [start, end] = selection() ?? saved;
    return { value: shown, start, end };
  }

  function commit(text: string) {
    shown = text;
    value = text;
    if (target) target.value = text;
  }

  function draw(text: string) {
    if (!area) return;
    area.innerHTML = read(text, smilies);
    shown = text;
  }

  function rewrite() {
    if (!area) return;
    const [start, end] = selection() ?? saved;
    const text = write(area);
    commit(text);
    draw(text);
    select(start, end);
    saved = [start, end];
  }

  function fits(text: string): boolean {
    return maxLength === undefined || [...text].length <= maxLength;
  }

  function goBack(to: State) {
    draw(to.value);
    select(to.start, to.end);
    saved = [to.start, to.end];
  }

  function remember(before: State) {
    past.push(before);
    future = [];
  }

  function endTyping() {
    typing = false;
    clearTimeout(typingTimer);
  }

  // change runs a change of the toolbar on the selection the area last had.
  function change(apply: (range: Range) => void) {
    if (!area || source) return;
    endTyping();
    area.focus();
    select(...saved);
    const before = { value: shown, start: saved[0], end: saved[1] };
    const range = document.getSelection()?.getRangeAt(0);
    if (!range) return;
    apply(range);
    if (!fits(write(area))) {
      goBack(before);
      return;
    }
    rewrite();
    remember(before);
    refresh();
  }

  function toggle(command: Toggle) {
    if (!area || source) return;
    area.focus();
    select(...saved);
    if (document.getSelection()?.isCollapsed) {
      // With nothing selected, the browser only sets what the next typing
      // looks like.
      document.execCommand(command);
      refresh();
      return;
    }
    change(() => {
      document.execCommand("styleWithCSS", false, "false");
      document.execCommand(command);
    });
  }

  // wrap puts the selection in element; with nothing selected, it puts an
  // empty element at the caret, and the caret in it.
  function wrap(element: HTMLElement) {
    const empty = saved[0] === saved[1];
    change((range) => {
      if (empty) {
        element.append(document.createElement("br"));
      } else {
        element.append(range.extractContents());
      }
      range.insertNode(element);
    });
    if (empty) {
      select(saved[0], saved[0], true);
      saved = [saved[0], saved[0]];
    }
  }

  function box(kind: "quote" | "code") {
    const element = document.createElement(kind === "quote" ? "div" : "pre");
    if (kind === "quote") element.className = quoteClass;
    wrap(element);
  }

  function paint(className: string) {
    if (saved[0] === saved[1]) return;
    const font = document.createElement("font");
    font.className = className;
    wrap(font);
  }

  function smiley(face: (typeof faces)[number]) {
    change((range) => {
      const img = document.createElement("img");
      img.setAttribute("data-code", face.code);
      range.deleteContents();
      range.insertNode(img);
    });
    select(saved[1], saved[1]);
    saved = [saved[1], saved[1]];
  }

  function enclosingLink(): HTMLAnchorElement | null {
    const node = document.getSelection()?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const link = element?.closest("a");
    return link && area?.contains(link) ? link : null;
  }

  function openLink() {
    if (source) return;
    const link = enclosingLink();
    inLink = link !== null;
    address = link?.getAttribute("href") ?? "http://";
    linkError = "";
    linking = true;
  }

  function addLink() {
    const href = linkAddress(address);
    if (!href) {
      linkError = "The address must start with http:// or https://.";
      return;
    }
    linking = false;
    change((range) => {
      if (range.collapsed) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        range.insertNode(a);
        return;
      }
      document.execCommand("createLink", false, href);
    });
  }

  function removeLink() {
    linking = false;
    change(() => {
      const link = enclosingLink();
      if (link) link.replaceWith(...link.childNodes);
    });
  }

  function undo() {
    endTyping();
    const s = past.pop();
    if (!s) return;
    future.push(snapshot());
    restore(s);
  }

  function redo() {
    endTyping();
    const s = future.pop();
    if (!s) return;
    past.push(snapshot());
    restore(s);
  }

  function restore(s: State) {
    commit(s.value);
    draw(s.value);
    select(s.start, s.end);
    saved = [s.start, s.end];
  }

  function lineBreak() {
    if (!document.execCommand("insertLineBreak")) document.execCommand("insertHTML", false, "<br>");
  }

  function keydown(event: KeyboardEvent) {
    const command = event.ctrlKey || event.metaKey;
    if (command && !event.altKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    } else if (command && !event.altKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
    }
  }

  function beforeinput(event: InputEvent) {
    const kind = event.inputType;
    lastInput = snapshot();
    if (kind === "historyUndo" || kind === "historyRedo") {
      event.preventDefault();
      if (kind === "historyUndo") undo();
      else redo();
      return;
    }
    if (kind === "insertParagraph") {
      // Holo's text knows line breaks only, and a browser's Enter makes blocks.
      event.preventDefault();
      endTyping();
      remember(snapshot());
      queueMicrotask(lineBreak);
      return;
    }
    if (kind.startsWith("insert") || kind.startsWith("delete")) {
      if (!typing) remember(snapshot());
      typing = true;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(endTyping, 1000);
    } else {
      endTyping();
      remember(snapshot());
    }
  }

  // What read writes. Anything else a browser's editing leaves makes the editor
  // draw the area again, so that it shows what the site will.
  const foreign = `:not(strong, em, u, s, a[href], font[class], div[class="${quoteClass}"], pre, br, img[data-code]), [style]`;

  function input(event: Event) {
    if (!area) return;
    const composing = (event as InputEvent).isComposing;
    const text = write(area);
    if (!composing && !fits(text)) {
      goBack(lastInput);
      return;
    }
    if (!composing && area.querySelector(foreign)) {
      rewrite();
    } else {
      commit(text);
    }
    refresh();
  }

  function insert(text: string) {
    if (!area || source || !text) return;
    endTyping();
    const before = snapshot();
    const range = document.getSelection()?.getRangeAt(0);
    if (!range || !area.contains(range.startContainer)) return;
    range.deleteContents();
    const start = offset(area, range.startContainer, range.startOffset);
    const around = flatten(area);
    if (text.startsWith("\n") && (start === 0 || around[start - 1] === "\n")) text = text.slice(1);
    if (text.endsWith("\n") && (start === around.length || around[start] === "\n")) text = text.slice(0, -1);
    const fragment = range.createContextualFragment(read(text, smilies));
    const length = measure(fragment);
    range.insertNode(fragment);
    const next = write(area);
    if (!fits(next)) {
      goBack(before);
      return;
    }
    commit(next);
    draw(next);
    select(start + length, start + length);
    saved = [start + length, start + length];
    remember(before);
  }

  function paste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData;
    if (!data) return;
    const html = data.getData("text/html");
    insert(
      html
        ? write(new DOMParser().parseFromString(html, "text/html").body, true)
        : data.getData("text/plain").replace(/\r\n?/g, "\n"),
    );
  }

  function refresh() {
    if (!area) return;
    const current = selection();
    if (!current) return;
    saved = current;
    for (const t of toggles) active[t.command] = document.queryCommandState(t.command);
  }

  function showSource() {
    if (source) {
      if (value !== shown) {
        remember({ value: shown, start: saved[0], end: saved[1] });
        draw(value);
      }
      source = false;
      return;
    }
    endTyping();
    linking = false;
    source = true;
  }

  function edited() {
    if (target) target.value = value;
  }

  $effect(() => {
    if (area && !source && value !== shown) draw(value);
  });

  onMount(() => {
    if (field) {
      target = document.getElementById(field) as HTMLTextAreaElement | null;
      if (target) {
        value = target.value;
        target.hidden = true;
        fieldLabel = target.labels?.[0]?.textContent?.trim() ?? "";
        fieldRows = target.rows;
      }
    }
    draw(value);
    const changed = () => refresh();
    document.addEventListener("selectionchange", changed);
    return () => {
      document.removeEventListener("selectionchange", changed);
      clearTimeout(typingTimer);
      if (target) target.hidden = false;
    };
  });
</script>

<div class="flex flex-col gap-1">
  <div role="toolbar" aria-label="Formatting" class="flex flex-wrap items-center gap-1">
    {#each toggles as t (t.command)}
      <button
        type="button"
        aria-label={t.name}
        aria-pressed={active[t.command]}
        disabled={source}
        onmousedown={(event) => event.preventDefault()}
        onclick={() => toggle(t.command)}
        class="{look.button} {t.look}">{t.text}</button
      >
    {/each}
    <button type="button" disabled={source} onmousedown={(event) => event.preventDefault()} onclick={() => box("quote")} class={look.button}
      >Quote</button
    >
    <button type="button" disabled={source} onmousedown={(event) => event.preventDefault()} onclick={() => box("code")} class={look.button}
      >Code</button
    >
    <button type="button" disabled={source} onmousedown={(event) => event.preventDefault()} onclick={openLink} class={look.button}
      >Link</button
    >
    <select
      aria-label="Colours"
      disabled={source}
      class={look.select}
      onchange={(event) => {
        const chosen = colours.find((c) => c.name === event.currentTarget.value);
        event.currentTarget.value = "";
        if (chosen) paint(chosen.className);
      }}
    >
      <option value="">Colours</option>
      {#each colours as c (c.name)}
        <option value={c.name}>{c.label}</option>
      {/each}
    </select>
    {#each sizes as z (z.name)}
      <button type="button" disabled={source} onmousedown={(event) => event.preventDefault()} onclick={() => paint(z.className)} class={look.button}
        >{z.label}</button
      >
    {/each}
    {#if smilies}
      {#each faces as face (face.code)}
        <button
          type="button"
          aria-label="Smiley {face.code}"
          title={face.code}
          disabled={source}
          onmousedown={(event) => event.preventDefault()}
          onclick={() => smiley(face)}
          class={look.button}><img src="{smileyBase}{face.image}.gif" alt="" class="inline align-baseline" /></button
        >
      {/each}
    {/if}
    <button type="button" aria-pressed={source} onclick={showSource} class={look.button}>BBCode</button>
  </div>
  {#if linking}
    <div role="group" aria-label="Link" class="flex flex-wrap items-center gap-1">
      <label class="flex items-center gap-1"
        >Address <input
          type="text"
          class="border border-neutral-500 bg-white px-1"
          bind:value={address}
          onkeydown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addLink();
            } else if (event.key === "Escape") {
              linking = false;
            }
          }}
        /></label
      >
      <button type="button" onclick={addLink} class={look.button}>Add link</button>
      {#if inLink}
        <button type="button" onclick={removeLink} class={look.button}>Remove link</button>
      {/if}
      <button type="button" onclick={() => (linking = false)} class={look.button}>Cancel</button>
      {#if linkError}
        <p role="alert" class="w-full text-red-600">{linkError}</p>
      {/if}
    </div>
  {/if}
  <div
    bind:this={area}
    contenteditable={!source}
    hidden={source}
    role="textbox"
    tabindex="0"
    aria-multiline="true"
    aria-label={name}
    class="{look.area} {content}"
    style:min-height="{lines * 1.5}em"
    onkeydown={keydown}
    onbeforeinput={beforeinput}
    oninput={input}
    onpaste={paste}
  ></div>
  {#if source}
    <textarea aria-label="{name} (BBCode)" rows={lines} maxlength={maxLength} class={look.area} bind:value oninput={edited}></textarea>
  {/if}
</div>
