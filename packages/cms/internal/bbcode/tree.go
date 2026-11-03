package bbcode

import "slices"

// Holo's passes cross tags, as in <strong>a<em>b</strong>c</em>, and a browser
// nested that HTML with the tree construction of the HTML standard. build runs
// the part of it that Holo's elements reach, on the text alone, so that the
// result renders as Holo's did and no end tag can close the page around it.
//
// Every formatting element on the stack is in the list of active formatting
// elements, so an end tag the list has no element for is ignored. Holo's passes
// never open four identical formatting elements, so the Noah's Ark clause never
// applies.

type node struct {
	token    // text, a smiley, a break, or the start of a tag
	parent   *node
	children []*node
}

func (n *node) appendChild(c *node) {
	if p := c.parent; p != nil {
		p.children = remove(p.children, c)
	}
	c.parent = n
	n.children = append(n.children, c)
}

func (n *node) block() bool {
	return n.tag.element == "div" || n.tag.element == "pre"
}

func remove(nodes []*node, n *node) []*node {
	if i := slices.Index(nodes, n); i >= 0 {
		return slices.Delete(nodes, i, i+1)
	}
	return nodes
}

type builder struct {
	open   []*node // the stack of open elements, the root first
	active []*node // the list of active formatting elements
}

func build(tokens []token) *node {
	root := &node{}
	b := &builder{open: []*node{root}}
	for _, t := range tokens {
		switch t.kind {
		case startKind:
			b.start(&node{token: t})
		case endKind:
			b.end(t.tag.element)
		default:
			b.reconstruct()
			b.current().appendChild(&node{token: t})
		}
	}
	return root
}

func (b *builder) current() *node { return b.open[len(b.open)-1] }

func (b *builder) start(n *node) {
	if n.block() {
		b.current().appendChild(n)
		b.open = append(b.open, n)
		return
	}
	if n.tag.element == "a" {
		if i := b.lastActive("a"); i >= 0 {
			a := b.active[i]
			b.adopt("a")
			b.active = remove(b.active, a)
			b.open = remove(b.open, a)
		}
	}
	b.reconstruct()
	b.current().appendChild(n)
	b.open = append(b.open, n)
	b.active = append(b.active, n)
}

func (b *builder) end(element string) {
	if element != "div" && element != "pre" {
		b.adopt(element)
		return
	}
	for i := len(b.open) - 1; i > 0; i-- {
		if b.open[i].tag.element == element {
			b.open = b.open[:i]
			return
		}
	}
}

func (b *builder) lastActive(element string) int {
	for i := len(b.active) - 1; i >= 0; i-- {
		if b.active[i].tag.element == element {
			return i
		}
	}
	return -1
}

// reconstruct reopens, inside the current node, the formatting elements that a
// block's end closed before their own end tag came.
func (b *builder) reconstruct() {
	i := len(b.active)
	for i > 0 && !slices.Contains(b.open, b.active[i-1]) {
		i--
	}
	for ; i < len(b.active); i++ {
		clone := &node{token: b.active[i].token}
		b.current().appendChild(clone)
		b.open = append(b.open, clone)
		b.active[i] = clone
	}
}

// adopt is the adoption agency algorithm, which ends a formatting element that
// may not be the current node.
func (b *builder) adopt(element string) {
	for range 8 {
		fi := b.lastActive(element)
		if fi < 0 {
			return
		}
		formatting := b.active[fi]
		oi := slices.Index(b.open, formatting)
		if oi < 0 {
			b.active = slices.Delete(b.active, fi, fi+1)
			return
		}
		bi := slices.IndexFunc(b.open[oi:], (*node).block)
		if bi < 0 {
			b.open = b.open[:oi]
			b.active = slices.Delete(b.active, fi, fi+1)
			return
		}
		furthest, common := b.open[oi+bi], b.open[oi-1]
		bookmark, last := fi, furthest
		for x, inner := oi+bi-1, 1; b.open[x] != formatting; x, inner = x-1, inner+1 {
			n := b.open[x]
			ai := slices.Index(b.active, n)
			if inner > 3 && ai >= 0 {
				b.active = slices.Delete(b.active, ai, ai+1)
				if ai < bookmark {
					bookmark--
				}
				ai = -1
			}
			if ai < 0 {
				b.open = slices.Delete(b.open, x, x+1)
				continue
			}
			clone := &node{token: n.token}
			b.active[ai], b.open[x] = clone, clone
			if last == furthest {
				bookmark = ai + 1
			}
			clone.appendChild(last)
			last = clone
		}
		common.appendChild(last)

		clone := &node{token: formatting.token, children: furthest.children}
		for _, c := range clone.children {
			c.parent = clone
		}
		furthest.children = nil
		furthest.appendChild(clone)
		if slices.Index(b.active, formatting) < bookmark {
			bookmark--
		}
		b.active = slices.Insert(remove(b.active, formatting), bookmark, clone)
		b.open = remove(b.open, formatting)
		b.open = slices.Insert(b.open, slices.Index(b.open, furthest)+1, clone)
	}
}
