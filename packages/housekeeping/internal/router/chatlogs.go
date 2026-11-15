package router

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const chatLogsPerPage = 100

type chatLogsPage struct {
	chrome
	Message string
	Error   string
	Query   string
	Lines   []chatLogRow
	Older   int
	Newer   int
}

type chatLogRow struct {
	Username string
	Room     string
	Time     string
	Text     string
}

// HandleChatLogsView renders GET /housekeeping/chatlogs, HoloCMS's Chat Log Viewer. A room's id or a habbo's name
// finds the lines said there or by it, newest first, 100 a page where HoloCMS showed every line (decision
// server/0085); the id finds a public room's lines and a habbo room's, which the Room ID column tells apart
// (decision server/0086).
func (r *Router) HandleChatLogsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	page := chatLogsPage{chrome: r.chrome(req)}
	if req.URL.Query().Has("query") {
		page.Query = strings.TrimSpace(req.URL.Query().Get("query"))
		search := store.CountChatLogParams{Room: -1, Name: page.Query}
		if id, err := strconv.ParseInt(page.Query, 10, 64); err == nil {
			search.Room = id
		}
		total, err := r.deps.Queries.CountChatLog(ctx, search)
		if err != nil {
			r.fail(w, err)
			return
		}
		paged := pageOf(req, total, chatLogsPerPage)
		rows, err := r.deps.Queries.SearchChatLog(ctx, store.SearchChatLogParams{
			Room:      search.Room,
			Name:      search.Name,
			RowLimit:  chatLogsPerPage,
			RowOffset: paged.offset,
		})
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Older, page.Newer = paged.older, paged.newer
		page.Message = "Nothing found."
		if total > 0 {
			page.Message = "Now showing chat logs.."
		}
		for _, row := range rows {
			page.Lines = append(page.Lines, chatLogRow{
				Username: row.Name,
				Room:     chatLogRoom(row),
				Time:     row.SaidAt.UTC().Format(dateFormat),
				Text:     row.Text,
			})
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "chatlogs.html", page)
}

func chatLogRoom(row store.SearchChatLogRow) string {
	switch {
	case row.PublicRoomID.Valid:
		return "Public " + strconv.FormatInt(row.PublicRoomID.Int64, 10)
	case row.RoomID.Valid:
		return strconv.FormatInt(row.RoomID.Int64, 10)
	}
	return "-"
}
