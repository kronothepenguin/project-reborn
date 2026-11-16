---
type: Go Package
title: dcr
description: Copies the client's external_variables.txt and external_texts.txt into dcr_variables and dcr_texts, and writes them out for the client with the hotel's addresses, client version and short name.
resource: packages/assets/dcr
---

# What it is

`packages/assets/dcr` keeps the client's external variables and texts in the database, in `dcr_variables` and
`dcr_texts`. The files are where the rows come from; the client is served from the rows.

```go
func Import(ctx context.Context, q *store.Queries, files fs.FS) error

type Hotel struct {
	URL       string // the site's address
	ShortName string // the site's short name
	Version   int    // game.clientVersion
}

func Variables(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)
func Texts(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)
```

# Import

- `Import` reads `external_variables.txt` and `external_texts.txt` of `files` first. A missing file is an error that
  names it and wraps `fs.ErrNotExist`, and nothing is written.
- Then it replaces every row of both tables with the files' lines. Run it in a transaction, with `q.WithTx(tx)`, so a
  failure keeps the rows as they were.
- A line is `key=value`, split at the first `=`. A line without `=` is a key with an empty value. Empty lines are
  skipped. A key that comes twice keeps its first place and its last value, as the client reads it.
- Lines that start with `#` are rows too: the client skips them, and they are written out again.
- The rows keep the files' order, through `id`.

# The written files

The client reads both files as UTF-8 with CRLF line ends (`client.textdata.utf8=1` makes it decode the texts as
UTF-8). A file imported and written out with nothing to replace gives the same bytes:

| File | Start | Line end | Last line |
| --- | --- | --- | --- |
| `external_variables.txt` | no byte order mark | CRLF | no line end |
| `external_texts.txt` | UTF-8 byte order mark | CRLF | ends with CRLF |

`Variables` writes the rows, and always writes these ten lines in place of what the rows hold; a line the rows lack
goes at the end:

| Key | Value |
| --- | --- |
| `external.figurepartlist.txt`, `external.figurepartlist.txt.secure` | `<URL>/dcr/figuredata.txt` |
| `figure.draworder.xml`, `figure.draworder.xml.secure` | `<URL>/dcr/draworder.xml` |
| `figure.animation.xml` | `<URL>/dcr/animation.xml` |
| `figure.partsets.xml` | `<URL>/dcr/partsets.xml` |
| `dynamic.download.url` | `<URL>/dcr/hof_furni/` |
| `image.library.url`, `private.image.library.url` | `<URL>/c_images/` |
| `client.version.id` | `hotel.Version` |

The client stalls unless the nine addresses point at files that exist, and the game refuses a client version other
than its own.

`Texts` writes the word `Habbo` in a value as `hotel.ShortName`: alone, as `Habbos`, as `Habbo's`, and before a
hyphen or punctuation. A letter right after it, other than the plural's `s`, keeps the word: `Habboween` and
`Habbosphere` stay. Keys and lowercase `habbo` stay.

# Examples

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil {
	return err
}
defer tx.Rollback()
if err := dcr.Import(ctx, q.WithTx(tx), os.DirFS(filepath.Join(cfg.Assets.Path, "dcr"))); err != nil {
	return err
}
return tx.Commit()
```
