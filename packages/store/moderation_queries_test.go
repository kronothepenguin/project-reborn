package store

import (
	"database/sql"
	"testing"
)

func TestAHabboWaitsOnItsHelpRequestsAndReportsAlike(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	staff, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, dora := createUserWithHabbo(t, q, "dora@example.com", "Dora")
	post := reply(t, q, startThread(t, q, dora.ID, "Hello", testNow).ID, dora.ID, "Rude", testNow).ID
	ask := func(avatar int64, post sql.NullInt64) {
		t.Helper()
		err := q.CreateHelpTicket(ctx, CreateHelpTicketParams{AvatarID: avatar, ForumPostID: post, Subject: "Subject", Message: "Message", IP: "10.0.0.1", CreatedAt: testNow})
		if err != nil {
			t.Fatalf("CreateHelpTicket: %v", err)
		}
	}
	waiting := func(avatar int64) int64 {
		t.Helper()
		return must(q.CountWaitingHelpTickets(ctx, avatar))
	}

	ask(frank.ID, sql.NullInt64{})
	ask(frank.ID, sql.NullInt64{Int64: post, Valid: true})
	if got := waiting(frank.ID); got != 2 {
		t.Errorf("Frank waits on %d tickets, want his request and his report", got)
	}
	if got := waiting(dora.ID); got != 0 {
		t.Errorf("Dora waits on %d of Frank's tickets", got)
	}

	tickets := must(q.ListUnclosedHelpTickets(ctx, ListUnclosedHelpTicketsParams{RowLimit: 10}))
	if len(tickets) != 2 {
		t.Fatalf("the queue holds %d tickets, want 2", len(tickets))
	}
	report := must(q.GetHelpTicket(ctx, tickets[0].ID))
	if report.ForumPostID != (sql.NullInt64{Int64: post, Valid: true}) || report.Habbo.String != "Frank" || report.PickedUpAt.Valid {
		t.Errorf("the report = %+v", report)
	}
	for i, ticket := range tickets {
		picked := must(q.PickUpHelpTicket(ctx, PickUpHelpTicketParams{
			ID:               ticket.ID,
			PickedUpByUserID: sql.NullInt64{Int64: staff.ID, Valid: true},
			PickedUpAt:       sql.NullTime{Time: testNow, Valid: true},
		}))
		if picked != 1 {
			t.Fatalf("PickUpHelpTicket %d = %d", ticket.ID, picked)
		}
		if got, want := waiting(frank.ID), int64(len(tickets)-i-1); got != want {
			t.Errorf("after %d picked up Frank waits on %d tickets, want %d", i+1, got, want)
		}
	}
}
