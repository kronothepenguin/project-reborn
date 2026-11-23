package setup

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// clientFiles are the files dcr.Import reads.
var clientFiles = []string{"external_variables.txt", "external_texts.txt"}

// ClientFile is one of the client's files in the client's folder.
type ClientFile struct {
	Name  string
	Found bool
	// Lines counts the lines that are not empty, the ones dcr.Import saves.
	Lines int
}

// ClientFolder is the folder the client files step reads: <assets.path>/dcr.
func (s *State) ClientFolder() string {
	installation, _ := s.Current()
	return filepath.Join(installation.Config.Assets.Path, "dcr")
}

// ClientFiles lists the client's files in the client's folder, each found or
// missing.
func (s *State) ClientFiles() ([]ClientFile, error) {
	folder := s.ClientFolder()
	files := make([]ClientFile, 0, len(clientFiles))
	for _, name := range clientFiles {
		data, err := os.ReadFile(filepath.Join(folder, name))
		if errors.Is(err, fs.ErrNotExist) {
			files = append(files, ClientFile{Name: name})
			continue
		}
		if err != nil {
			return nil, fmt.Errorf("setup: %w", err)
		}
		lines := 0
		for line := range bytes.Lines(bytes.TrimPrefix(data, []byte("\xef\xbb\xbf"))) {
			if len(bytes.TrimRight(line, "\r\n")) > 0 {
				lines++
			}
		}
		files = append(files, ClientFile{Name: name, Found: true, Lines: lines})
	}
	return files, nil
}

// ImportClientFiles replaces the client's variables and texts in the database
// with those of the client's folder, in one transaction. A missing file
// imports nothing, and the error wraps fs.ErrNotExist.
func (s *State) ImportClientFiles(ctx context.Context) error {
	installation, ok := s.Current()
	if !ok {
		return ErrNotConfigured
	}
	tx, err := installation.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	defer tx.Rollback()
	if err := dcr.Import(ctx, store.New(tx), os.DirFS(s.ClientFolder())); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("setup: %w", err)
	}
	return nil
}
