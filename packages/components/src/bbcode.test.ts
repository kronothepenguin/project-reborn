import { describe, expect, it } from "vitest";
import { flatten, measure, offset, pointAt, read, write } from "./bbcode";

const quote = '<div class="bg-stone-300 border border-black m-1 mb-3.5 p-1.5">';
const smiley = (image: string) =>
  `<img class="inline align-baseline" src="/smilies/${image}.gif" alt="Smiley" title="Smiley">`;

function box(html: string): HTMLDivElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

function unwrap(element: Element) {
  element.replaceWith(...element.childNodes);
}

// shown is what read gives once the browser has nested it, in the Go
// renderer's terms: a <font> with a class is its <span>, and the <font> or <a>
// of a failed colour or link shows only its content.
function shown(text: string, smilies = false): string {
  const div = box(read(text, smilies));
  for (const font of [...div.querySelectorAll("font")].reverse()) {
    if (!font.className) {
      unwrap(font);
      continue;
    }
    const span = document.createElement("span");
    span.className = font.className;
    span.append(...font.childNodes);
    font.replaceWith(span);
  }
  for (const a of [...div.querySelectorAll("a:not([href])")].reverse()) unwrap(a);
  for (const img of div.querySelectorAll("img")) img.removeAttribute("data-code");
  return div.innerHTML;
}

// The cases of packages/cms/internal/bbcode/bbcode_test.go, without the spaces
// the renderer puts around a smiley.
const cases: [string, string, boolean?][] = [
  ["", ""],
  ["hello", "hello"],
  ["[b]x[/b]", "<strong>x</strong>"],
  ["[i]x[/i]", "<em>x</em>"],
  ["[u]x[/u]", "<u>x</u>"],
  ["[s]x[/s]", "<s>x</s>"],
  ["[quote]x[/quote]", quote + "x</div>"],
  ["[link=http://example.com/]x[/link]", "<a href='http://example.com/'>x</a>"],
  ["[url=https://example.com/a?b=1&c=2]x[/url]", "<a href='https://example.com/a?b=1&amp;c=2'>x</a>"],
  ["[color=red]x[/color]", "<span class='text-red-600'>x</span>"],
  ["[color=orange]x[/color]", "<span class='text-orange-500'>x</span>"],
  ["[color=yellow]x[/color]", "<span class='text-amber-300'>x</span>"],
  ["[color=green]x[/color]", "<span class='text-lime-500'>x</span>"],
  ["[color=cyan]x[/color]", "<span class='text-teal-400'>x</span>"],
  ["[color=blue]x[/color]", "<span class='text-sky-600'>x</span>"],
  ["[color=gray]x[/color]", "<span class='text-olive-500'>x</span>"],
  ["[size=small]x[/size]", "<span class='text-sm'>x</span>"],
  ["[size=large]x[/size]", "<span class='text-2xl'>x</span>"],
  ["[code]x[/code]", "<pre>x</pre>"],
  ["a [b]b[/b] c", "a <strong>b</strong> c"],
  ["[b]1[/b] [b]2[/b]", "<strong>1</strong> <strong>2</strong>"],
  ["[b][/b]", "<strong></strong>"],
  ["[size=medium]x[/size]", "[size=medium]x[/size]"],
  ["[img]x[/img]", "[img]x[/img]"],
  ["[link=http://example.com/]x[/url]", "[link=http://example.com/]x[/url]"],
  ["[B]x[/B]", "<strong>x</strong>"],
  ["[b]x[/B]", "<strong>x</strong>"],
  ["[QuOtE]x[/qUoTe]", quote + "x</div>"],
  ["[URL=http://example.com/]x[/Url]", "<a href='http://example.com/'>x</a>"],
  ["[url=HTTPS://EXAMPLE.COM]x[/url]", "<a href='HTTPS://EXAMPLE.COM'>x</a>"],
  ["[Color=RED]x[/COLOR]", "<span class='text-red-600'>x</span>"],
  ["[SIZE=SMALL]x[/size]", "<span class='text-sm'>x</span>"],
  ["[CODE]x[/Code]", "<pre>x</pre>"],
  ["[\u017f]x[/\u017f]", "[\u017f]x[/\u017f]"],
  ["[lin\u212a=http://a.example/]x[/lin\u212a]", "[lin\u212a=http://a.example/]x[/lin\u212a]"],
  ["a\nb", "a<br />\nb"],
  ["a\r\nb", "a<br />\r\nb"],
  ["a\n\rb", "a<br />\n\rb"],
  ["a\rb", "a<br />\rb"],
  ["a\n\nb", "a<br />\n<br />\nb"],
  ["a\r\n\r\nb", "a<br />\r\n<br />\r\nb"],
  ["a\r\rb", "a<br />\r<br />\rb"],
  ["[b]a\nb[/b]", "<strong>a<br />\nb</strong>"],
  ["[code]a\nb[/code]", "<pre>a<br />\nb</pre>"],
  ["[b\n]x[/b]", "[b<br />\n]x[/b]"],
  [":)", smiley("smile"), true],
  [";)", smiley("wink"), true],
  [":P", smiley("tongue"), true],
  [";P", smiley("winktongue"), true],
  [":p", smiley("tongue"), true],
  [";p", smiley("winktongue"), true],
  ["(L)", smiley("heart"), true],
  ["(l)", smiley("heart"), true],
  [":o", smiley("shocked"), true],
  [":O", smiley("shocked"), true],
  [":) ;) :P (L) :o", ":) ;) :P (L) :o"],
  ["hi :) there", "hi " + smiley("smile") + " there", true],
  [":):)", smiley("smile") + smiley("smile"), true],
  [";:)", ";" + smiley("smile"), true],
  [":D (L", ":D (L", true],
  ["[b]:)[/b]", "<strong>" + smiley("smile") + "</strong>", true],
  ["a\n:p", "a<br />\n" + smiley("tongue"), true],
  ["')", "&#39;)", true],
  ['")', "&#34;)", true],
  ["&)", "&amp;)", true],
  ["<)", "&lt;)", true],
  [">)", "&gt;)", true],
  ["&p", "&amp;p", true],
  ["<p>", "&lt;p&gt;", true],
  ["'P", "&#39;P", true],
  ["it's :)", "it&#39;s " + smiley("smile"), true],
  ["<script>alert(1)</script>", "&lt;script&gt;alert(1)&lt;/script&gt;"],
  ['<b onmouseover="alert(1)">x</b>', "&lt;b onmouseover=&#34;alert(1)&#34;&gt;x&lt;/b&gt;"],
  ["[b]<i>&amp;[/b]", "<strong>&lt;i&gt;&amp;amp;</strong>"],
  ["[url=http://a.example/]<script>[/url]", "<a href='http://a.example/'>&lt;script&gt;</a>"],
  ["a\x00b", "a�b"],
  ["[url=javascript:alert(1)]x[/url]", "x"],
  ["[link=javascript:alert(1)]x[/link]", "x"],
  ["[url=JavaScript:alert(1)]x[/url]", "x"],
  ["[url= javascript:alert(1)]x[/url]", "x"],
  ["[url=java\tscript:alert(1)]x[/url]", "x"],
  ["[url=data:text/html,<script>alert(1)</script>]x[/url]", "x"],
  ["[url=vbscript:msgbox(1)]x[/url]", "x"],
  ["[url=//evil.example/]x[/url]", "x"],
  ["[url=/me]x[/url]", "x"],
  ["[url=www.example.com]x[/url]", "x"],
  ["[url=]x[/url]", "x"],
  ["[url=   ]x[/url]", "x"],
  ["[url=http:example.com]x[/url]", "x"],
  ["[url=http://a.example/' onmouseover='alert(1)]x[/url]", "<a href='http://a.example/&#39; onmouseover=&#39;alert(1)'>x</a>"],
  ['[url=http://a.example/" onmouseover="alert(1)]x[/url]', "<a href='http://a.example/&#34; onmouseover=&#34;alert(1)'>x</a>"],
  ["[url=http://a.example/><script>alert(1)</script>]x[/url]", "<a href='http://a.example/&gt;&lt;script&gt;alert(1)&lt;/script&gt;'>x</a>"],
  ["[url= http://a.example/ ]x[/url]", "<a href='http://a.example/'>x</a>"],
  ["[url=http://a.exa\tmple/]x[/url]", "<a href='http://a.example/'>x</a>"],
  ["[url=http://a.example/\n]x[/url]", "x"],
  ["[url=http://a.example/:p]x[/url]", "x", true],
  ["[url=http://a.example/:p]x[/url]", "<a href='http://a.example/:p'>x</a>"],
  ["[url=http://a.example/[b]x[/b]]y[/url]", "y"],
  ["[url=http://a.example/[x]y[/url]", "<a href='http://a.example/[x'>y</a>"],
  ["[url=http://a.example/]x", "[url=http://a.example/]x"],
  ["[url=http://a.example/ x", "[url=http://a.example/ x"],
  ["[color=purple]x[/color]", "x"],
  ["[color=black]x[/color]", "<span class='text-black'>x</span>"],
  ["[color=grey]x[/color]", "x"],
  ["[color=#ff0000]x[/color]", "x"],
  ["[color=]x[/color]", "x"],
  ["[color=redd]x[/color]", "x"],
  ["[color=re]x[/color]", "x"],
  ["[color= blue ]x[/color]", "<span class='text-sky-600'>x</span>"],
  ['[color=red" onmouseover="alert(1)]x[/color]', "x"],
  ["[color=red' onmouseover='alert(1)]x[/color]", "x"],
  ["[color=red;background:url(javascript:alert(1))]x[/color]", "x"],
  ["[color=purple][b]x[/b][/color]", "<strong>x</strong>"],
  ["[b]x", "[b]x"],
  ["[b]x[/b", "[b]x[/b"],
  ["x[/b]", "x[/b]"],
  ["[quote]x", "[quote]x"],
  ["[color=red]x[/colour]", "[color=red]x[/colour]"],
  ["[b]x[b]y[/b]", "<strong>x[b]y</strong>"],
  ["[b][b]x[/b][/b]", "<strong>[b]x</strong>[/b]"],
  ["[quote][quote]x[/quote][/quote]", quote + "[quote]x</div>[/quote]"],
  ["[url=http://a.example/][url=http://b.example/]x[/url][/url]", "<a href='http://a.example/'>[url=http://b.example/]x</a>[/url]"],
  ["[i][b]x[/b][/i]", "<em><strong>x</strong></em>"],
  ["[b][i]x[/i][/b]", "<strong><em>x</em></strong>"],
  ["[color=red][b]x[/b][/color]", "<span class='text-red-600'><strong>x</strong></span>"],
  ["[code][b]x[/b] :)[/code]", "<pre><strong>x</strong> " + smiley("smile") + "</pre>", true],
  ["[size=large]a[size=small]b[/size]c[/size]", "<span class='text-2xl'>a<span class='text-sm'>b</span>c</span>"],
  ["[size=small]a[size=large]b[/size]c[/size]", "<span class='text-sm'>a<span class='text-2xl'>b</span>c</span>"],
  ["[b]a[i]b[/b]c[/i]", "<strong>a<em>b</em></strong><em>c</em>"],
  ["[i]a[b]b[/i]c[/b]", "<em>a<strong>b</strong></em><strong>c</strong>"],
  ["[b]a[quote]b[/b]c[/quote]d", "<strong>a</strong>" + quote + "<strong>b</strong>c</div>d"],
  ["[quote]a[b]b[/quote]c[/b]", quote + "a<strong>b</strong></div><strong>c</strong>"],
  ["[code]a[quote]b[/code]c[/quote]d", "<pre>a" + quote + "b</div></pre>cd"],
  ["[quote]a[code]b[/quote]c[/code]", quote + "a<pre>b</pre></div>c"],
  [
    "[url=http://a.example/]x[link=http://b.example/]y[/link]z[/url]",
    "<a href='http://a.example/'>x</a><a href='http://b.example/'>y</a>z",
  ],
  [
    "[url=http://a.example/]x[quote]y[link=http://b.example/]z[/link][/quote][/url]",
    "<a href='http://a.example/'>x</a>" + quote + "<a href='http://a.example/'>y</a><a href='http://b.example/'>z</a></div>",
  ],
  ["[link=javascript:x]a[url=http://b.example/]b[/url]c[/link]", "a<a href='http://b.example/'>b</a>c"],
  ["[color=red]a[quote]b[/color]c[/quote]", "<span class='text-red-600'>a</span>" + quote + "<span class='text-red-600'>b</span>c</div>"],
  [
    "[b]1[i]2[u]3[s]4[color=red]5[quote]6[/b]7[/i][/u][/s][/color][/quote]",
    "<strong>1<em>2<u>3<s>4<span class='text-red-600'>5</span></s></u></em></strong>" +
      "<u><s><span class='text-red-600'></span></s></u><s><span class='text-red-600'></span></s><span class='text-red-600'></span>" +
      quote +
      "<span class='text-red-600'><s><u><strong>6</strong>7</u></s></span></div>",
  ],
];

describe("read", () => {
  it("shows what the CMS renders, once the browser has nested it", () => {
    for (const [text, want, smilies] of cases) {
      expect(shown(text, smilies), JSON.stringify(text)).toBe(box(want).innerHTML);
    }
  });

  it("keeps each smiley's code", () => {
    const img = box(read("a :p b", true)).querySelector("img");
    expect(img?.getAttribute("data-code")).toBe(":p");
  });
});

const writes = (text: string, smilies = false) => write(box(read(text, smilies)));

describe("write", () => {
  it("gives back the BBCode read was given", () => {
    for (const text of [
      "",
      "plain text",
      "[b]x[/b] [i]x[/i] [u]x[/u] [s]x[/s]",
      "[quote]x[/quote]",
      "[code]x[/code]",
      "[url=http://a.example/?a=1&b=2]x[/url]",
      "[color=red]a[/color][color=orange]b[/color][color=yellow]c[/color][color=green]d[/color]",
      "[color=cyan]a[/color][color=blue]b[/color][color=gray]c[/color][color=black]d[/color]",
      "[size=small]a[/size][size=large]b[/size]",
      "a\nb\n\nc\n",
      "[b]a[i]b[/i]c[/b]",
      "[i]a[b]b[/b]c[/i]",
      "[color=red][b]x[/b][/color]",
      "[quote]a[b]b[/b]\nc[/quote]d",
      "[size=large]a[/size][size=small]b[/size]",
      "it's <b> & </b>",
      "1 < 2 > 0",
    ]) {
      expect(writes(text), JSON.stringify(text)).toBe(text);
    }
  });

  it("gives back each smiley's own code", () => {
    expect(writes(":) ;) :P ;P :p ;p (L) (l) :o :O", true)).toBe(":) ;) :P ;P :p ;p (L) (l) :o :O");
    expect(writes(":)")).toBe(":)");
  });

  it("writes a tidier BBCode that looks the same", () => {
    expect(writes("[link=http://a.example/]x[/link]")).toBe("[url=http://a.example/]x[/url]");
    expect(writes("[B]x[/B] [Color= RED ]y[/COLOR]")).toBe("[b]x[/b] [color=red]y[/color]");
    expect(writes("a\r\nb\rc")).toBe("a\nb\nc");
    expect(writes("[b][/b]x")).toBe("x");
    expect(writes("[url=javascript:alert(1)]x[/url] [color=purple]y[/color]")).toBe("x y");
    expect(writes("[b]a[i]b[/b]c[/i]")).toBe("[b]a[i]b[/i][/b][i]c[/i]");
    expect(writes("[size=large]a[size=small]b[/size]c[/size]")).toBe("[size=large]a[/size][size=small]b[/size][size=large]c[/size]");
  });

  it("never writes a code inside the same code, which Holo's passes cannot read", () => {
    const div = box('<font class="text-red-600">a<font class="text-sky-600">b</font>c</font><strong>d<b>e</b></strong>');
    expect(write(div)).toBe("[color=red]a[/color][color=blue]b[/color][color=red]c[/color][b]de[/b]");
    const quotes = box(`${quote}a${quote}b</div></div>`);
    expect(write(quotes)).toBe("[quote]ab[/quote]");
  });

  it("reads the DOM a browser's editing leaves", () => {
    expect(write(box("a<div>b</div><div><br></div><div>c</div>"))).toBe("a\nb\n\nc");
    expect(write(box("a&nbsp; b"))).toBe("a  b");
    expect(write(box("<br>"))).toBe("");
    expect(write(box("<b>x</b><i>y</i><strike>z</strike><del>w</del>"))).toBe("[b]x[/b][i]y[/i][s]zw[/s]");
    expect(write(box('<span style="font-weight: bold">x</span>'))).toBe("x");
  });

  it("keeps on paste what BBCode can say", () => {
    const pasted = new DOMParser().parseFromString(
      `<h1>Title <a href="https://a.example/">here</a></h1>
       <p>Some <b>bold</b>, <i>italic</i>, <u>under</u> and <s>gone</s>,
          <span style="color: red; font-size: 40px">loud</span>.</p>
       <blockquote>Said</blockquote>
       <table><tr><td>cell</td><td>two</td></tr></table>
       <pre>a
b</pre>
       <img src="x.png" alt="picture"><script>alert(1)</script>
       <a href="javascript:alert(1)">bad</a>`,
      "text/html",
    );
    expect(write(pasted.body, true)).toBe(
      "\nTitle [url=https://a.example/]here[/url]\nSome [b]bold[/b], [i]italic[/i], [u]under[/u] and [s]gone[/s], loud.[quote]Said[/quote]cell\ntwo\na\nb\nbad",
    );
  });
});

// mulberry32, so that a failure shows again on the next run.
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// runs is how text looks: each character, line break and smiley with the
// innermost format of each kind around it.
function runs(div: HTMLDivElement): string[] {
  const out: string[] = [];
  const formats = (node: Node) => {
    const seen: Record<string, string> = {};
    for (let e = node.parentElement; e && e !== div; e = e.parentElement) {
      const kinds: [string, string][] = [];
      const name = e.localName;
      if (name === "strong" || name === "b") kinds.push(["b", ""]);
      if (name === "em" || name === "i") kinds.push(["i", ""]);
      if (name === "u") kinds.push(["u", ""]);
      if (name === "s") kinds.push(["s", ""]);
      if (name === "a" && e.hasAttribute("href")) kinds.push(["url", e.getAttribute("href") ?? ""]);
      if (name === "pre") kinds.push(["code", ""]);
      if (name === "div") kinds.push(["quote", ""]);
      if (name === "font" && e.className) kinds.push([e.className === "text-sm" || e.className === "text-2xl" ? "size" : "color", e.className]);
      for (const [kind, value] of kinds) if (!(kind in seen)) seen[kind] = value;
    }
    return JSON.stringify(Object.entries(seen).sort());
  };
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const c of (node as Text).data.replace(/[\r\n]/g, "")) out.push(c + formats(node));
    } else if ((node as Element).localName === "br") {
      out.push("\u2424" + formats(node));
    } else if ((node as Element).localName === "img") {
      out.push((node as Element).getAttribute("data-code") + formats(node));
    }
  }
  return out;
}

// wellFormed builds BBCode with every tag closed in order, none inside a tag of
// the same pass, which Holo's passes could not read either.
function wellFormed(next: () => number, depth = 0, open: string[] = []): string {
  const leaves = ["x", "y", " ", "\n", ":)", "<", "'", "&"];
  const tags: [string, string, string][] = [
    ["b", "[b]", "[/b]"], ["i", "[i]", "[/i]"], ["u", "[u]", "[/u]"], ["s", "[s]", "[/s]"],
    ["quote", "[quote]", "[/quote]"], ["code", "[code]", "[/code]"],
    ["url", "[url=http://a.example/]", "[/url]"], ["link", "[link=https://b.example/]", "[/link]"],
    ["color", "[color=red]", "[/color]"], ["color", "[color=blue]", "[/color]"],
    ["size", "[size=small]", "[/size]"], ["size", "[size=large]", "[/size]"],
  ];
  let text = "";
  for (let k = 1 + Math.floor(next() * 4); k > 0; k--) {
    const tag = tags[Math.floor(next() * tags.length)];
    if (depth < 4 && next() < 0.5 && !open.includes(tag[0])) {
      text += tag[1] + wellFormed(next, depth + 1, [...open, tag[0]]) + tag[2];
    } else {
      text += leaves[Math.floor(next() * leaves.length)];
    }
  }
  return text;
}

describe("an editor's round trip", () => {
  it("saves well-formed BBCode so that it looks the same, and settles", () => {
    const next = random(7);
    for (let n = 0; n < 3000; n++) {
      const text = wellFormed(next);
      const once = writes(text, true);
      expect(runs(box(read(once, true))), JSON.stringify(text)).toEqual(runs(box(read(text, true))));
      expect(writes(once, true), JSON.stringify(text)).toBe(once);
    }
  });

  it("writes something for any text", () => {
    const pieces = [
      "[b]", "[/b]", "[i]", "[/i]", "[quote]", "[/quote]", "[link=http://a.example/]", "[link=javascript:x]",
      "[/link]", "[url=https://b.example/]", "[/url]", "[color=red]", "[color=purple]", "[/color]", "[size=small]",
      "[/size]", "[code]", "[/code]", "x", " ", "\n", ":)", "<", "'", "[", "]",
    ];
    const next = random(11);
    for (let n = 0; n < 2000; n++) {
      let text = "";
      for (let k = Math.floor(next() * 30); k > 0; k--) text += pieces[Math.floor(next() * pieces.length)];
      expect(typeof writes(text, true)).toBe("string");
    }
  });

  it("finds every point again after a rewrite", () => {
    const div = box(read("ab[b]c\nd[/b]:)[quote]e[/quote]\n[url=http://a.example/]f[/url]", true));
    const total = measure(div);
    expect(total).toBe(9);
    expect(flatten(div)).toBe("abc\nd\ufffce\nf");
    for (let n = 0; n <= total; n++) {
      for (const forward of [false, true]) {
        const [node, at] = pointAt(div, n, forward);
        expect(offset(div, node, at), `${n} ${forward}`).toBe(n);
      }
    }
  });

  it("starts a selection inside what follows a boundary, and a caret at the end of what precedes it", () => {
    const div = box(read("our [url=http://a.example/]news[/url]"));
    expect((pointAt(div, 4)[0] as Text).data).toBe("our ");
    expect(pointAt(div, 4, true)[0].parentElement?.localName).toBe("a");
  });
});
