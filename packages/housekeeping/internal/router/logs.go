package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const logsPerPage = 100

// paging splits a list into pages, in the terms of Older and Newer.
type paging struct {
	offset int64
	older  int
	newer  int
}

func pageOf(req *http.Request, total int64, perPage int) paging {
	last := max(int((total+int64(perPage)-1)/int64(perPage)), 1)
	current, err := strconv.Atoi(req.URL.Query().Get("page"))
	if err != nil || current < 1 {
		current = 1
	}
	current = min(current, last)
	page := paging{offset: int64((current - 1) * perPage)}
	if current < last {
		page.older = current + 1
	}
	if current > 1 {
		page.newer = current - 1
	}
	return page
}

type logsPage struct {
	chrome
	Logs  []logRow
	Older int
	Newer int
}

type logRow struct {
	Action string
	User   string
	Target string
	Detail string
	IP     string
	Date   string
}

// HandleLogsView renders GET /housekeeping/logs. Holo listed every row and could
// prune them; here rows are never deleted, so the list comes in pages.
func (r *Router) HandleLogsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	total, err := r.deps.Queries.CountStaffLogs(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	paged := pageOf(req, total, logsPerPage)

	rows, err := r.deps.Queries.ListStaffLogs(ctx, store.ListStaffLogsParams{
		RowLimit:  logsPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		r.fail(w, err)
		return
	}

	page := logsPage{chrome: r.chrome(req), Older: paged.older, Newer: paged.newer}
	for _, row := range rows {
		page.Logs = append(page.Logs, logRow{
			Action: row.Action,
			User:   named(row.UserName, row.UserID),
			Target: named(row.TargetName, row.TargetUserID),
			Detail: row.Detail,
			IP:     row.IP,
			Date:   row.CreatedAt.UTC().Format(dateFormat),
		})
	}
	astro.WriteTemplate(w, r.deps.Resolver, "logs.html", page)
}

// named writes a user as Holo's log did, or N/A for a row with no such user.
func named(name string, id sql.NullInt64) string {
	switch {
	case id.Valid && name != "":
		return fmt.Sprintf("%s (ID: %d)", name, id.Int64)
	case name != "":
		return name
	default:
		return "N/A"
	}
}
