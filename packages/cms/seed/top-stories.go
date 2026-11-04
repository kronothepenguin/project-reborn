package seed

import "slices"

// DefaultTopStory is the picture a new article starts with.
const DefaultTopStory = "/web-gallery/images/top-story/top_story_news.png"

// Holo's own top-story images, which no Holo page used, 300x187 each.
var topStories = []string{
	"/web-gallery/images/top-story/accessories_top.gif",
	"/web-gallery/images/top-story/top_story_news.png",
	"/web-gallery/images/top-story/top_story_newsflash.png",
	"/web-gallery/images/top-story/top_story_poll2.png",
	"/web-gallery/images/top-story/topstory_accessories2.gif",
}

// TopStories returns the addresses, in the CMS's public files, of the top-story
// pictures the news form offers.
func TopStories() []string {
	return slices.Clone(topStories)
}
