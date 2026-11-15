package r26

import "time"

// serverDate is hh_shared's message with the server's date (packages/server/knowledge/r26/hh_shared.md).
const serverDate = 163

// sharedHandlers handles hh_shared's commands.
var sharedHandlers = map[int]handler{
	49: handleGetDate,
}

// handleGetDate sends today's date as day-month-year, in UTC, as the site shows its dates.
func handleGetDate(s *session, _ []byte) {
	s.reply(serverDate, []byte(time.Now().UTC().Format("02-01-2006")))
}
