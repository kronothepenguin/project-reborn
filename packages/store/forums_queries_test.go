package store

import (
	"fmt"
	"slices"
	"testing"
	"time"
)

// startThread writes a thread with its first post, as the CMS does.
func startThread(t *testing.T, q *Queries, avatar int64, title string, at time.Time) ForumThread {
	t.Helper()
	thread, err := q.CreateForumThread(t.Context(), CreateForumThreadParams{AvatarID: avatar, Title: title, CreatedAt: at})
	if err != nil {
		t.Fatalf("CreateForumThread %s: %v", title, err)
	}
	reply(t, q, thread.ID, avatar, "First post of "+title, at)
	return thread
}

func reply(t *testing.T, q *Queries, thread, avatar int64, body string, at time.Time) ForumPost {
	t.Helper()
	post, err := q.CreateForumPost(t.Context(), CreateForumPostParams{ForumThreadID: thread, AvatarID: avatar, Body: body, CreatedAt: at})
	if err != nil {
		t.Fatalf("CreateForumPost: %v", err)
	}
	return post
}

func board(t *testing.T, q *Queries, sticky bool, limit, offset int64) []ListForumThreadsRow {
	t.Helper()
	return must(q.ListForumThreads(t.Context(), ListForumThreadsParams{Sticky: sticky, RowLimit: limit, RowOffset: offset}))
}

func threadTitles(rows []ListForumThreadsRow) []string {
	titles := make([]string, 0, len(rows))
	for _, row := range rows {
		titles = append(titles, row.Title)
	}
	return titles
}

func TestEveryThreadHasAPlaceOnTheBoard(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	var want []string
	for i := range 30 {
		title := fmt.Sprintf("Thread %02d", i)
		startThread(t, q, frank.ID, title, testNow.Add(time.Duration(i)*time.Minute))
		want = append(want, title)
	}
	for i, title := range []string{"Rules", "News"} {
		thread := startThread(t, q, frank.ID, title, testNow.Add(time.Duration(i)*time.Second))
		if _, err := q.UpdateForumThread(ctx, UpdateForumThreadParams{ID: thread.ID, Title: title, Sticky: true}); err != nil {
			t.Fatal(err)
		}
	}

	if n := must(q.CountForumThreads(ctx)); n != 30 {
		t.Errorf("the board counts %d threads, want the 30 that are not sticky", n)
	}
	if got := threadTitles(board(t, q, true, -1, 0)); !slices.Equal(got, []string{"News", "Rules"}) {
		t.Errorf("stickies = %v, want both, newest post first", got)
	}
	var seen []string
	for page := range int64(3) {
		rows := board(t, q, false, 10, page*10)
		if len(rows) != 10 {
			t.Errorf("page %d holds %d threads", page+1, len(rows))
		}
		seen = append(seen, threadTitles(rows)...)
	}
	slices.Reverse(want)
	if !slices.Equal(seen, want) {
		t.Errorf("the pages list %v, want every thread once, newest post first: %v", seen, want)
	}

	// A reply takes its thread to the top.
	oldest := must(q.ListForumThreads(ctx, ListForumThreadsParams{Sticky: false, RowLimit: 1, RowOffset: 29}))[0]
	reply(t, q, oldest.ID, frank.ID, "Up", testNow.Add(time.Hour))
	if top := board(t, q, false, 1, 0)[0]; top.Title != "Thread 00" || top.Replies != 1 || !top.LastPostAt.Equal(testNow.Add(time.Hour)) {
		t.Errorf("after a reply the top thread is %+v", top)
	}
}

func TestCountsAndLastPostsFollowTheirPosts(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, dora := createUserWithHabbo(t, q, "dora@example.com", "Dora")
	thread := startThread(t, q, frank.ID, "Hello", testNow)
	reply(t, q, thread.ID, dora.ID, "Hi", testNow.Add(time.Minute))
	last := reply(t, q, thread.ID, frank.ID, "Bye", testNow.Add(2*time.Minute))

	row := board(t, q, false, 10, 0)[0]
	if row.Replies != 2 || row.LastPosterName != "Frank" || row.OpenerName != "Frank" || row.Views != 0 {
		t.Errorf("the row = %+v, want 2 replies, Frank last", row)
	}
	if got := must(q.GetLastForumPostAt(ctx, frank.ID)); !got.Equal(testNow.Add(2 * time.Minute)) {
		t.Errorf("Frank's last post at %v", got)
	}
	if _, err := q.GetLastForumPostAt(ctx, 9999); !IsNotFound(err) {
		t.Errorf("a habbo without posts: %v, want not found", err)
	}

	if _, err := q.DeleteForumPost(ctx, last.ID); err != nil {
		t.Fatal(err)
	}
	row = board(t, q, false, 10, 0)[0]
	if row.Replies != 1 || row.LastPosterName != "Dora" || !row.LastPostAt.Equal(testNow.Add(time.Minute)) {
		t.Errorf("after deleting the last post the row = %+v, want Dora's", row)
	}
	posts := must(q.ListForumPosts(ctx, ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: 10}))
	if len(posts) != 2 || posts[0].Messages != 1 || posts[1].Messages != 1 {
		t.Errorf("posts = %+v, want each habbo's one remaining message", posts)
	}

	if n := must(q.DeleteEmptyForumThread(ctx, thread.ID)); n != 0 {
		t.Errorf("a thread with posts was deleted")
	}
	for _, post := range posts {
		if _, err := q.DeleteForumPost(ctx, post.ID); err != nil {
			t.Fatal(err)
		}
	}
	if n := must(q.DeleteEmptyForumThread(ctx, thread.ID)); n != 1 {
		t.Errorf("the empty thread stayed")
	}
}
