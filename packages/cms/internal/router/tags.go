package router

import (
	"context"
	"math"
	"net/http"
	"net/url"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The lengths of Holo's lists: the cloud and a search.
const (
	tagCloudSize  = 20
	tagSearchSize = 20
)

type cloudTag struct {
	Tag string
	// Size is a percentage of the font size.
	Size int
}

type tagsPage struct {
	community
	ImagingURL string
	Cloud      []cloudTag
	TagFight   bool
	// Searched is a search for Tag, which Holo counted in the box's title.
	Searched bool
	Tag      string
	Results  []tagResult
	// CanTag offers the active habbo the tag it searched: one that P3's rules
	// allow, that it lacks and has room for.
	CanTag bool
}

type tagResult struct {
	Name   string
	Figure string
	Motto  string
	Tags   []string
}

// HandleTagsView handles GET /tags, tags.php: the cloud, the tag fight, and with
// ?tag= the habbos that carry the tag.
func (r *Router) HandleTagsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := tagsPage{
		community:  shared,
		ImagingURL: settings.String(ctx, r.deps.Queries, "imaging.avatarUrl"),
		TagFight:   settings.Bool(ctx, r.deps.Queries, "features.tagFight"),
		Tag:        strings.ToLower(req.URL.Query().Get("tag")),
	}
	if page.Cloud, err = r.tagCloud(ctx); err != nil {
		r.fail(w, err)
		return
	}
	if page.Tag != "" {
		page.Searched = true
		if page.Results, err = r.tagResults(ctx, page.Tag); err != nil {
			r.fail(w, err)
			return
		}
		if page.CanTag, err = r.canTag(ctx, page.Tag); err != nil {
			r.fail(w, err)
			return
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "tags.html", page)
}

// HandleTagsAdd handles POST /tags, Holo's "Tag yourself with": the active habbo
// takes the tag it searched and sees the search again. A tag the rules refuse
// is left out quietly, as Holo's was.
func (r *Router) HandleTagsAdd(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	tag := strings.ToLower(req.PostFormValue("tag"))
	profile, err := r.deps.Queries.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if _, err := r.addProfileTag(ctx, profile.ID, tag); err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/tags?tag="+url.QueryEscape(tag), http.StatusSeeOther)
}

// tagCloud is tagcloud.php: tags at random, sized from 100% for the least
// carried to 200% for the most, with Holo's arithmetic.
func (r *Router) tagCloud(ctx context.Context) ([]cloudTag, error) {
	rows, err := r.deps.Queries.ListTagCloud(ctx, tagCloudSize)
	if err != nil || len(rows) == 0 {
		return nil, err
	}
	least, most := rows[0].Habbos, rows[0].Habbos
	for _, row := range rows {
		least, most = min(least, row.Habbos), max(most, row.Habbos)
	}
	step := 100 / float64(max(most-least, 1))
	cloud := make([]cloudTag, 0, len(rows))
	for _, row := range rows {
		cloud = append(cloud, cloudTag{Tag: row.Tag, Size: int(math.Ceil(100 + float64(row.Habbos-least)*step))})
	}
	return cloud, nil
}

func (r *Router) tagResults(ctx context.Context, tag string) ([]tagResult, error) {
	rows, err := r.deps.Queries.ListTaggedAvatars(ctx, store.ListTaggedAvatarsParams{Tag: tag, RowLimit: tagSearchSize})
	if err != nil {
		return nil, err
	}
	results := make([]tagResult, 0, len(rows))
	for _, row := range rows {
		tags, err := r.deps.Queries.ListProfileTags(ctx, row.ProfileID)
		if err != nil {
			return nil, err
		}
		results = append(results, tagResult{Name: row.Name, Figure: row.Figure, Motto: row.Motto, Tags: tags})
	}
	return results, nil
}

func (r *Router) canTag(ctx context.Context, tag string) (bool, error) {
	session, ok := auth.FromContext(ctx)
	if !ok || !tagFormat.MatchString(tag) {
		return false, nil
	}
	profile, err := r.deps.Queries.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		return false, err
	}
	tags, err := r.deps.Queries.ListProfileTags(ctx, profile.ID)
	if err != nil {
		return false, err
	}
	return len(tags) < settings.Int(ctx, r.deps.Queries, "homes.maxTags") && !slices.Contains(tags, tag), nil
}
