// Package api is the client of the game's /api/, for the programs run apart
// from the game (decision reborn/0005).
package api

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/services"
)

// Client calls the game's /api/ at a base URL with the hotel's secret.
type Client struct {
	baseURL string
	secret  string
	http    *http.Client
}

// Client is the Habbos service of a program run apart from the game.
var _ services.Habbos = (*Client)(nil)

// New returns a client of the /api/ at baseURL, such as http://localhost:15445,
// that sends secret, the hotel's api_secret, and gives up after 2 seconds.
func New(baseURL, secret string) *Client {
	return &Client{baseURL: baseURL, secret: secret, http: &http.Client{Timeout: 2 * time.Second}}
}

// SendLook tells the game that the habbo avatarID has a new look or motto.
func (c *Client) SendLook(ctx context.Context, avatarID int64) error {
	url := c.baseURL + "/api/habbos/" + strconv.FormatInt(avatarID, 10) + "/look"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return fmt.Errorf("api: %w", err)
	}
	req.Header.Set("X-Reborn-Secret", c.secret)
	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("api: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusNoContent {
		return fmt.Errorf("api: POST %s: %s", url, res.Status)
	}
	return nil
}
