package store

import (
	"context"
	"database/sql"
	"fmt"
)

// Tx is a unit of work: it embeds the generated typed operations bound to a
// single transaction, so all operations performed through it share the same
// atomic unit. Changes become visible to other connections only after Commit.
type Tx struct {
	*Queries

	tx *sql.Tx
}

// Begin starts a transaction. All operations performed through the returned
// Tx use the same transaction.
func (s *Store) Begin(ctx context.Context) (*Tx, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("store: begin transaction: %w", err)
	}
	return &Tx{Queries: s.Queries.WithTx(tx), tx: tx}, nil
}

// Commit makes every change in the unit visible to other connections.
func (tx *Tx) Commit() error {
	return tx.tx.Commit()
}

// Rollback undoes every change in the unit.
func (tx *Tx) Rollback() error {
	return tx.tx.Rollback()
}
