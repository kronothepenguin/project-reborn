package habbo

import (
	"sync"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type session struct{ events []any }

func (s *session) Notify(event any) { s.events = append(s.events, event) }

func reset(t *testing.T) {
	t.Cleanup(func() {
		mu.Lock()
		clear(online)
		mu.Unlock()
	})
}

func frank(s Session) Habbo {
	return Habbo{Avatar: store.Avatar{ID: 7, UserID: 3, Name: "Frank"}, Session: s}
}

func TestAHabboIsOnlineFromAddUntilItsSessionDropsIt(t *testing.T) {
	reset(t)
	s, other := &session{}, &session{}
	if _, ok := Get(7); ok {
		t.Fatal("Frank is online before logging in")
	}
	if _, replaced := Add(frank(s)); replaced {
		t.Error("the first login replaced a habbo")
	}
	if h, ok := Get(7); !ok || h.Name != "Frank" || h.Session != s {
		t.Errorf("Get(7) = %+v, %t, want Frank on his session", h, ok)
	}

	if Drop(7, other) {
		t.Error("another session dropped Frank")
	}
	if _, ok := Get(7); !ok {
		t.Error("Frank went offline when another session dropped him")
	}
	if !Drop(7, s) {
		t.Error("Frank's session did not drop him")
	}
	if _, ok := Get(7); ok {
		t.Error("Frank is still online after his session dropped him")
	}
}

func TestASecondLoginReplacesTheFirstSession(t *testing.T) {
	reset(t)
	first, second := &session{}, &session{}
	Add(frank(first))

	replaced, ok := Add(frank(second))
	if !ok || replaced.Session != first {
		t.Errorf("Add() replaced %+v, %t, want Frank on the first session", replaced, ok)
	}
	if h, _ := Get(7); h.Session != second {
		t.Error("Frank is not on the second session")
	}
	if Drop(7, first) {
		t.Error("the replaced session dropped Frank")
	}
	if !Drop(7, second) {
		t.Error("the second session did not drop Frank")
	}
}

func TestOnlineHabbosAreSafeForConcurrentUse(t *testing.T) {
	reset(t)
	var wg sync.WaitGroup
	for range 8 {
		wg.Go(func() {
			s := &session{}
			for range 100 {
				Add(frank(s))
				Get(7)
				Drop(7, s)
			}
		})
	}
	wg.Wait()
}
