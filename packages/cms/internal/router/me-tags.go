package router

import (
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// tagFormat is tags_ajax.php's rule, after it lowered the tag: letters and digits,
// 2 to 20 of them.
var tagFormat = regexp.MustCompile(`^[a-z0-9]{2,20}$`)

// The answers the tag panel turns into Holo's texts.
const (
	tagInvalid = "invalid"
	tagLimit   = "limit"
)

type tagsAnswer struct {
	Tags  []string `json:"tags"`
	Error string   `json:"error,omitempty"`
}

type tagBody struct {
	Tag string `json:"tag"`
}

// HandleMeTagsAdd handles POST /me/tags: the active habbo takes a tag, its own or
// one borrowed from another profile. Holo's limit never worked, since it counted
// at most 20 rows and refused only above 20.
func (r *Router) HandleMeTagsAdd(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body tagBody
	if !readEdit(w, req, &body) {
		return
	}
	session, _ := auth.FromContext(ctx)
	profile, err := r.deps.Queries.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	tag := strings.ToLower(body.Tag)
	refusal := ""
	err = r.inTx(ctx, func(q *store.Queries) error {
		if !tagFormat.MatchString(tag) {
			refusal = tagInvalid
			return nil
		}
		count, err := q.CountProfileTags(ctx, profile.ID)
		if err != nil {
			return err
		}
		if count >= int64(settings.GetInt("homes.maxTags")) {
			refusal = tagLimit
			return nil
		}
		added, err := q.AddProfileTag(ctx, store.AddProfileTagParams{ProfileID: profile.ID, Tag: tag, CreatedAt: time.Now().UTC()})
		if err == nil && added == 0 {
			refusal = tagInvalid
		}
		return err
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answerTags(w, req, profile.ID, refusal)
}

// HandleMeTagsDelete handles POST /me/tags/{tag}/delete.
func (r *Router) HandleMeTagsDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	profile, err := r.deps.Queries.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if _, err := r.deps.Queries.DeleteProfileTag(ctx, store.DeleteProfileTagParams{ProfileID: profile.ID, Tag: req.PathValue("tag")}); err != nil {
		r.fail(w, err)
		return
	}
	r.answerTags(w, req, profile.ID, "")
}

// answerTags answers with the profile's tags, as Holo's panel showed them again
// after every change.
func (r *Router) answerTags(w http.ResponseWriter, req *http.Request, profileID int64, refusal string) {
	tags, err := r.deps.Queries.ListProfileTags(req.Context(), profileID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if tags == nil {
		tags = []string{}
	}
	status := http.StatusOK
	if refusal != "" {
		status = http.StatusUnprocessableEntity
	}
	r.answerJSON(w, status, tagsAnswer{Tags: tags, Error: refusal})
}
