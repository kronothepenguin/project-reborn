package transport

import (
	"net/http"

	"golang.org/x/net/websocket"
)

type wsConn struct {
	*websocket.Conn
}

func (c *wsConn) RemoteAddr() string {
	return c.Request().RemoteAddr
}

type WebSocket struct {
	handler Handler
}

func NewWebSocket() *WebSocket {
	return &WebSocket{}
}

func (ws *WebSocket) Handle(handler Handler) {
	ws.handler = handler
}

// Mount registers the WebSocket handler on the given mux at the specified pattern.
func (ws *WebSocket) Mount(mux *http.ServeMux, pattern string) {
	mux.Handle(pattern, websocket.Handler(func(conn *websocket.Conn) {
		ws.handler(&wsConn{conn})
	}))
}
