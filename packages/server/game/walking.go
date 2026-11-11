package game

import (
	"container/heap"
	"slices"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// stepTime is how long a step takes: the time the client's Human class animates one (plans/server decision 0065).
const stepTime = 500 * time.Millisecond

// Statuses tells the habbos in a room the statuses that changed on one tick of its clock, in one message.
type Statuses struct{ Occupants []room.Occupant }

// startClock runs a loaded room's clock until the room unloads (plans/server decision 0072): every stepTime, the
// statuses whose time is up end (plans/server decision 0075), each habbo that carries a drink sips it in its time,
// each walking habbo takes a step, and the statuses that changed go to the room in one message.
func startClock(r *room.Room) {
	go func() {
		t := time.NewTicker(stepTime)
		defer t.Stop()
		for {
			select {
			case <-r.Done():
				return
			case <-t.C:
				tick(r)
			}
		}
	}()
}

func tick(r *room.Room) {
	floor, now := r.Floor(), time.Now()
	var leaving []room.Occupant
	sent := r.Tick(func(all []*room.Occupant) []room.Occupant {
		var sent []room.Occupant
		for _, o := range all {
			if statuses, dropped := expire(o.Statuses, now); dropped {
				o.Statuses, o.Changed = statuses, true
			}
			sip(o, now)
			switch {
			case o.Walking:
				step := walk(floor, all, o)
				if o.Leaving && !o.Walking {
					leaving = append(leaving, *o)
					continue
				}
				sent = append(sent, step)
			case o.Changed:
				o.Changed = false
				sent = append(sent, snapshot(o))
			}
		}
		return sent
	})
	if len(sent) > 0 {
		broadcast(r, Statuses{Occupants: sent})
	}
	// A kicked habbo that stopped, at the door or with no way to it, leaves the room there (plans/server decision 0079).
	for _, o := range leaving {
		o.Session.Notify(Kicked{})
		LeaveRoom(o.AvatarID, o.Session)
	}
}

// walk takes the habbo a step towards its goal, as Holo's status cycle did, and returns the status to send: where it
// stands, with mv and the tile it steps to, which the client animates. A habbo at its goal, or that has no way to it,
// stops, and its status goes without mv. A habbo walks at the floor's height, or at a rug's on a rug. A step onto a
// seat or a bed sits or lays the habbo on the next tick, at the furni's top and facing its way.
func walk(floor room.Floor, all []*room.Occupant, o *room.Occupant) room.Occupant {
	o.Changed = false
	o.Statuses = without(o.Statuses, "mv")
	next, ok := nextStep(floor, all, o)
	if !ok {
		o.Walking = false
		return snapshot(o)
	}
	t, _ := floor.At(next.x, next.y)
	o.HeadDirection = direction(o.X, o.Y, next.x, next.y)
	o.BodyDirection = o.HeadDirection
	o.Statuses = without(o.Statuses, "sit", "lay")
	at := float64(t.Height)
	if t.State == room.Open {
		at = t.Level
	}
	o.Statuses = append(o.Statuses, room.Status{
		Action:     "mv",
		Parameters: strconv.Itoa(next.x) + "," + strconv.Itoa(next.y) + "," + level(at),
	})
	sent := snapshot(o)
	o.X, o.Y, o.Height = next.x, next.y, at
	if action, ok := restsOn[t.State]; ok {
		o.Statuses = without(o.Statuses, "dance")
		o.HeadDirection, o.BodyDirection = t.Direction, t.Direction
		o.Statuses = append(o.Statuses, room.Status{Action: action, Parameters: level(t.Level)})
	}
	return sent
}

// restsOn names what a habbo does on the tiles that take one at rest.
var restsOn = map[room.TileState]string{room.Seat: "sit", room.Bed: "lay"}

// level writes a height as Holo wrote one: 1, or 1.5.
func level(v float64) string {
	return strconv.FormatFloat(v, 'f', -1, 64)
}

func snapshot(o *room.Occupant) room.Occupant {
	s := *o
	s.Statuses = slices.Clone(o.Statuses)
	return s
}

func without(statuses []room.Status, actions ...string) []room.Status {
	return slices.DeleteFunc(statuses, func(s room.Status) bool { return slices.Contains(actions, s.Action) })
}

type tile struct{ x, y int }

// nextStep finds the first step of the shortest way from the habbo to its goal, by A*: every step takes the same time,
// straight or diagonal. A step goes to one of the 8 tiles around, open and free of other habbos, up or down at most 1
// height; a diagonal only when both tiles beside it are open and free, so that nobody cuts a corner. The goal may be a
// seat or a bed, but not a tile another habbo holds. It reports false at the goal, or with no way to it.
func nextStep(floor room.Floor, all []*room.Occupant, o *room.Occupant) (tile, bool) {
	start, goal := tile{o.X, o.Y}, tile{o.GoalX, o.GoalY}
	if start == goal {
		return tile{}, false
	}
	held := make(map[tile]bool, len(all))
	for _, other := range all {
		if other.AvatarID != o.AvatarID {
			held[tile{other.X, other.Y}] = true
		}
	}
	free := func(t tile) bool {
		at, ok := floor.At(t.x, t.y)
		if !ok || held[t] {
			return false
		}
		_, rests := restsOn[at.State]
		return at.State == room.Open || (t == goal && rests)
	}
	if !free(goal) {
		return tile{}, false
	}
	height := func(t tile) int {
		at, _ := floor.At(t.x, t.y)
		return at.Height
	}

	from := map[tile]tile{}
	cost := map[tile]int{start: 0}
	open := &frontier{}
	heap.Push(open, node{t: start, f: distance(start, goal), tie: euclid(start, goal)})
	for open.Len() > 0 {
		cur := heap.Pop(open).(node).t
		if cur == goal {
			for from[cur] != start {
				cur = from[cur]
			}
			return cur, true
		}
		for _, d := range directions {
			next := tile{cur.x + d.x, cur.y + d.y}
			if !free(next) || abs(height(next)-height(cur)) > 1 {
				continue
			}
			if d.x != 0 && d.y != 0 && (!free(tile{cur.x + d.x, cur.y}) || !free(tile{cur.x, cur.y + d.y})) {
				continue
			}
			c := cost[cur] + 1
			if known, ok := cost[next]; ok && known <= c {
				continue
			}
			cost[next], from[next] = c, cur
			heap.Push(open, node{t: next, f: c + distance(next, goal), tie: euclid(next, goal)})
		}
	}
	return tile{}, false
}

// directions are the 8 steps around a tile, in the order the client counts directions: 0 north, then clockwise.
var directions = []tile{{0, -1}, {1, -1}, {1, 0}, {1, 1}, {0, 1}, {-1, 1}, {-1, 0}, {-1, -1}}

// direction returns the way from x1, y1 to x2, y2, 0 north and then clockwise, as Holo's Rotation.Calculate does.
func direction(x1, y1, x2, y2 int) int {
	dx, dy := sign(x2-x1), sign(y2-y1)
	if dx == 0 && dy == 0 {
		return 0
	}
	return slices.Index(directions, tile{dx, dy})
}

// distance is the number of steps between two tiles with nothing in the way.
func distance(a, b tile) int { return max(abs(a.x-b.x), abs(a.y-b.y)) }

// euclid breaks the ties of distance towards the straight line to the goal, so that a way looks as a person walks it.
func euclid(a, b tile) int { return (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y) }

func abs(v int) int { return max(v, -v) }

func sign(v int) int {
	switch {
	case v > 0:
		return 1
	case v < 0:
		return -1
	}
	return 0
}

type node struct {
	t      tile
	f, tie int
}

type frontier []node

func (q frontier) Len() int { return len(q) }
func (q frontier) Less(i, j int) bool {
	if q[i].f != q[j].f {
		return q[i].f < q[j].f
	}
	return q[i].tie < q[j].tie
}
func (q frontier) Swap(i, j int) { q[i], q[j] = q[j], q[i] }
func (q *frontier) Push(x any)   { *q = append(*q, x.(node)) }
func (q *frontier) Pop() any {
	old := *q
	n := old[len(old)-1]
	*q = old[:len(old)-1]
	return n
}

// Walk sends the habbo walking to the tile x, y of its room (MOVE): the room's clock takes it a step on each tick. A
// tile off the floor, such as the 1000, 1000 the sound machine's editor sends, changes nothing, and so does any tile
// for a habbo walking out, kicked or banned.
func Walk(viewer habbo.Habbo, x, y int) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return
	}
	if _, ok := r.Floor().At(x, y); !ok {
		return
	}
	r.Update(viewer.ID, func(o *room.Occupant) {
		if !o.Leaving {
			o.Walking, o.GoalX, o.GoalY = true, x, y
		}
	})
}

// LookTo turns the habbo, head and body, to the tile x, y (LOOKTO), unless it sits or lies, as Holo had it. Its status
// goes to the room on the clock's next tick.
func LookTo(viewer habbo.Habbo, x, y int) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return
	}
	r.Update(viewer.ID, func(o *room.Occupant) {
		if o.X == x && o.Y == y || slices.ContainsFunc(o.Statuses, func(s room.Status) bool { return s.Action == "sit" || s.Action == "lay" }) {
			return
		}
		o.HeadDirection = direction(o.X, o.Y, x, y)
		o.BodyDirection = o.HeadDirection
		o.Changed = true
	})
}
