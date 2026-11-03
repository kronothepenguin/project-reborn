package bbcode

import (
	"fmt"
	"math/rand/v2"
	"regexp"
	"slices"
	"strings"
	"testing"
)

const quote = "<div class='bg-stone-300 border border-black m-[3px] mb-2.5 p-[5px]'>"

func smiley(image string) string {
	return " <img class='inline align-baseline' src='/smilies/" + image + ".gif' alt='Smiley' title='Smiley' border='0'> "
}

type formatCase struct {
	name    string
	text    string
	smilies bool
	want    string
}

func run(t *testing.T, cases []formatCase) {
	t.Helper()
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := string(Format(c.text, c.smilies)); got != c.want {
				t.Errorf("Format(%q, %v)\n got %s\nwant %s", c.text, c.smilies, got, c.want)
			}
		})
	}
}

func TestFormatTags(t *testing.T) {
	run(t, []formatCase{
		{name: "empty", text: "", want: ""},
		{name: "plain text", text: "hello", want: "hello"},
		{name: "bold", text: "[b]x[/b]", want: "<strong>x</strong>"},
		{name: "italic", text: "[i]x[/i]", want: "<em>x</em>"},
		{name: "underline", text: "[u]x[/u]", want: "<u>x</u>"},
		{name: "strike", text: "[s]x[/s]", want: "<s>x</s>"},
		{name: "quote", text: "[quote]x[/quote]", want: quote + "x</div>"},
		{name: "link", text: "[link=http://example.com/]x[/link]", want: "<a href='http://example.com/'>x</a>"},
		{name: "url", text: "[url=https://example.com/a?b=1&c=2]x[/url]", want: "<a href='https://example.com/a?b=1&amp;c=2'>x</a>"},
		{name: "red", text: "[color=red]x[/color]", want: "<span class='text-red-600'>x</span>"},
		{name: "orange", text: "[color=orange]x[/color]", want: "<span class='text-orange-500'>x</span>"},
		{name: "yellow", text: "[color=yellow]x[/color]", want: "<span class='text-amber-300'>x</span>"},
		{name: "green", text: "[color=green]x[/color]", want: "<span class='text-lime-500'>x</span>"},
		{name: "cyan", text: "[color=cyan]x[/color]", want: "<span class='text-teal-400'>x</span>"},
		{name: "blue", text: "[color=blue]x[/color]", want: "<span class='text-sky-600'>x</span>"},
		{name: "gray", text: "[color=gray]x[/color]", want: "<span class='text-olive-500'>x</span>"},
		{name: "small", text: "[size=small]x[/size]", want: "<span class='text-[10px]'>x</span>"},
		{name: "large", text: "[size=large]x[/size]", want: "<span class='text-base'>x</span>"},
		{name: "code", text: "[code]x[/code]", want: "<pre>x</pre>"},
		{name: "text around a tag", text: "a [b]b[/b] c", want: "a <strong>b</strong> c"},
		{name: "every match in the pass", text: "[b]1[/b] [b]2[/b]", want: "<strong>1</strong> <strong>2</strong>"},
		{name: "empty tag", text: "[b][/b]", want: "<strong></strong>"},
		{name: "unknown size", text: "[size=medium]x[/size]", want: "[size=medium]x[/size]"},
		{name: "unknown tag", text: "[img]x[/img]", want: "[img]x[/img]"},
		{name: "closed by another tag", text: "[link=http://example.com/]x[/url]", want: "[link=http://example.com/]x[/url]"},
	})
}

func TestFormatIgnoresCase(t *testing.T) {
	run(t, []formatCase{
		{name: "upper case", text: "[B]x[/B]", want: "<strong>x</strong>"},
		{name: "mixed ends", text: "[b]x[/B]", want: "<strong>x</strong>"},
		{name: "quote", text: "[QuOtE]x[/qUoTe]", want: quote + "x</div>"},
		{name: "url", text: "[URL=http://example.com/]x[/Url]", want: "<a href='http://example.com/'>x</a>"},
		{name: "scheme", text: "[url=HTTPS://EXAMPLE.COM]x[/url]", want: "<a href='HTTPS://EXAMPLE.COM'>x</a>"},
		{name: "colour name", text: "[Color=RED]x[/COLOR]", want: "<span class='text-red-600'>x</span>"},
		{name: "size word", text: "[SIZE=SMALL]x[/size]", want: "<span class='text-[10px]'>x</span>"},
		{name: "code", text: "[CODE]x[/Code]", want: "<pre>x</pre>"},
		{name: "only ASCII letters fold, as in PCRE", text: "[ſ]x[/ſ]", want: "[ſ]x[/ſ]"},
		{name: "kelvin sign is not k", text: "[linK=http://a.example/]x[/linK]", want: "[linK=http://a.example/]x[/linK]"},
	})
}

func TestFormatLineBreaks(t *testing.T) {
	run(t, []formatCase{
		{name: "LF", text: "a\nb", want: "a<br />\nb"},
		{name: "CRLF", text: "a\r\nb", want: "a<br />\r\nb"},
		{name: "LFCR", text: "a\n\rb", want: "a<br />\n\rb"},
		{name: "CR", text: "a\rb", want: "a<br />\rb"},
		{name: "two LF", text: "a\n\nb", want: "a<br />\n<br />\nb"},
		{name: "two CRLF", text: "a\r\n\r\nb", want: "a<br />\r\n<br />\r\nb"},
		{name: "two CR", text: "a\r\rb", want: "a<br />\r<br />\rb"},
		{name: "tag across lines", text: "[b]a\nb[/b]", want: "<strong>a<br />\nb</strong>"},
		{name: "code keeps the breaks", text: "[code]a\nb[/code]", want: "<pre>a<br />\nb</pre>"},
		{name: "break inside a tag", text: "[b\n]x[/b]", want: "[b<br />\n]x[/b]"},
	})
}

func TestFormatSmilies(t *testing.T) {
	run(t, []formatCase{
		{name: "smile", text: ":)", smilies: true, want: smiley("smile")},
		{name: "wink", text: ";)", smilies: true, want: smiley("wink")},
		{name: "tongue", text: ":P", smilies: true, want: smiley("tongue")},
		{name: "winktongue", text: ";P", smilies: true, want: smiley("winktongue")},
		{name: "lower tongue", text: ":p", smilies: true, want: smiley("tongue")},
		{name: "lower winktongue", text: ";p", smilies: true, want: smiley("winktongue")},
		{name: "heart", text: "(L)", smilies: true, want: smiley("heart")},
		{name: "lower heart", text: "(l)", smilies: true, want: smiley("heart")},
		{name: "shocked", text: ":o", smilies: true, want: smiley("shocked")},
		{name: "upper shocked", text: ":O", smilies: true, want: smiley("shocked")},
		{name: "off", text: ":) ;) :P (L) :o", want: ":) ;) :P (L) :o"},
		{name: "in a sentence", text: "hi :) there", smilies: true, want: "hi " + smiley("smile") + " there"},
		{name: "two in a row", text: ":):)", smilies: true, want: smiley("smile") + smiley("smile")},
		{name: "after another sign", text: ";:)", smilies: true, want: ";" + smiley("smile")},
		{name: "not a code", text: ":D (L", smilies: true, want: ":D (L"},
		{name: "inside a tag", text: "[b]:)[/b]", smilies: true, want: "<strong>" + smiley("smile") + "</strong>"},
		{name: "after a break", text: "a\n:p", smilies: true, want: "a<br />\n" + smiley("tongue")},
	})
}

// Escaped text holds ";", so smilies looked for after escaping would turn up
// inside entities, as &#39;) did.
func TestFormatFindsSmiliesBeforeEscaping(t *testing.T) {
	run(t, []formatCase{
		{name: "apostrophe", text: "')", smilies: true, want: "&#39;)"},
		{name: "quote mark", text: `")`, smilies: true, want: "&#34;)"},
		{name: "ampersand", text: "&)", smilies: true, want: "&amp;)"},
		{name: "less than", text: "<)", smilies: true, want: "&lt;)"},
		{name: "greater than", text: ">)", smilies: true, want: "&gt;)"},
		{name: "ampersand p", text: "&p", smilies: true, want: "&amp;p"},
		{name: "tag p", text: "<p>", smilies: true, want: "&lt;p&gt;"},
		{name: "apostrophe P", text: "'P", smilies: true, want: "&#39;P"},
		{name: "beside a smiley", text: "it's :)", smilies: true, want: "it&#39;s " + smiley("smile")},
	})
}

func TestFormatEscapes(t *testing.T) {
	run(t, []formatCase{
		{name: "script", text: "<script>alert(1)</script>", want: "&lt;script&gt;alert(1)&lt;/script&gt;"},
		{name: "html tag", text: `<b onmouseover="alert(1)">x</b>`, want: "&lt;b onmouseover=&#34;alert(1)&#34;&gt;x&lt;/b&gt;"},
		{name: "inside a tag", text: "[b]<i>&amp;[/b]", want: "<strong>&lt;i&gt;&amp;amp;</strong>"},
		{name: "inside a link", text: "[url=http://a.example/]<script>[/url]", want: "<a href='http://a.example/'>&lt;script&gt;</a>"},
		{name: "null", text: "a\x00b", want: "a�b"},
	})
}

func TestFormatLinks(t *testing.T) {
	run(t, []formatCase{
		{name: "javascript", text: "[url=javascript:alert(1)]x[/url]", want: "x"},
		{name: "javascript in link", text: "[link=javascript:alert(1)]x[/link]", want: "x"},
		{name: "javascript in capitals", text: "[url=JavaScript:alert(1)]x[/url]", want: "x"},
		{name: "javascript after a space", text: "[url= javascript:alert(1)]x[/url]", want: "x"},
		{name: "javascript with a tab", text: "[url=java\tscript:alert(1)]x[/url]", want: "x"},
		{name: "data", text: "[url=data:text/html,<script>alert(1)</script>]x[/url]", want: "x"},
		{name: "vbscript", text: "[url=vbscript:msgbox(1)]x[/url]", want: "x"},
		{name: "protocol relative", text: "[url=//evil.example/]x[/url]", want: "x"},
		{name: "relative", text: "[url=/me]x[/url]", want: "x"},
		{name: "no scheme", text: "[url=www.example.com]x[/url]", want: "x"},
		{name: "blank", text: "[url=]x[/url]", want: "x"},
		{name: "spaces only", text: "[url=   ]x[/url]", want: "x"},
		{name: "no slashes", text: "[url=http:example.com]x[/url]", want: "x"},
		{name: "apostrophes", text: "[url=http://a.example/' onmouseover='alert(1)]x[/url]", want: "<a href='http://a.example/&#39; onmouseover=&#39;alert(1)'>x</a>"},
		{name: "quote marks", text: `[url=http://a.example/" onmouseover="alert(1)]x[/url]`, want: "<a href='http://a.example/&#34; onmouseover=&#34;alert(1)'>x</a>"},
		{name: "markup", text: "[url=http://a.example/><script>alert(1)</script>]x[/url]", want: "<a href='http://a.example/&gt;&lt;script&gt;alert(1)&lt;/script&gt;'>x</a>"},
		{name: "spaces around", text: "[url= http://a.example/ ]x[/url]", want: "<a href='http://a.example/'>x</a>"},
		{name: "tab inside", text: "[url=http://a.exa\tmple/]x[/url]", want: "<a href='http://a.example/'>x</a>"},
		{name: "line break inside", text: "[url=http://a.example/\n]x[/url]", want: "x"},
		{name: "smiley inside", text: "[url=http://a.example/:p]x[/url]", smilies: true, want: "x"},
		{name: "smiley code without smilies", text: "[url=http://a.example/:p]x[/url]", want: "<a href='http://a.example/:p'>x</a>"},
		{name: "a tag inside", text: "[url=http://a.example/[b]x[/b]]y[/url]", want: "y"},
		{name: "address up to the first bracket", text: "[url=http://a.example/[x]y[/url]", want: "<a href='http://a.example/[x'>y</a>"},
		{name: "unclosed", text: "[url=http://a.example/]x", want: "[url=http://a.example/]x"},
		{name: "no bracket", text: "[url=http://a.example/ x", want: "[url=http://a.example/ x"},
	})
}

func TestFormatColours(t *testing.T) {
	run(t, []formatCase{
		{name: "unknown name", text: "[color=purple]x[/color]", want: "x"},
		{name: "black", text: "[color=black]x[/color]", want: "x"},
		{name: "grey", text: "[color=grey]x[/color]", want: "x"},
		{name: "hex", text: "[color=#ff0000]x[/color]", want: "x"},
		{name: "blank", text: "[color=]x[/color]", want: "x"},
		{name: "longer than a name", text: "[color=redd]x[/color]", want: "x"},
		{name: "shorter than a name", text: "[color=re]x[/color]", want: "x"},
		{name: "spaces around", text: "[color= blue ]x[/color]", want: "<span class='text-sky-600'>x</span>"},
		{name: "attribute", text: `[color=red" onmouseover="alert(1)]x[/color]`, want: "x"},
		{name: "attribute in apostrophes", text: "[color=red' onmouseover='alert(1)]x[/color]", want: "x"},
		{name: "style", text: "[color=red;background:url(javascript:alert(1))]x[/color]", want: "x"},
		{name: "unknown keeps the inner tags", text: "[color=purple][b]x[/b][/color]", want: "<strong>x</strong>"},
	})
}

func TestFormatUnclosed(t *testing.T) {
	run(t, []formatCase{
		{name: "bold", text: "[b]x", want: "[b]x"},
		{name: "bold end cut", text: "[b]x[/b", want: "[b]x[/b"},
		{name: "end only", text: "x[/b]", want: "x[/b]"},
		{name: "quote", text: "[quote]x", want: "[quote]x"},
		{name: "colour", text: "[color=red]x[/colour]", want: "[color=red]x[/colour]"},
		{name: "one of two", text: "[b]x[b]y[/b]", want: "<strong>x[b]y</strong>"},
	})
}

// Holo ran each pattern once, in its order, non-greedy, and a browser nested
// the HTML that came out. These cases record what that gives.
func TestFormatFollowsHolosPasses(t *testing.T) {
	run(t, []formatCase{
		{name: "same tag twice", text: "[b][b]x[/b][/b]", want: "<strong>[b]x</strong>[/b]"},
		{name: "quote in a quote", text: "[quote][quote]x[/quote][/quote]", want: quote + "[quote]x</div>[/quote]"},
		{name: "url in a url", text: "[url=http://a.example/][url=http://b.example/]x[/url][/url]", want: "<a href='http://a.example/'>[url=http://b.example/]x</a>[/url]"},
		{name: "bold in italic", text: "[i][b]x[/b][/i]", want: "<em><strong>x</strong></em>"},
		{name: "italic in bold", text: "[b][i]x[/i][/b]", want: "<strong><em>x</em></strong>"},
		{name: "tags in a colour", text: "[color=red][b]x[/b][/color]", want: "<span class='text-red-600'><strong>x</strong></span>"},
		{name: "tags and smilies in code", text: "[code][b]x[/b] :)[/code]", smilies: true, want: "<pre><strong>x</strong> " + smiley("smile") + "</pre>"},
		{name: "small in large", text: "[size=large]a[size=small]b[/size]c[/size]", want: "<span class='text-base'>a<span class='text-[10px]'>b</span>c</span>"},
		{name: "large in small", text: "[size=small]a[size=large]b[/size]c[/size]", want: "<span class='text-[10px]'>a<span class='text-base'>b</span>c</span>"},
		{name: "crossed bold and italic", text: "[b]a[i]b[/b]c[/i]", want: "<strong>a<em>b</em></strong><em>c</em>"},
		{name: "crossed italic and bold", text: "[i]a[b]b[/i]c[/b]", want: "<em>a<strong>b</strong></em><strong>c</strong>"},
		{name: "bold across a quote", text: "[b]a[quote]b[/b]c[/quote]d", want: "<strong>a</strong>" + quote + "<strong>b</strong>c</div>d"},
		{name: "quote across bold", text: "[quote]a[b]b[/quote]c[/b]", want: quote + "a<strong>b</strong></div><strong>c</strong>"},
		{name: "code across a quote", text: "[code]a[quote]b[/code]c[/quote]d", want: "<pre>a" + quote + "b</div></pre>cd"},
		{name: "quote across code", text: "[quote]a[code]b[/quote]c[/code]", want: quote + "a<pre>b</pre></div>c"},
		{name: "link in a url", text: "[url=http://a.example/]x[link=http://b.example/]y[/link]z[/url]", want: "<a href='http://a.example/'>x</a><a href='http://b.example/'>y</a>z"},
		{name: "link in a quote in a url", text: "[url=http://a.example/]x[quote]y[link=http://b.example/]z[/link][/quote][/url]", want: "<a href='http://a.example/'>x</a>" + quote + "<a href='http://a.example/'>y</a><a href='http://b.example/'>z</a></div>"},
		{name: "url in a bad link", text: "[link=javascript:x]a[url=http://b.example/]b[/url]c[/link]", want: "a<a href='http://b.example/'>b</a>c"},
		{name: "colour across a quote", text: "[color=red]a[quote]b[/color]c[/quote]", want: "<span class='text-red-600'>a</span>" + quote + "<span class='text-red-600'>b</span>c</div>"},
		{
			name: "four tags crossed around a quote, of which the standard reopens three",
			text: "[b]1[i]2[u]3[s]4[color=red]5[quote]6[/b]7[/i][/u][/s][/color][/quote]",
			want: "<strong>1<em>2<u>3<s>4<span class='text-red-600'>5</span></s></u></em></strong>" +
				"<u><s><span class='text-red-600'></span></s></u><s><span class='text-red-600'></span></s><span class='text-red-600'></span>" +
				quote + "<span class='text-red-600'><s><u><strong>6</strong>7</u></s></span></div>",
		},
	})
}

var tagPattern = regexp.MustCompile(`<(/?)([a-z]+)[^>]*>`)

// wellFormed reports a tag that closes out of order, an element left open, or
// a link inside a link: any of them would let a note reach the page around it.
func wellFormed(html string) error {
	var open []string
	for _, m := range tagPattern.FindAllStringSubmatch(html, -1) {
		name := m[2]
		switch {
		case name == "br" || name == "img":
		case m[1] == "":
			if name == "a" && slices.Contains(open, "a") {
				return fmt.Errorf("a link inside a link")
			}
			open = append(open, name)
		case len(open) == 0 || open[len(open)-1] != name:
			return fmt.Errorf("</%s> with %v open", name, open)
		default:
			open = open[:len(open)-1]
		}
	}
	if len(open) > 0 {
		return fmt.Errorf("%v left open", open)
	}
	return nil
}

func TestFormatIsWellFormed(t *testing.T) {
	pieces := []string{
		"[b]", "[/b]", "[i]", "[/i]", "[u]", "[/u]", "[s]", "[/s]", "[quote]", "[/quote]",
		"[link=http://a.example/]", "[link=javascript:x]", "[/link]", "[url=https://b.example/]", "[/url]",
		"[color=red]", "[color=purple]", "[/color]", "[size=small]", "[size=large]", "[/size]",
		"[code]", "[/code]", "x", " ", "\n", ":)", "<", "'", "[", "]",
	}
	r := rand.New(rand.NewPCG(1, 2))
	for range 5000 {
		var b strings.Builder
		for range r.IntN(40) {
			b.WriteString(pieces[r.IntN(len(pieces))])
		}
		text := b.String()
		if err := wellFormed(string(Format(text, true))); err != nil {
			t.Fatalf("Format(%q): %v", text, err)
		}
	}
}
