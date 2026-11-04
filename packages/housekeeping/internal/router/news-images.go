package router

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"image"
	"image/gif"
	"image/png"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A top story is 300x187, the box of the CMS's news promo.
const (
	newsImageWidth  = 300
	newsImageHeight = 187
	newsImagesPath  = "/news/images/"
)

const (
	// maxNewsImageBytes leaves room for a long animated GIF; the editor's PNGs
	// are far smaller.
	maxNewsImageBytes = 2 << 20
	// maxGIFFrames bounds what gif.DecodeAll keeps: a frame of 300x187 can take a
	// few hundred bytes of the upload and 56 KB once decoded.
	maxGIFFrames = 500
)

const (
	imageTooBig  = "The image must be at most 2 MB."
	imageInvalid = "The image must be a PNG or a GIF of 300x187 pixels."
	imageTooLong = "The GIF must have at most 500 frames."
)

// The blocks of a GIF after its header, by their first byte.
const (
	gifExtension = 0x21
	gifImage     = 0x2c
	gifTrailer   = 0x3b
)

type imageAnswer struct {
	Path  string `json:"path,omitempty"`
	Error string `json:"error,omitempty"`
}

// newsImagePath is the address the CMS serves an uploaded image at.
func newsImagePath(id int64, format string) string {
	return fmt.Sprintf("%s%d.%s", newsImagesPath, id, format)
}

// uploadedImage reports whether address is the path of an image that was
// uploaded, in the one form the CMS serves it at.
func (r *Router) uploadedImage(ctx context.Context, address string) (bool, error) {
	name, ok := strings.CutPrefix(address, newsImagesPath)
	if !ok {
		return false, nil
	}
	number, _, _ := strings.Cut(name, ".")
	id, err := strconv.ParseInt(number, 10, 64)
	if err != nil || id <= 0 {
		return false, nil
	}
	stored, err := r.deps.Queries.GetImage(ctx, id)
	switch {
	case store.IsNotFound(err):
		return false, nil
	case err != nil:
		return false, err
	}
	return newsImagePath(id, stored.Format) == address, nil
}

// reencode keeps only the pixels of a 300x187 PNG, or the frames and timing of a
// 300x187 GIF, so that nothing else the file carried reaches the CMS. It answers
// the format and the new bytes, or why the image was refused.
func reencode(data []byte) (format string, encoded []byte, refusal string) {
	config, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil || (format != "png" && format != "gif") || config.Width != newsImageWidth || config.Height != newsImageHeight {
		return "", nil, imageInvalid
	}
	var out bytes.Buffer
	switch format {
	case "png":
		picture, err := png.Decode(bytes.NewReader(data))
		if err != nil {
			return "", nil, imageInvalid
		}
		if err := png.Encode(&out, picture); err != nil {
			return "", nil, imageInvalid
		}
	case "gif":
		frames, ok := gifFrames(data)
		if !ok {
			return "", nil, imageInvalid
		}
		if frames > maxGIFFrames {
			return "", nil, imageTooLong
		}
		animation, err := gif.DecodeAll(bytes.NewReader(data))
		if err != nil {
			return "", nil, imageInvalid
		}
		if err := gif.EncodeAll(&out, animation); err != nil {
			return "", nil, imageInvalid
		}
	}
	return format, out.Bytes(), ""
}

// gifFrames counts the frames of a GIF by walking its blocks, without decoding
// them, and reports false for a file whose blocks do not hold together. The
// header is the signature, the version and the logical screen descriptor; an
// extension is its label and sub-blocks; an image is a descriptor of 10 bytes,
// its color table, the minimum code size of its data and the data in sub-blocks.
func gifFrames(data []byte) (int, bool) {
	const header = 13
	if len(data) < header {
		return 0, false
	}
	at := header + colorTableSize(data[10])
	frames := 0
	for at >= 0 && at < len(data) {
		switch data[at] {
		case gifExtension:
			at = skipSubBlocks(data, at+2)
		case gifImage:
			if at+10 > len(data) {
				return 0, false
			}
			frames++
			at = skipSubBlocks(data, at+10+colorTableSize(data[at+9])+1)
		case gifTrailer:
			return frames, true
		default:
			return 0, false
		}
	}
	return 0, false
}

// colorTableSize is the length of the color table that flags announce.
func colorTableSize(flags byte) int {
	if flags&0x80 == 0 {
		return 0
	}
	return 3 << (flags&0x07 + 1)
}

// skipSubBlocks returns where the sub-blocks at at end, or -1 when they run past
// data.
func skipSubBlocks(data []byte, at int) int {
	for at < len(data) {
		size := int(data[at])
		at++
		if size == 0 {
			return at
		}
		at += size
	}
	return -1
}

// HandleNewsImageUpload handles POST /housekeeping/news/images, whose body is the
// picture of the news form's editor. It answers the image's path on the site as
// JSON, which the form puts in the topstory field.
func (r *Router) HandleNewsImageUpload(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	data, err := io.ReadAll(http.MaxBytesReader(w, req.Body, maxNewsImageBytes))
	var tooBig *http.MaxBytesError
	switch {
	case errors.As(err, &tooBig):
		r.answerJSON(w, http.StatusRequestEntityTooLarge, imageAnswer{Error: imageTooBig})
		return
	case err != nil:
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	format, encoded, refusal := reencode(data)
	if refusal != "" {
		r.answerJSON(w, http.StatusUnprocessableEntity, imageAnswer{Error: refusal})
		return
	}

	session, _ := auth.FromContext(ctx)
	var path string
	err = r.inTx(ctx, func(q *store.Queries) error {
		id, err := q.CreateImage(ctx, store.CreateImageParams{
			Format:          format,
			Data:            encoded,
			Width:           newsImageWidth,
			Height:          newsImageHeight,
			CreatedAt:       time.Now().UTC(),
			CreatedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
		})
		if err != nil {
			return err
		}
		path = newsImagePath(id, format)
		return writeLog(req, q, staffLog{action: actionNewsImage, detail: path})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, imageAnswer{Path: path})
}
