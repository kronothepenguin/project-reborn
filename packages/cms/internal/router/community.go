package router

import (
	"context"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
)

// community holds what the community layout reads. Only users who pass
// maintenance can see SiteClosed set.
type community struct {
	hotelStatus
	SignedIn      bool
	Habbo         string
	SeveralHabbos bool
	SiteClosed    bool
}

func (r *Router) community(ctx context.Context) (community, error) {
	page := community{hotelStatus: r.hotelStatus(ctx), SiteClosed: settings.Bool(ctx, r.deps.Queries, "site.maintenance")}
	session, ok := auth.FromContext(ctx)
	if !ok {
		return page, nil
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return page, err
	}
	habbos, err := r.deps.Queries.ListUserAvatars(ctx, session.UserID)
	if err != nil {
		return page, err
	}
	page.SignedIn, page.Habbo, page.SeveralHabbos = true, avatar.Name, len(habbos) > 1
	return page, nil
}

// The lengths of Holo's community page: the habbos on its grid, and the news
// promo's two turning stories and two more.
const (
	randomHabbosShown = 18
	topStoriesShown   = 2
	newsPromoShown    = 4
)

type communityPage struct {
	community
	ImagingURL   string
	RandomHabbos []randomHabbo
	TopStories   []topStory
	MoreNews     []newsLink
	Cloud        []cloudTag
	Banners      []banner
}

type randomHabbo struct {
	Name    string
	Figure  string
	Created string
	Motto   string
}

type topStory struct {
	ID      int64
	Title   string
	Summary string
	Image   string
}

type banner struct {
	Text  string
	Image string
	Link  string
}

// HandleCommunityView handles GET /community, community.php: random habbos, the
// news promo, the tag cloud and the banners. Holo's recommended rooms wait for
// the game server.
func (r *Router) HandleCommunityView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := communityPage{community: shared, ImagingURL: settings.String(ctx, r.deps.Queries, "imaging.avatarUrl")}
	avatars, err := r.deps.Queries.ListRandomAvatars(ctx, randomHabbosShown)
	if err != nil {
		r.fail(w, err)
		return
	}
	for _, avatar := range avatars {
		page.RandomHabbos = append(page.RandomHabbos, randomHabbo{
			Name:    avatar.Name,
			Figure:  avatar.Figure,
			Created: avatar.CreatedAt.UTC().Format(createdFormat),
			Motto:   avatar.Motto,
		})
	}
	if page.TopStories, page.MoreNews, err = r.newsPromo(ctx); err != nil {
		r.fail(w, err)
		return
	}
	if page.Cloud, err = r.tagCloud(ctx); err != nil {
		r.fail(w, err)
		return
	}
	if page.Banners, err = r.banners(ctx); err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "community.html", page)
}

// newsPromo is includes/news_headlines.php: the two newest articles turn as top
// stories, and the next two are listed. Holo printed empty items when there were
// fewer articles; these lists just hold fewer.
func (r *Router) newsPromo(ctx context.Context) (top []topStory, more []newsLink, err error) {
	articles, err := r.deps.Queries.ListLatestNewsArticles(ctx, newsPromoShown)
	if err != nil {
		return nil, nil, err
	}
	for i, article := range articles {
		if i < topStoriesShown {
			top = append(top, topStory{ID: article.ID, Title: article.Title, Summary: article.Summary, Image: article.ImageURL})
			continue
		}
		more = append(more, newsLink{ID: article.ID, Title: article.Title, Date: article.PublishedAt.UTC().Format(newsDateFormat)})
	}
	return top, more, nil
}

// banners are the enabled banners of Holo's ad column, in their order.
func (r *Router) banners(ctx context.Context) ([]banner, error) {
	rows, err := r.deps.Queries.ListEnabledBanners(ctx)
	if err != nil {
		return nil, err
	}
	banners := make([]banner, 0, len(rows))
	for _, row := range rows {
		banners = append(banners, banner{Text: row.Title, Image: row.ImageURL, Link: row.LinkURL})
	}
	return banners, nil
}
