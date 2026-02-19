package storage

import "database/sql"

type NewUser struct{}

type User struct{}

type UserService interface {
	Create(*NewUser) error

	ReadById(int) (*User, error)
}

type userServiceImpl struct {
	db *sql.DB
}

func newUserService(db *sql.DB) UserService {
	return &userServiceImpl{db: db}
}

func (s *userServiceImpl) Create(*NewUser) error {
	return nil
}

func (s *userServiceImpl) ReadById(int) (*User, error) {
	return nil, nil
}
