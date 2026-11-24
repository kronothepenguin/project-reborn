// BBCode as the CMS renders it (packages/cms/internal/bbcode), for the editor.
// read runs Holo's passes as the Go renderer does and leaves the nesting of
// their HTML to the browser, whose tree construction the renderer emulates, so
// the editor shows what the site shows. Colours and sizes are <font> elements,
// as in Holo's HTML, because the parser nests a <span> differently. write turns
// an editor's DOM, or pasted HTML, back into BBCode.

export const colours = [
  { name: "red", label: "Red", className: "text-red-600" },
  { name: "orange", label: "Orange", className: "text-orange-500" },
  { name: "yellow", label: "Yellow", className: "text-amber-300" },
  { name: "green", label: "Green", className: "text-lime-525" },
  { name: "cyan", label: "Cyan", className: "text-teal-450" },
  { name: "blue", label: "Blue", className: "text-blue-550" },
  { name: "gray", label: "Grey", className: "text-neutral-475" },
  { name: "black", label: "Black", className: "text-black" },
] as const;

export const sizes = [
  { name: "small", label: "Small", className: "text-[10px]" },
  { name: "large", label: "Large", className: "text-base" },
] as const;

export const quoteClass = "bg-stone-300 border border-black m-[3px] mb-2.5 p-[5px]";

export const smileyBase = "/smilies/";

// In the order of Holo's str_replace calls; no two codes overlap.
const smileyCodes = [
  [":)", "smile"],
  [";)", "wink"],
  [":P", "tongue"],
  [";P", "winktongue"],
  [":p", "tongue"],
  [";p", "winktongue"],
  ["(L)", "heart"],
  ["(l)", "heart"],
  [":o", "shocked"],
  [":O", "shocked"],
] as const;

// The toolbar offers each picture once, with its first code.
export const faces = [
  { code: ":)", image: "smile" },
  { code: ";)", image: "wink" },
  { code: ":P", image: "tongue" },
  { code: ";P", image: "winktongue" },
  { code: "(L)", image: "heart" },
  { code: ":o", image: "shocked" },
] as const;

type Markup = (value: string) => [string, string];

interface Tag {
  open: string;
  close: string;
  element: string;
  markup: Markup;
}

type Token =
  | { kind: "text"; text: string }
  | { kind: "smiley"; code: string; image: string }
  | { kind: "break" }
  | { kind: "start"; tag: Tag; value: string }
  | { kind: "end"; tag: Tag };

const fixed =
  (start: string, end: string): Markup =>
  () => [start, end];

// address keeps an address only when it is http or https once a browser has
// cleaned it up, as the renderer's link does.
export function address(value: string | null): string {
  if (value === null) return "";
  let start = 0;
  let end = value.length;
  while (start < end && value.charCodeAt(start) <= 32) start++;
  while (end > start && value.charCodeAt(end - 1) <= 32) end--;
  const cleaned = value.slice(start, end).replace(/[\t\n\r]/g, "");
  return hasPrefix(cleaned, "http://") || hasPrefix(cleaned, "https://") ? cleaned : "";
}

const link: Markup = (value) => {
  const href = address(value);
  return href ? [`<a href="${escapeAttribute(href)}">`, "</a>"] : ["<a>", "</a>"];
};

const colour: Markup = (value) => {
  const name = value.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, "");
  const found = colours.find((c) => name.length === c.name.length && hasPrefix(name, c.name));
  return found ? [`<font class="${found.className}">`, "</font>"] : ["<font>", "</font>"];
};

const tags: Tag[] = [
  { open: "[b]", close: "[/b]", element: "strong", markup: fixed("<strong>", "</strong>") },
  { open: "[i]", close: "[/i]", element: "em", markup: fixed("<em>", "</em>") },
  { open: "[u]", close: "[/u]", element: "u", markup: fixed("<u>", "</u>") },
  { open: "[s]", close: "[/s]", element: "s", markup: fixed("<s>", "</s>") },
  { open: "[quote]", close: "[/quote]", element: "div", markup: fixed(`<div class="${quoteClass}">`, "</div>") },
  { open: "[link=", close: "[/link]", element: "a", markup: link },
  { open: "[url=", close: "[/url]", element: "a", markup: link },
  { open: "[color=", close: "[/color]", element: "font", markup: colour },
  { open: "[size=small]", close: "[/size]", element: "font", markup: fixed(`<font class="${sizes[0].className}">`, "</font>") },
  { open: "[size=large]", close: "[/size]", element: "font", markup: fixed(`<font class="${sizes[1].className}">`, "</font>") },
  { open: "[code]", close: "[/code]", element: "pre", markup: fixed("<pre>", "</pre>") },
];

// hasPrefix folds the case of ASCII letters only, as PCRE's /i did.
function hasPrefix(s: string, prefix: string, at = 0): boolean {
  if (s.length - at < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    let c = s.charCodeAt(at + i);
    if (c >= 65 && c <= 90) c += 32;
    if (c !== prefix.charCodeAt(i)) return false;
  }
  return true;
}

function indexOf(s: string, literal: string, from: number): number {
  for (let i = from; i <= s.length - literal.length; i++) {
    if (hasPrefix(s, literal, i)) return i;
  }
  return -1;
}

function tokenize(s: string, smilies: boolean): Token[] {
  const tokens: Token[] = [];
  let text = "";
  const flush = () => {
    if (text) tokens.push({ kind: "text", text });
    text = "";
  };
  for (let i = 0; i < s.length; ) {
    const c = s[i];
    if (c === "\n" || c === "\r") {
      const n = i + 1 < s.length && (s[i + 1] === "\n" || s[i + 1] === "\r") && s[i + 1] !== c ? 2 : 1;
      flush();
      tokens.push({ kind: "break" });
      text = s.slice(i, i + n);
      i += n;
      continue;
    }
    if (smilies) {
      const found = smileyCodes.find(([code]) => s.startsWith(code, i));
      if (found) {
        flush();
        tokens.push({ kind: "smiley", code: found[0], image: found[1] });
        i += found[0].length;
        continue;
      }
    }
    text += c;
    i++;
  }
  flush();
  return tokens;
}

interface Position {
  token: number;
  at: number;
}

// find returns the first literal at or after from, in a text token, as the
// markup Holo had written by then stood between the tokens.
function find(tokens: Token[], from: Position, literal: string): Position | null {
  for (let i = from.token; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== "text") continue;
    const j = indexOf(t.text, literal, i === from.token ? from.at : 0);
    if (j >= 0) return { token: i, at: j };
  }
  return null;
}

function appendRange(out: Token[], tokens: Token[], from: Position, to: Position): void {
  for (let i = from.token; i < tokens.length && i <= to.token; i++) {
    const t = tokens[i];
    if (t.kind !== "text") {
      out.push(t);
      continue;
    }
    const lo = i === from.token ? from.at : 0;
    const hi = i === to.token ? to.at : t.text.length;
    if (lo < hi) out.push({ kind: "text", text: t.text.slice(lo, hi) });
  }
}

// replace is one of Holo's patterns in one pass: the leftmost opening, closed
// by the nearest closing after it, and the search going on after that.
function replace(tag: Tag, tokens: Token[]): Token[] {
  const out: Token[] = [];
  let from: Position = { token: 0, at: 0 };
  for (;;) {
    const opening = find(tokens, from, tag.open);
    if (!opening) break;
    let content: Position = { token: opening.token, at: opening.at + tag.open.length };
    let value = "";
    if (tag.open.endsWith("=")) {
      const bracket = find(tokens, content, "]");
      if (!bracket) break;
      if (bracket.token === content.token) {
        const t = tokens[content.token] as { text: string };
        value = t.text.slice(content.at, bracket.at);
      }
      content = { token: bracket.token, at: bracket.at + 1 };
    }
    const closing = find(tokens, content, tag.close);
    if (!closing) break;
    appendRange(out, tokens, from, opening);
    out.push({ kind: "start", tag, value });
    appendRange(out, tokens, content, closing);
    out.push({ kind: "end", tag });
    from = { token: closing.token, at: closing.at + tag.close.length };
  }
  appendRange(out, tokens, from, { token: tokens.length, at: 0 });
  return out;
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\0/g, "�");
}

function escapeAttribute(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// read renders text as the editor's HTML. Smilies carry their code, and have
// none of the spaces Holo put around them, so that write gives the text back.
export function read(text: string, smilies = false): string {
  let tokens = tokenize(text, smilies);
  for (const tag of tags) tokens = replace(tag, tokens);
  let html = "";
  for (const t of tokens) {
    switch (t.kind) {
      case "text":
        html += escapeText(t.text);
        break;
      case "smiley":
        html += `<img class="inline align-baseline" src="${smileyBase}${t.image}.gif" alt="Smiley" title="Smiley" data-code="${escapeAttribute(t.code)}">`;
        break;
      case "break":
        html += "<br>";
        break;
      case "start":
        html += t.tag.markup(t.value)[0];
        break;
      case "end":
        html += `</${t.tag.element}>`;
        break;
    }
  }
  return html;
}

const blocks = new Set([
  "address", "article", "aside", "blockquote", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure",
  "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "pre",
  "section", "table", "td", "th", "tr", "ul",
]);

const skipped = new Set(["script", "style", "template", "head", "title", "meta", "link", "object", "iframe", "svg", "button", "select", "textarea", "input"]);

interface Format {
  kind: string;
  open: string;
  close: string;
}

const tagOf = (kind: string, open: string, close: string): Format => ({ kind, open, close });
const bold = tagOf("b", "[b]", "[/b]");
const italic = tagOf("i", "[i]", "[/i]");
const underline = tagOf("u", "[u]", "[/u]");
const strike = tagOf("s", "[s]", "[/s]");
const quote = tagOf("quote", "[quote]", "[/quote]");
const code = tagOf("code", "[code]", "[/code]");

// formats are the codes an element stands for. A paste keeps bold, italic,
// underline, strike, links and quotes.
function formats(element: Element, paste: boolean): Format[] {
  const name = element.localName;
  const out: Format[] = [];
  if (name === "strong" || name === "b") out.push(bold);
  if (name === "em" || name === "i") out.push(italic);
  if (name === "u") out.push(underline);
  if (name === "s" || name === "strike" || name === "del") out.push(strike);
  if (name === "a") {
    const href = address(element.getAttribute("href"));
    if (href) out.push(tagOf("url", `[url=${href}]`, "[/url]"));
  }
  if (name === "div" && element.classList.contains("bg-stone-300") && element.classList.contains("border-black")) {
    out.push(quote);
  }
  if (paste) {
    if (name === "blockquote") out.push(quote);
    return out;
  }
  if (name === "pre") out.push(code);
  if (name === "font" || name === "span") {
    const c = colours.find((c) => element.classList.contains(c.className));
    if (c) out.push(tagOf("color", `[color=${c.name}]`, "[/color]"));
    const z = sizes.find((z) => element.classList.contains(z.className));
    if (z) out.push(tagOf("size", `[size=${z.name}]`, "[/size]"));
  }
  return out;
}

// Writer walks a DOM in document order. Content is what an editor's caret
// moves over: a character, a line break, a smiley, or the line between two
// blocks; length counts it, so that a point survives a rewrite of the DOM.
//
// Each piece of content takes the codes of the elements around it, outermost
// first, and only the innermost of each kind: Holo's passes cannot read a code
// inside one that ends the same way, such as a [b] in a [b], a colour in a
// colour or a size in a size, so the writer never writes one. It closes and
// opens codes only where they change, so well-formed BBCode comes back as read
// was given it.
class Writer {
  out = "";
  length = 0;
  // flat holds the content alone, a smiley as one character.
  flat = "";
  private pending = false;
  private lineStart: boolean;
  private around: Format[] = [];
  private written: Format[] = [];

  // A paste does not know the line it goes into, so a block at its start or
  // end brings its own line break, which the editor drops at a line's edge.
  constructor(private paste: boolean) {
    this.lineStart = !paste;
  }

  private sync(wanted: Format[]) {
    let same = 0;
    while (same < this.written.length && same < wanted.length && this.written[same].open === wanted[same].open) same++;
    while (this.written.length > same) this.out += (this.written.pop() as Format).close;
    for (const format of wanted.slice(same)) {
      this.out += format.open;
      this.written.push(format);
    }
  }

  // content writes the line a block left pending before the codes that open
  // with the content, and none before a quote or code box, which starts a line
  // of its own.
  private content(s: string, atoms: number) {
    const wanted: Format[] = [];
    for (let i = this.around.length - 1; i >= 0; i--) {
      if (!wanted.some((f) => f.kind === this.around[i].kind)) wanted.unshift(this.around[i]);
    }
    let same = 0;
    while (same < this.written.length && same < wanted.length && this.written[same].open === wanted[same].open) same++;
    const box = wanted.slice(same).some((f) => f.kind === "quote" || f.kind === "code");
    if (this.pending && !this.lineStart && !box) {
      this.sync(wanted.slice(0, same));
      this.out += "\n";
      this.flat += "\n";
      this.length++;
    }
    this.pending = false;
    this.sync(wanted);
    this.out += s;
    this.flat += atoms === s.length ? s : "\ufffc";
    this.length += atoms;
    this.lineStart = s.endsWith("\n");
  }

  private text(node: Text, pre: boolean) {
    let s = node.data.replace(/\u00a0/g, " ");
    if (!this.paste) {
      s = s.replace(/[\r\n]/g, "");
    } else if (pre) {
      s = s.replace(/\r\n?/g, "\n");
    } else {
      s = s.replace(/[\t\n\f\r ]+/g, " ");
      if (this.lineStart || this.pending) s = s.replace(/^ /, "");
    }
    if (s) this.content(s, s.length);
  }

  node(node: Node, pre = false) {
    if (node.nodeType === Node.TEXT_NODE) {
      this.text(node as Text, pre);
      return;
    }
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      this.children(node, pre);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    const name = element.localName;
    if (skipped.has(name)) return;
    if (name === "br") {
      this.content("\n", 1);
      return;
    }
    if (name === "img") {
      const code = element.getAttribute("data-code");
      if (code && !this.paste) this.content(code, 1);
      return;
    }
    const own = formats(element, this.paste);
    const line = blocks.has(name) && !own.some((f) => f.kind === "quote" || f.kind === "code");
    if (line) this.pending = true;
    this.around.push(...own);
    this.children(element, pre || name === "pre");
    this.around.length -= own.length;
    if (line) this.pending = true;
    if (own.some((f) => f.kind === "quote" || f.kind === "code")) {
      this.lineStart = true;
      this.pending = false;
    }
  }

  private children(node: Node, pre: boolean) {
    for (let child = node.firstChild; child; child = child.nextSibling) this.node(child, pre);
  }

  finish(): string {
    this.sync([]);
    if (this.paste && this.pending && this.out !== "") this.out += "\n";
    return this.out;
  }
}

// write turns an editor's DOM into BBCode. With paste, it keeps only what a
// paste may bring: bold, italic, underline, strike, links, quotes and lines.
export function write(root: Node, paste = false): string {
  // A browser keeps one <br> in an editor it emptied, so that the caret shows.
  if (root.childNodes.length === 1 && (root.firstChild as Element).localName === "br") return "";
  const writer = new Writer(paste);
  for (let child = root.firstChild; child; child = child.nextSibling) writer.node(child);
  return writer.finish();
}

// measure counts the content write would find in node.
export function measure(node: Node): number {
  const writer = new Writer(false);
  writer.node(node);
  return writer.length;
}

// flatten is the content of an editor's DOM, each piece one character.
export function flatten(root: Node): string {
  const writer = new Writer(false);
  for (let child = root.firstChild; child; child = child.nextSibling) writer.node(child);
  return writer.flat;
}

// offset is the content before a point of an editor's DOM.
export function offset(root: Node, container: Node, at: number): number {
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(container, at);
  return measure(range.cloneContents());
}

// pointAt is the point of the DOM that read wrote after n pieces of content.
// Where the end of one element meets the start of another, it takes the end of
// the first, as typing there carries on its look, unless forward asks for the
// start of the next, as a selection starts.
export function pointAt(root: Node, n: number, forward = false): [Node, number] {
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const data = (node as Text).data;
      for (let i = 0; i < data.length; i++) {
        if (data[i] === "\r" || data[i] === "\n") continue;
        if (count === n) return [node, i];
        count++;
      }
      if (count === n && !forward) return [node, data.length];
      continue;
    }
    const name = (node as Element).localName;
    if (name === "br" || (name === "img" && (node as Element).hasAttribute("data-code"))) {
      if (count === n) {
        const parent = node.parentNode as Node;
        return [parent, Array.prototype.indexOf.call(parent.childNodes, node)];
      }
      count++;
    }
  }
  return [root, root.childNodes.length];
}
