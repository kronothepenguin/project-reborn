package store

import (
	"database/sql"
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

func TestAThreadsPostsShowTheirHabbos(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, dora := createUserWithHabbo(t, q, "dora@example.com", "Dora")
	if _, err := db.ExecContext(ctx, `UPDATE avatars SET motto = 'Hi there' WHERE id = ?`, frank.ID); err != nil {
		t.Fatal(err)
	}
	// Granting wears the badge, so AAA comes off before ADM goes on.
	for _, code := range []string{"AAA", "ADM"} {
		if err := q.TakeOffAvatarBadge(ctx, frank.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := q.GrantAvatarBadge(ctx, GrantAvatarBadgeParams{AvatarID: frank.ID, Code: code, GrantedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	joined := sql.NullTime{Time: testNow, Valid: true}
	other := must(q.CreateGroup(ctx, CreateGroupParams{AvatarID: dora.ID, Name: "Other", Badge: "b1101X", Access: "open", CreatedAt: testNow, UpdatedAt: testNow}))
	if err := q.AddGroupMember(ctx, AddGroupMemberParams{GroupID: other.ID, AvatarID: frank.ID, Role: "member", RequestedAt: testNow, JoinedAt: joined}); err != nil {
		t.Fatal(err)
	}
	club := must(q.CreateGroup(ctx, CreateGroupParams{AvatarID: frank.ID, Name: "Club", Badge: "b0503X", Access: "open", CreatedAt: testNow, UpdatedAt: testNow}))
	if err := q.AddGroupMember(ctx, AddGroupMemberParams{GroupID: club.ID, AvatarID: frank.ID, Role: "admin", RequestedAt: testNow, JoinedAt: joined}); err != nil {
		t.Fatal(err)
	}
	if _, err := q.SetFavouriteGroup(ctx, SetFavouriteGroupParams{GroupID: club.ID, AvatarID: frank.ID}); err != nil {
		t.Fatal(err)
	}

	thread := startThread(t, q, frank.ID, "Long", testNow)
	for i := range 11 {
		reply(t, q, thread.ID, dora.ID, fmt.Sprintf("Reply %d", i), testNow.Add(time.Duration(i+1)*time.Minute))
	}
	first := must(q.ListForumPosts(ctx, ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: 10}))
	second := must(q.ListForumPosts(ctx, ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: 10, RowOffset: 10}))
	if n := must(q.CountForumPosts(ctx, thread.ID)); n != 12 || len(first) != 10 || len(second) != 2 || second[1].Body != "Reply 10" {
		t.Fatalf("pages of %d and %d of %d posts, last %q", len(first), len(second), n, second[len(second)-1].Body)
	}
	opening := first[0]
	if opening.AuthorName != "Frank" || opening.AuthorFigure != frank.Figure || opening.AuthorMotto != "Hi there" ||
		opening.Badge != "ADM" || opening.GroupID != club.ID || opening.GroupBadge != "b0503X" || opening.Messages != 1 || opening.EditedAt.Valid {
		t.Errorf("the opening post = %+v", opening)
	}
	if first[1].AuthorName != "Dora" || first[1].Messages != 11 || first[1].Badge != "" || first[1].GroupID != 0 {
		t.Errorf("Dora's post = %+v", first[1])
	}
	if n := must(q.CountAvatarForumPosts(ctx, dora.ID)); n != 11 {
		t.Errorf("Dora has %d posts, want 11", n)
	}

	edited := testNow.Add(time.Hour)
	if _, err := q.EditForumPost(ctx, EditForumPostParams{ID: opening.ID, Body: "Changed", EditedAt: sql.NullTime{Time: edited, Valid: true}, EditedByAvatarID: dora.ID}); err != nil {
		t.Fatal(err)
	}
	if err := q.CountForumThreadView(ctx, thread.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := q.UpdateForumThread(ctx, UpdateForumThreadParams{ID: thread.ID, Title: "Longer", Locked: true}); err != nil {
		t.Fatal(err)
	}
	got := must(q.ListForumPosts(ctx, ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: 1}))[0]
	if got.Body != "Changed" || !got.EditedAt.Time.Equal(edited) || got.EditorName != "Dora" {
		t.Errorf("the edited post = %+v", got)
	}
	if th := must(q.GetForumThread(ctx, thread.ID)); th.Views != 1 || th.Title != "Longer" || !th.Locked || th.Sticky {
		t.Errorf("the thread = %+v", th)
	}

	if _, err := q.DeleteForumThread(ctx, thread.ID); err != nil {
		t.Fatal(err)
	}
	if n := must(q.CountForumPosts(ctx, thread.ID)); n != 0 {
		t.Errorf("%d posts outlived their thread", n)
	}
}

func TestArchivedHabbosAreFlaggedOnTheBoard(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, dora := createUserWithHabbo(t, q, "dora@example.com", "Dora")
	thread := startThread(t, q, dora.ID, "Mine", testNow)
	post := reply(t, q, thread.ID, frank.ID, "Hi", testNow.Add(time.Minute))
	if _, err := q.EditForumPost(ctx, EditForumPostParams{ID: post.ID, Body: "Hello", EditedAt: sql.NullTime{Time: testNow.Add(time.Hour), Valid: true}, EditedByAvatarID: dora.ID}); err != nil {
		t.Fatal(err)
	}
	if n := must(q.ArchiveAvatar(ctx, ArchiveAvatarParams{ID: dora.ID, UserID: dora.UserID, ArchivedAt: sql.NullTime{Time: testNow, Valid: true}, UpdatedAt: testNow})); n != 1 {
		t.Fatalf("archived %d habbos", n)
	}
	row := board(t, q, false, 10, 0)[0]
	if !row.OpenerArchivedAt.Valid || row.LastPosterArchivedAt.Valid {
		t.Errorf("the row = %+v, want the opener archived and the last poster not", row)
	}
	posts := must(q.ListForumPosts(ctx, ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: 10}))
	if !posts[0].AuthorArchivedAt.Valid || posts[1].AuthorArchivedAt.Valid || !posts[1].EditorArchivedAt.Valid {
		t.Errorf("posts = %+v, want Dora archived as author and editor", posts)
	}
}
