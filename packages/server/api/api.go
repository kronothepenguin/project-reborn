// Package api is the client of the game's /api/, for the programs run apart
// from the game (decision reborn/0005).
package api

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Client calls the game's /api/ at a base URL with the hotel's secret, read
// from the database on each call.
type Client struct {
	baseURL string
	db      *sql.DB
	http    *http.Client
}

// Client is the Habbos and the Hotel service of a program run apart from the
// game.
var (
	_ services.Habbos = (*Client)(nil)
	_ services.Hotel  = (*Client)(nil)
)

// A call gives up after callTimeout, and Stop, which waits for the game to
// hold each connection open after its notice, after stopTimeout.
const (
	callTimeout = 2 * time.Second
	stopTimeout = 15 * time.Second
)

// New returns a client of the /api/ at baseURL, such as http://localhost:15445,
// that sends the hotel's api_secret, read from db on each call, and gives up
// after 2 seconds, or 15 for Stop.
func New(baseURL string, db *sql.DB) *Client {
	return &Client{baseURL: baseURL, db: db, http: &http.Client{}}
}

// SendLook tells the game that the habbo avatarID has a new look or motto.
func (c *Client) SendLook(ctx context.Context, avatarID int64) error {
	return c.call(ctx, http.MethodPost, "/api/habbos/"+strconv.FormatInt(avatarID, 10)+"/look", nil)
}

// Status asks the game whether its doors are open and how many habbos are in
// the hotel.
func (c *Client) Status(ctx context.Context) (services.HotelStatus, error) {
	var status struct {
		Running bool `json:"running"`
		Online  int  `json:"online"`
	}
	if err := c.call(ctx, http.MethodGet, "/api/hotel", &status); err != nil {
		return services.HotelStatus{}, err
	}
	return services.HotelStatus{Running: status.Running, Online: status.Online}, nil
}

// Start tells the game to open its doors.
func (c *Client) Start(ctx context.Context) error {
	return c.call(ctx, http.MethodPost, "/api/hotel/start", nil)
}

// Stop tells the game to close its doors, and returns once it has, which takes about 5 seconds while anybody is
// connected. It gives up after 15 seconds.
func (c *Client) Stop(ctx context.Context) error {
	return c.callWithin(ctx, stopTimeout, http.MethodPost, "/api/hotel/stop", nil)
}

// AreOnline asks the game which of ids are in the hotel.
func (c *Client) AreOnline(ctx context.Context, ids []int64) (map[int64]bool, error) {
	fields := make([]string, len(ids))
	for i, id := range ids {
		fields[i] = strconv.FormatInt(id, 10)
	}
	online := map[int64]bool{}
	query := url.Values{"ids": {strings.Join(fields, ",")}}
	if err := c.call(ctx, http.MethodGet, "/api/habbos/online?"+query.Encode(), &online); err != nil {
		return nil, err
	}
	return online, nil
}

// Online asks the game for the habbos in the hotel.
func (c *Client) Online(ctx context.Context) ([]int64, error) {
	var ids []int64
	if err := c.call(ctx, http.MethodGet, "/api/habbos/online", &ids); err != nil {
		return nil, err
	}
	return ids, nil
}

// call makes one call with the secret, within callTimeout.
func (c *Client) call(ctx context.Context, method, path string, out any) error {
	return c.callWithin(ctx, callTimeout, method, path, out)
}

// callWithin makes one call with the secret, and gives up after timeout. With
// out nil it expects 204, and otherwise 200 with JSON, which it reads into out.
func (c *Client) callWithin(ctx context.Context, timeout time.Duration, method, path string, out any) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	secret, err := store.New(c.db).GetAPISecret(ctx)
	if err != nil {
		return fmt.Errorf("api: the secret: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, nil)
	if err != nil {
		return fmt.Errorf("api: %w", err)
	}
	req.Header.Set("X-Reborn-Secret", secret)
	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("api: %w", err)
	}
	defer res.Body.Close()
	want := http.StatusOK
	if out == nil {
		want = http.StatusNoContent
	}
	if res.StatusCode != want {
		return fmt.Errorf("api: %s %s: %s", method, path, res.Status)
	}
	if out == nil {
		return nil
	}
	if err := json.UnmarshalRead(res.Body, out); err != nil {
		return fmt.Errorf("api: %s %s: %w", method, path, err)
	}
	return nil
}
