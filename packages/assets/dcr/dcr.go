// Package dcr keeps the client's external variables and texts in the database
// and writes them out as the files the client reads.
package dcr

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io/fs"
	"regexp"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	variablesFile = "external_variables.txt"
	textsFile     = "external_texts.txt"
)

// The client reads both files as UTF-8 with CRLF line ends. The texts start
// with a byte order mark and end with a line end; the variables have neither.
const (
	bom     = "\xef\xbb\xbf"
	lineEnd = "\r\n"
)

// Hotel is what the written files take from the hotel.
type Hotel struct {
	URL       string // the site's address
	ShortName string // the site's short name
	Version   int    // game.clientVersion
}

type line struct{ key, value string }

// Import copies external_variables.txt and external_texts.txt of files into the database.
func Import(ctx context.Context, q *store.Queries, files fs.FS) error {
	variables, err := readLines(files, variablesFile)
	if err != nil {
		return err
	}
	texts, err := readLines(files, textsFile)
	if err != nil {
		return err
	}

	if err := q.DeleteDCRVariables(ctx); err != nil {
		return err
	}
	for _, l := range variables {
		if err := q.PutDCRVariable(ctx, store.PutDCRVariableParams{Key: l.key, Value: l.value}); err != nil {
			return err
		}
	}
	if err := q.DeleteDCRTexts(ctx); err != nil {
		return err
	}
	for _, l := range texts {
		if err := q.PutDCRText(ctx, store.PutDCRTextParams{Key: l.key, Value: l.value}); err != nil {
			return err
		}
	}
	return nil
}

func readLines(files fs.FS, name string) ([]line, error) {
	data, err := fs.ReadFile(files, name)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, fmt.Errorf("dcr: %s is missing: %w", name, err)
	}
	if err != nil {
		return nil, fmt.Errorf("dcr: read %s: %w", name, err)
	}
	data = bytes.TrimPrefix(data, []byte(bom))

	var lines []line
	for text := range strings.SplitSeq(string(data), "\n") {
		text = strings.TrimSuffix(text, "\r")
		if text == "" {
			continue
		}
		key, value, _ := strings.Cut(text, "=")
		lines = append(lines, line{key, value})
	}
	return lines, nil
}

// Variables writes external_variables.txt for the client.
func Variables(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error) {
	rows, err := q.ListDCRVariables(ctx)
	if err != nil {
		return nil, err
	}
	generated := generatedVariables(hotel)
	values := make(map[string]string, len(generated))
	for _, l := range generated {
		values[l.key] = l.value
	}

	var b bytes.Buffer
	write := func(key, value string) {
		if b.Len() > 0 {
			b.WriteString(lineEnd)
		}
		b.WriteString(key + "=" + value)
	}
	for _, row := range rows {
		value, ok := values[row.Key]
		if !ok {
			value = row.Value
		}
		write(row.Key, value)
		delete(values, row.Key)
	}
	for _, l := range generated {
		if value, ok := values[l.key]; ok {
			write(l.key, value)
		}
	}
	return b.Bytes(), nil
}

// generatedVariables are the ten lines Go always writes: the addresses of the
// files the client loads, which must exist or the client stalls, and the
// version the game server expects.
func generatedVariables(hotel Hotel) []line {
	base := strings.TrimRight(hotel.URL, "/")
	dcr := base + "/dcr/"
	images := base + "/c_images/"
	return []line{
		{"external.figurepartlist.txt", dcr + "figuredata.txt"},
		{"external.figurepartlist.txt.secure", dcr + "figuredata.txt"},
		{"figure.draworder.xml", dcr + "draworder.xml"},
		{"figure.draworder.xml.secure", dcr + "draworder.xml"},
		{"figure.animation.xml", dcr + "animation.xml"},
		{"figure.partsets.xml", dcr + "partsets.xml"},
		{"dynamic.download.url", dcr + "hof_furni/"},
		{"image.library.url", images},
		{"private.image.library.url", images},
		{"client.version.id", strconv.Itoa(hotel.Version)},
	}
}

// habboWord matches "Habbo" with the letters that follow it.
var habboWord = regexp.MustCompile(`Habbo\pL*`)

// shortName writes the hotel's short name for the word Habbo, its plural and
// its possessive, and keeps a longer word such as Habboween.
func shortName(value, name string) string {
	return habboWord.ReplaceAllStringFunc(value, func(word string) string {
		if word == "Habbo" || word == "Habbos" {
			return name + word[len("Habbo"):]
		}
		return word
	})
}

// Texts writes external_texts.txt for the client.
func Texts(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error) {
	rows, err := q.ListDCRTexts(ctx)
	if err != nil {
		return nil, err
	}
	var b bytes.Buffer
	b.WriteString(bom)
	for _, row := range rows {
		b.WriteString(row.Key + "=" + shortName(row.Value, hotel.ShortName) + lineEnd)
	}
	return b.Bytes(), nil
}
