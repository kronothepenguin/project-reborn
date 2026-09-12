package store

import (
	"database/sql"
	"errors"

	sqlite "modernc.org/sqlite"
)

const (
	sqliteBusy                 = 5
	sqliteLocked               = 6
	sqliteConstraintPrimaryKey = 1555
	sqliteConstraintUnique     = 2067
	sqliteConstraintForeignKey = 787
)

// IsNotFound reports whether err means a queried row does not exist.
func IsNotFound(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

// IsConflict reports whether err is a unique or primary-key constraint
// violation.
func IsConflict(err error) bool {
	var serr *sqlite.Error
	if !errors.As(err, &serr) {
		return false
	}
	code := serr.Code()
	return code == sqliteConstraintUnique || code == sqliteConstraintPrimaryKey
}

// IsForeignKey reports whether err is a foreign-key constraint violation.
func IsForeignKey(err error) bool {
	var serr *sqlite.Error
	if !errors.As(err, &serr) {
		return false
	}
	return serr.Code() == sqliteConstraintForeignKey
}

// IsBusy reports whether err means the database was busy or locked past the
// busy timeout.
func IsBusy(err error) bool {
	var serr *sqlite.Error
	if !errors.As(err, &serr) {
		return false
	}
	primary := serr.Code() & 0xff
	return primary == sqliteBusy || primary == sqliteLocked
}
