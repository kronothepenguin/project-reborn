---
type: Reference
title: The staff log
description: How writeLog writes one staff_logs row for every mutation, inside its transaction, settings writes included.
---

# writeLog

Every mutation writes one `staff_logs` row through `writeLog` in `internal/router/router.go`, in the mutation's
transaction when it has one, so the row and the change commit or roll back together. The actor, the address and the
time come from the request, and the mutation gives the action, the detail and the target user or habbo. The actions
are the constants of that file.

# Settings and the note

A settings save and the note run in `inTx`: the row and every `settings.Set` take the transaction's queries, so they
commit or roll back together. Rows hold the keys that changed and leave their values out, because a value can be a
secret.

# Refusals

A refusal of the access groups' guard or of a staff level is logged after the transaction rolled back, because the
pool has one connection ([access group editing](/access-groups.md)).

# The page

`GET /logs` reads the rows newest first, `logsPerPage` (100) a page. The table only grows, so the page splits it with
Older and Newer links (`paging` in `logs.go`).

# The client files

The import of the client files runs in `inTx` as well: its row commits with the rows it wrote
([The client files](/client-files.md)).
