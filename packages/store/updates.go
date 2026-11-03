package store

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	busyTimeout = 5000
	// A program applying updates at start can wait for another one applying the
	// same updates, and one update can take longer than the usual timeout.
	updateBusyTimeout = 10 * 60 * 1000
	backupAttempts    = 10
)

//go:embed schema/migrations.schema.sql
var migrationsSchema string

//go:embed migrations/*.sql
var updatesFS embed.FS

var embeddedUpdates = sync.OnceValues(func() ([]Update, error) {
	fsys, err := fs.Sub(updatesFS, "migrations")
	if err != nil {
		return nil, err
	}
	return ParseUpdates(fsys)
})

var updateFileName = regexp.MustCompile(`^([0-9]{4})-([a-z0-9]+(?:-[a-z0-9]+)*)\.sql$`)

// Update is one update file: a change to the database that a release brings,
// applied once and in version order.
type Update struct {
	Version int64
	Name    string
	Title   string
	// Automatic marks an update that sign-in needs, applied when a program
	// starts instead of waiting for an administrator.
	Automatic bool
	sql       string
}

// UpdateError names the update that failed. It left nothing behind, and the
// updates before it stay applied.
type UpdateError struct {
	Update Update
	Err    error
}

func (e *UpdateError) Error() string {
	return fmt.Sprintf("store: update %04d-%s: %v", e.Update.Version, e.Update.Name, e.Err)
}

func (e *UpdateError) Unwrap() error {
	return e.Err
}

// Updates returns the updates this program carries, from
// packages/store/migrations, in version order.
func Updates() ([]Update, error) {
	return embeddedUpdates()
}

// ParseUpdates reads the update files at the root of fsys, named
// NNNN-<name>.sql with versions running from 0001 without a gap. A file opens
// with a "-- " title line, and a "-- automatic" line among its first comments
// marks it automatic.
func ParseUpdates(fsys fs.FS) ([]Update, error) {
	entries, err := fs.ReadDir(fsys, ".")
	if err != nil {
		return nil, fmt.Errorf("store: updates: %w", err)
	}
	updates := make([]Update, 0, len(entries))
	for _, entry := range entries {
		match := updateFileName.FindStringSubmatch(entry.Name())
		if entry.IsDir() || match == nil {
			return nil, fmt.Errorf("store: updates: %s is not named NNNN-<name>.sql", entry.Name())
		}
		version, err := strconv.ParseInt(match[1], 10, 64)
		if err != nil {
			return nil, fmt.Errorf("store: updates: %s: %w", entry.Name(), err)
		}
		switch want := int64(len(updates)) + 1; {
		case version == 0:
			return nil, fmt.Errorf("store: updates: %s: versions start at 0001", entry.Name())
		case version < want:
			return nil, fmt.Errorf("store: updates: %s repeats version %04d", entry.Name(), version)
		case version > want:
			return nil, fmt.Errorf("store: updates: %s leaves out version %04d", entry.Name(), want)
		}
		content, err := fs.ReadFile(fsys, entry.Name())
		if err != nil {
			return nil, fmt.Errorf("store: updates: %w", err)
		}
		update, err := parseUpdate(version, match[2], string(content))
		if err != nil {
			return nil, fmt.Errorf("store: updates: %s: %w", entry.Name(), err)
		}
		updates = append(updates, update)
	}
	return updates, nil
}

func parseUpdate(version int64, name, content string) (Update, error) {
	update := Update{Version: version, Name: name, sql: content}
	for i, line := range strings.Split(content, "\n") {
		line = strings.TrimSpace(line)
		text, comment := strings.CutPrefix(line, "--")
		if !comment {
			break
		}
		text = strings.TrimSpace(text)
		switch {
		case i == 0:
			update.Title = text
		case text == "automatic":
			update.Automatic = true
		}
	}
	if update.Title == "" {
		return Update{}, errors.New(`the first line is not a "-- " title`)
	}
	return update, nil
}

// WaitingUpdates returns the updates that db has not applied, in version
// order. It only reads: a database without the migrations table has applied
// none.
func WaitingUpdates(ctx context.Context, db *sql.DB, updates []Update) ([]Update, error) {
	applied, err := AppliedUpdates(ctx, db)
	if err != nil {
		return nil, err
	}
	done := make(map[int64]bool, len(applied))
	for _, migration := range applied {
		done[migration.Version] = true
	}
	var waiting []Update
	for _, update := range updates {
		if !done[update.Version] {
			waiting = append(waiting, update)
		}
	}
	return waiting, nil
}

// AppliedUpdates returns the rows of the migrations table in version order,
// and none when the table does not exist yet.
func AppliedUpdates(ctx context.Context, db *sql.DB) ([]Migration, error) {
	exists, err := migrationsTableExists(ctx, db)
	if err != nil || !exists {
		return nil, err
	}
	migrations, err := New(db).ListMigrations(ctx)
	if err != nil {
		return nil, fmt.Errorf("store: updates: %w", err)
	}
	return migrations, nil
}

func migrationsTableExists(ctx context.Context, db DBTX) (bool, error) {
	var exists bool
	err := db.QueryRowContext(ctx, `SELECT EXISTS (SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'migrations')`).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("store: updates: %w", err)
	}
	return exists, nil
}

// ApplyUpdates applies updates in order, each in its own transaction together
// with its row in migrations, and returns those it applied. It skips an update
// that another program applied meanwhile, and stops at the first failure with
// an *UpdateError.
func ApplyUpdates(ctx context.Context, db *sql.DB, updates []Update) ([]Update, error) {
	conn, err := db.Conn(ctx)
	if err != nil {
		return nil, fmt.Errorf("store: updates: %w", err)
	}
	defer conn.Close()
	if _, err := conn.ExecContext(ctx, fmt.Sprintf("PRAGMA busy_timeout = %d", updateBusyTimeout)); err != nil {
		return nil, fmt.Errorf("store: updates: %w", err)
	}
	defer conn.ExecContext(context.WithoutCancel(ctx), fmt.Sprintf("PRAGMA busy_timeout = %d", busyTimeout))

	var applied []Update
	for _, update := range updates {
		done, err := applyUpdate(ctx, conn, update)
		if err != nil {
			return applied, &UpdateError{Update: update, Err: err}
		}
		if done {
			applied = append(applied, update)
		}
	}
	return applied, nil
}

// applyUpdate turns foreign keys off around the transaction, because SQLite
// ignores the pragma inside one and rebuilding a table needs them off;
// foreign_key_check stands in for them before the commit. BEGIN IMMEDIATE takes
// the write lock first, so two programs never both find an update waiting.
func applyUpdate(ctx context.Context, conn *sql.Conn, update Update) (applied bool, err error) {
	cleanup := context.WithoutCancel(ctx)
	if _, err := conn.ExecContext(ctx, "PRAGMA foreign_keys = OFF"); err != nil {
		return false, err
	}
	defer func() {
		if _, onErr := conn.ExecContext(cleanup, "PRAGMA foreign_keys = ON"); onErr != nil && err == nil {
			err = onErr
		}
	}()
	if _, err := conn.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
		return false, err
	}
	committed := false
	defer func() {
		if !committed {
			conn.ExecContext(cleanup, "ROLLBACK")
		}
	}()

	if _, err := conn.ExecContext(ctx, migrationsSchema); err != nil {
		return false, err
	}
	q := New(conn)
	switch _, err := q.GetMigration(ctx, update.Version); {
	case err == nil:
		return false, nil
	case !IsNotFound(err):
		return false, err
	}
	if _, err := conn.ExecContext(ctx, update.sql); err != nil {
		return false, err
	}
	if err := foreignKeyCheck(ctx, conn); err != nil {
		return false, err
	}
	err = q.CreateMigration(ctx, CreateMigrationParams{Version: update.Version, Name: update.Name, AppliedAt: time.Now().UTC()})
	if err != nil {
		return false, err
	}
	if _, err := conn.ExecContext(ctx, "COMMIT"); err != nil {
		return false, err
	}
	committed = true
	return true, nil
}

func foreignKeyCheck(ctx context.Context, conn *sql.Conn) error {
	rows, err := conn.QueryContext(ctx, "PRAGMA foreign_key_check")
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		var (
			table, parent string
			rowID         sql.NullInt64
			key           int64
		)
		if err := rows.Scan(&table, &rowID, &parent, &key); err != nil {
			return err
		}
		return fmt.Errorf("a row of %s refers to a missing row of %s", table, parent)
	}
	return rows.Err()
}

// Backup saves a copy of db beside its file, named
// <file>.backup-<YYYYMMDD-HHMMSS> in UTC, and returns the copy's path. VACUUM
// INTO reads one snapshot, so the copy is whole while other programs write.
func Backup(ctx context.Context, db *sql.DB) (string, error) {
	file, err := databaseFile(ctx, db)
	if err != nil {
		return "", fmt.Errorf("store: backup: %w", err)
	}
	base := file + ".backup-" + time.Now().UTC().Format("20060102-150405")
	for attempt := 1; attempt <= backupAttempts; attempt++ {
		path := base
		if attempt > 1 {
			path = base + "-" + strconv.Itoa(attempt)
		}
		if _, err = db.ExecContext(ctx, "VACUUM INTO ?", path); err == nil {
			return path, nil
		}
		// Programs that start together can save their copies in the same
		// second, and VACUUM INTO refuses a file that exists.
		if _, statErr := os.Stat(path); statErr != nil {
			break
		}
	}
	return "", fmt.Errorf("store: backup: %w", err)
}

func databaseFile(ctx context.Context, db *sql.DB) (string, error) {
	rows, err := db.QueryContext(ctx, "PRAGMA database_list")
	if err != nil {
		return "", err
	}
	defer rows.Close()
	for rows.Next() {
		var (
			seq        int64
			name, file string
		)
		if err := rows.Scan(&seq, &name, &file); err != nil {
			return "", err
		}
		if name == "main" && file != "" {
			return file, nil
		}
	}
	if err := rows.Err(); err != nil {
		return "", err
	}
	return "", errors.New("the database has no file")
}
