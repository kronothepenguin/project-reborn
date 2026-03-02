package storage

import "database/sql"

type Storage struct {
	User UserService
}

func New(db *sql.DB) *Storage {
	return &Storage{
		User: newUserService(db),
	}
}
